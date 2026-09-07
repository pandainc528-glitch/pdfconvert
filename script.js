// URL de tu Cloudflare Worker (la obtienes al desplegarlo, ver worker/README.md)
const WORKER_URL = "https://tu-worker.tu-subdominio.workers.dev";

const formatoOrigen = document.getElementById('formatoOrigen');
const formatoSalida = document.getElementById('formatoSalida');
const dropzone = document.getElementById('dropzone');
const archivoInput = document.getElementById('archivoInput');
const nombreArchivo = document.getElementById('nombreArchivo');
const btnConvertir = document.getElementById('btnConvertir');
const resultado = document.getElementById('resultado');

let archivoSeleccionado = null;

// --- Abrir selector de archivos al hacer click en la zona ---
dropzone.addEventListener('click', () => archivoInput.click());

archivoInput.addEventListener('change', () => {
  if (archivoInput.files.length) {
    seleccionarArchivo(archivoInput.files[0]);
  }
});

// --- Drag & drop ---
['dragenter', 'dragover'].forEach(evt => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(evt => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', (e) => {
  const archivo = e.dataTransfer.files[0];
  if (archivo) seleccionarArchivo(archivo);
});

function seleccionarArchivo(archivo) {
  archivoSeleccionado = archivo;
  nombreArchivo.textContent = archivo.name;
  actualizarBoton();
}

// --- Habilitar el botón solo cuando todo está listo ---
[formatoOrigen, formatoSalida].forEach(el => el.addEventListener('change', actualizarBoton));

function actualizarBoton() {
  const listo = formatoOrigen.value && formatoSalida.value && archivoSeleccionado;
  btnConvertir.disabled = !listo;
}

function mostrarMensaje(tipo, texto, html = '') {
  resultado.innerHTML = `<div class="msg ${tipo}">${texto}${html}</div>`;
}

// --- Enviar al Worker y convertir ---
btnConvertir.addEventListener('click', async () => {
  if (!archivoSeleccionado) return;

  btnConvertir.disabled = true;
  btnConvertir.textContent = 'Convirtiendo…';
  mostrarMensaje('info', 'Convirtiendo tu archivo, esto puede tardar unos segundos…');

  try {
    const formData = new FormData();
    formData.append('archivo', archivoSeleccionado);
    formData.append('formato_origen', formatoOrigen.value);
    formData.append('formato_salida', formatoSalida.value);

    const res = await fetch(`${WORKER_URL}/convertir`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.mensaje || 'No se pudo convertir el archivo.');
    }

    const data = await res.json();

    mostrarMensaje(
      'success',
      '¡Listo! Tu archivo fue convertido correctamente.',
      `<br><a class="descargar" href="${data.url}" target="_blank" rel="noopener">Descargar archivo convertido</a>`
    );

  } catch (error) {
    mostrarMensaje('error', error.message || 'Ocurrió un error al convertir el archivo.');
  } finally {
    btnConvertir.disabled = false;
    btnConvertir.textContent = 'Convertir archivo';
  }
});
