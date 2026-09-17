// netlify/functions/verify.mjs
// Protected POST: checks whether the supplied password is correct, without
// touching any data. Used by admin.html's login screen.

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const suppliedPassword = req.headers.get('x-admin-password') || '';

  if (!adminPassword) {
    return json({ error: 'Server is not configured. Set ADMIN_PASSWORD in Netlify environment variables.' }, 500);
  }
  if (suppliedPassword !== adminPassword) {
    return json({ ok: false }, 401);
  }
  return json({ ok: true });
};

export const config = {
  path: '/.netlify/functions/verify'
};
