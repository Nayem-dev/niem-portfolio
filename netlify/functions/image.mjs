// netlify/functions/image.mjs
// Public GET: serves an image previously stored by upload.mjs.
// Usage: /.netlify/functions/image?key=<key>

import { getStore } from '@netlify/blobs';

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response('Missing key', { status: 400 });
  }

  try {
    const store = getStore({ name: 'site-uploads', consistency: 'strong' });
    const result = await store.getWithMetadata(key, { type: 'arrayBuffer' });

    if (!result) {
      return new Response('Not found', { status: 404 });
    }

    const contentType = result.metadata?.contentType || 'application/octet-stream';

    return new Response(result.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response('Server error: ' + (err && err.message ? err.message : String(err)), { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/image'
};
