// HTTP/2 (RFC 9113 §8.2.2) + hop-by-hop (RFC 9110 §7.6.1).
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'http2-settings'
]);
const BODY_META = new Set(['content-encoding', 'content-length']);
const STRIPPED = new Set([
  'content-security-policy',
  'content-security-policy-report-only',
  'x-frame-options'
]);
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Max-Age': '86400'
};

function handleOptions(request) {
  if (request.headers.get('Origin') !== null) {
    return new Response(null, { headers: CORS });
  }

  return new Response(null, {
    headers: { Allow: 'GET, POST, OPTIONS, PUT, PATCH, DELETE' }
  });
}

function buildUpstreamUrl(req) {
  const host = req.headers.get('X-Host');

  if (!host) return null;

  const port = (req.headers.get('X-Port') ?? '443').trim();
  const url = new URL(req.url);

  url.protocol = port === '80' ? 'http:' : 'https:';
  url.hostname = host;
  url.port = port;

  return url;
}

function buildUpstreamHeaders(req) {
  const headers = new Headers();
  const mandatory = ['Accept', 'Accept-Language', 'Content-Type'];

  for (const h of mandatory) {
    const value = req.headers.get(h);

    if (value !== null) headers.set(h, value);
  }

  const allowed = (req.headers.get('X-Allowed-Headers') ?? '').split(',');

  for (const raw of allowed) {
    const name = raw.trim();

    if (!name) continue;

    if (HOP_BY_HOP.has(name.toLowerCase())) continue;

    if (headers.has(name)) continue;

    const value = req.headers.get(name);

    if (value !== null) headers.set(name, value);
  }

  return headers;
}

function buildDownstreamHeaders(upstream) {
  const headers = new Headers();

  for (const [key, value] of upstream.headers) {
    const name = key.toLowerCase();

    if (HOP_BY_HOP.has(name)) continue;

    if (BODY_META.has(name)) continue;

    if (STRIPPED.has(name)) continue;

    if (name === 'set-cookie') continue;

    headers.append(key, value);
  }

  for (const cookie of upstream.headers.getSetCookie?.() ?? []) {
    headers.append('Set-Cookie', cookie);
  }

  for (const [key, value] of Object.entries(CORS)) {
    headers.set(key, value);
  }

  headers.append('Vary', 'Origin');

  return headers;
}

export default async function (req) {
  if (req.method === 'OPTIONS') return handleOptions(req);

  const url = buildUpstreamUrl(req);

  if (!url) return new Response(null, { status: 404, headers: CORS });

  if (req.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
    return new Response(
      JSON.stringify({
        error: 'WebSocket is not supported by Netlify Edge Functions.'
      }),
      {
        status: 501,
        headers: { ...CORS, 'Content-Type': 'application/json' }
      }
    );
  }

  const hasBody =
    req.method !== 'GET' && req.method !== 'HEAD' && req.body !== null;
  const body = hasBody ? await req.arrayBuffer() : null;

  let upstream;

  try {
    upstream = await fetch(url, {
      method: req.method,
      headers: buildUpstreamHeaders(req),
      body,
      redirect: 'follow'
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e?.message ?? e), host: url.hostname }),
      {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' }
      }
    );
  }

  const noBody =
    req.method === 'HEAD' || [101, 204, 205, 304].includes(upstream.status);

  return new Response(noBody ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: buildDownstreamHeaders(upstream)
  });
}

export const config = { path: '/*' };
