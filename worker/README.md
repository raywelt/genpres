# Proxy Groq para Generador de Presidentes (Cloudflare Worker)

Este Worker esconde tu API key de Groq para que los visitantes de la web
(GitHub Pages) puedan generar discursos SIN poner su propia key.

## Despliegue (dashboard web, sin instalar nada)

1. Entrá a https://dash.cloudflare.com/workers (con tu email, sin tarjeta).
2. "Create Worker" → pegá el contenido de `worker.js` en el editor.
3. En el Worker: **Settings > Variables > Secrets > Add** →
   - Nombre: `GROQ_KEY`
   - Valor: tu key de Groq (console.groq.com/keys)
4. "Deploy". Anotá la URL que te da (ej.
   `https://genpres-proxy.tu-subdomain.workers.dev`).
5. Pegá esa URL en el campo `PROXY_URL` de `index.html` (abajo).

## Cómo apunta la web

En `index.html` hay una constante:

    const PROXY_URL = 'https://TU-WORKER.workers.dev';

La web hace POST a ese Worker. El Worker agrega tu key y llama a Groq.
CORS está habilitado (`Access-Control-Allow-Origin: *`), así que GitHub Pages
puede llamarlo desde otro dominio.

## Costo

Corre contra tu cuota FREE de Groq (generosa). El free tier de Cloudflare
Workers es 100.000 requests/día, sin costo.

## Cambiar de modelo

El modelo lo elige el frontend (selector en la web). El Worker solo reenvía el
body. Si querés fijar uno, podés ignorar el selector o hardcodearlo en el body
del fetch del frontend.
