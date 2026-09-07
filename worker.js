// ============================================================
// Cloudflare Worker: puente seguro entre el frontend y CloudConvert
// La API key vive aquí como variable de entorno, nunca en el navegador.
// ============================================================

const ALLOWED_ORIGIN = "https://TU-USUARIO.github.io"; // <-- cambia esto por tu dominio de GitHub Pages

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonError(mensaje, status = 400) {
  return new Response(JSON.stringify({ mensaje }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/convertir" || request.method !== "POST") {
      return jsonError("Ruta no encontrada.", 404);
    }

    if (!env.CLOUDCONVERT_API_KEY) {
      return jsonError("Falta configurar CLOUDCONVERT_API_KEY en el Worker.", 500);
    }

    try {
      const formData = await request.formData();
      const archivo = formData.get("archivo");
      const formatoSalida = formData.get("formato_salida");

      if (!archivo || !formatoSalida) {
        return jsonError("Falta el archivo o el formato de salida.");
      }

      const headers = {
        Authorization: `Bearer ${env.CLOUDCONVERT_API_KEY}`,
        "Content-Type": "application/json",
      };

      // 1. Crear el job con tres tareas: importar, convertir, exportar
      const jobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
        method: "POST",
        headers,
        body: JSON.stringify({
          tasks: {
            "importar-archivo": { operation: "import/upload" },
            "convertir-archivo": {
              operation: "convert",
              input: "importar-archivo",
              output_format: formatoSalida,
            },
            "exportar-archivo": {
              operation: "export/url",
              input: "convertir-archivo",
            },
          },
        }),
      });

      if (!jobRes.ok) {
        const detalle = await jobRes.text();
        return jsonError(`Error al crear el trabajo en CloudConvert: ${detalle}`, 502);
      }

      const job = (await jobRes.json()).data;

      // 2. Subir el archivo a la tarea de importación
      const tareaImport = job.tasks.find((t) => t.name === "importar-archivo");
      const uploadForm = new FormData();
      Object.entries(tareaImport.result.form.parameters).forEach(([clave, valor]) => {
        uploadForm.append(clave, valor);
      });
      uploadForm.append("file", archivo, archivo.name);

      const uploadRes = await fetch(tareaImport.result.form.url, {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        return jsonError("Error al subir el archivo a CloudConvert.", 502);
      }

      // 3. Esperar a que el job termine (polling)
      const urlDescarga = await esperarJobTerminado(job.id, headers);

      return new Response(JSON.stringify({ url: urlDescarga }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });

    } catch (error) {
      return jsonError(`Error inesperado: ${error.message}`, 500);
    }
  },
};

async function esperarJobTerminado(jobId, headers) {
  const MAX_INTENTOS = 20;
  const ESPERA_MS = 2000;

  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    await new Promise((resolve) => setTimeout(resolve, ESPERA_MS));

    const res = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, { headers });
    const job = (await res.json()).data;

    if (job.status === "error") {
      throw new Error("CloudConvert no pudo completar la conversión.");
    }

    if (job.status === "finished") {
      const tareaExport = job.tasks.find((t) => t.name === "exportar-archivo");
      const archivoResultado = tareaExport.result.files[0];
      return archivoResultado.url;
    }
  }

  throw new Error("La conversión está tardando demasiado, intenta con un archivo más pequeño.");
}
