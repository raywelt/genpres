// Cloudflare Worker — proxy a Groq (esconde la API key)
// Robusto: siempre devuelve cabeceras CORS, incluso en error.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check: abrí la URL del Worker directo en el navegador.
    if (request.method === 'GET') {
      const ok = !!env.GROQ_KEY;
      return new Response(
        JSON.stringify({ status: 'ok', groq_key: ok ? 'configurada' : 'FALTA (poné GROQ_KEY en Secrets)' }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    try {
      if (request.method !== 'POST') {
        return new Response('Método no permitido.', { status: 405, headers: CORS });
      }

      if (!env.GROQ_KEY) {
        return new Response(
          JSON.stringify({ error: 'Falta GROQ_KEY en la configuración del Worker.' }),
          { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
        );
      }

      const target = 'https://api.groq.com/openai/v1/chat/completions';
      const body = await request.text();

      const upstream = await fetch(target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + env.GROQ_KEY,
        },
        body,
      });

      const out = await upstream.text();
      return new Response(out, {
        status: upstream.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      // Nunca dejar caer sin CORS.
      return new Response(
        JSON.stringify({ error: 'Worker exception', detail: String(e && e.stack || e) }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }
  },
};
