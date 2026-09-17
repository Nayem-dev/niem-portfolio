// netlify/functions/upload.mjs
// Protected POST: accepts a base64-encoded image and stores it in Netlify Blobs.
// Body: { filename: string, contentType: string, dataBase64: string }
// Header: x-admin-password must match ADMIN_PASSWORD env var.
// Returns: { url: "/.netlify/functions/image?key=..." }

import { getStore } from '@netlify/blobs';

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

function sanitizeFilename(name) {
  return String(name || 'upload')
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

const MAX_BYTES = 4.5 * 1024 * 1024; // keep well under function payload limits

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
    return json({ error: 'Wrong password.' }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { filename, contentType, dataBase64 } = body || {};
  if (!dataBase64 || typeof dataBase64 !== 'string') {
    return json({ error: 'Missing image data.' }, 400);
  }

  let bytes;
  try {
    bytes = Buffer.from(dataBase64, 'base64');
  } catch (e) {
    return json({ error: 'Could not decode image data.' }, 400);
  }

  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return json({ error: 'Image must be smaller than 4.5MB.' }, 400);
  }

  const safeName = sanitizeFilename(filename);
  const key = `${Date.now()}-${safeName}`;

  try {
    const store = getStore({ name: 'site-uploads', consistency: 'strong' });

    await store.set(key, bytes, {
      metadata: { contentType: contentType || 'application/octet-stream' }
    });

    return json({ url: `/.netlify/functions/image?key=${encodeURIComponent(key)}` });
  } catch (err) {
    return json({
      error: 'Server error in upload function: ' + (err && err.message ? err.message : String(err)),
      name: err && err.name
    }, 500);
  }
};

export const config = {
  path: '/.netlify/functions/upload'
};
