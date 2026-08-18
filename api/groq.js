// Vercel Serverless Function — Proxy seguro para Groq
// Esconde la API Key de Groq en las variables de entorno de Vercel

export default async function handler(req, res) {
  // Cabeceras CORS universales
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Respuesta al preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check: abre /api/groq en el navegador para verificar el estado
  const apiKey = process.env.GROQ_KEY;
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      servidor: 'Vercel Serverless',
      groq_key: apiKey ? 'CONFIGURADA CORRECTAMENTE' : 'FALTA (Agrega GROQ_KEY en Settings > Environment Variables de Vercel)'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  if (!apiKey) {
    return res.status(500).json({
      error: 'Falta la variable de entorno GROQ_KEY en Vercel.',
      solucion: 'Entra a tu proyecto en Vercel -> Settings -> Environment Variables y añade GROQ_KEY con tu clave de Groq.'
    });
  }

  try {
    const target = 'https://api.groq.com/openai/v1/chat/completions';
    
    // req.body en Vercel puede venir parseado como objeto o como string
    const bodyPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: bodyPayload,
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno en el proxy de Vercel',
      detail: String(error?.message || error)
    });
  }
}
