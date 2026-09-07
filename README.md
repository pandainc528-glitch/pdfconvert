# PDF Convert — guía de despliegue

Proyecto dividido en dos partes:

- `frontend/` → se despliega en **GitHub Pages** (gratis)
- `worker/` → se despliega en **Cloudflare Workers** (gratis, ahí vive tu API key oculta)

---

## 1. Cuenta en CloudConvert

1. Crea una cuenta gratis en https://cloudconvert.com
2. Ve a **Dashboard → API Keys → Create new API key**
3. Marca el permiso `task.read` y `task.write`
4. Copia la key generada (la vas a pegar en el paso 3)

---

## 2. Desplegar el Worker en Cloudflare

1. Crea una cuenta gratis en https://dash.cloudflare.com
2. Ve a **Workers & Pages → Create → Create Worker**
3. Ponle un nombre, por ejemplo `pdf-convert-api`
4. Una vez creado, entra a **Edit code** y pega el contenido de `worker/worker.js`
5. Guarda y despliega (`Deploy`)
6. Ve a **Settings → Variables and Secrets → Add**
   - Nombre: `CLOUDCONVERT_API_KEY`
   - Valor: la API key que copiaste de CloudConvert
   - Guárdala como **Secret** (encriptada)
7. En `worker.js`, cambia esta línea por tu dominio real de GitHub Pages:
   ```js
   const ALLOWED_ORIGIN = "https://TU-USUARIO.github.io";
   ```
8. Copia la URL que te da Cloudflare, algo como:
   `https://pdf-convert-api.tu-usuario.workers.dev`

---

## 3. Configurar el frontend

1. Abre `frontend/script.js`
2. Cambia esta línea por la URL de tu Worker (la del paso anterior):
   ```js
   const WORKER_URL = "https://pdf-convert-api.tu-usuario.workers.dev";
   ```

---

## 4. Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `pdf-convert`
2. Sube **solo el contenido de la carpeta `frontend/`** a la raíz del repo
   (`index.html`, `style.css`, `script.js` en la raíz, no dentro de una subcarpeta)
3. Ve a **Settings → Pages**
4. En "Branch" elige `main` y carpeta `/root`, guarda
5. Espera 1-2 minutos y tu sitio quedará en:
   `https://tu-usuario.github.io/pdf-convert/`

---

## Notas

- El plan gratis de CloudConvert incluye **25 minutos de conversión al mes** — de sobra para pruebas y uso personal.
- Cloudflare Workers gratis permite **100,000 peticiones al día**, así que no tendrás problema de límites ahí.
- Si en el futuro quieres agregar más formatos, solo agrega más `<option>` en los `<select>` del HTML — CloudConvert los soporta casi todos automáticamente.
- Si quieres restringir el tamaño máximo de archivo (para evitar abusos), puedes validarlo en `script.js` antes de enviarlo, revisando `archivo.size`.
