async function handleOptions(request) {
  if (request.headers.get('Origin') !== null) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers': '*'
      }
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
      }
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(req);
  }

  const host = req.headers.get('X-Host');
  const port = req.headers.get('X-Port') ?? 443;

  if (!host) {
    return new Response(null, {
      status: 404
    });
  } else {
    const allowedHeaders = (req.headers.get('X-Allowed-Headers') ?? '').split(
      ','
    );
    const url = new URL(req.url);

    url.hostname = host;
    url.port = port;

    const newHeaders = new Headers();
    const mandatoryHeaders = [
      'Accept',
      'Accept-Encoding',
      'Content-Type',
      'Content-Length',
      'Connection',
      'Upgrade'
    ];

    for (const h of mandatoryHeaders) {
      req.headers.has(h) && newHeaders.set(h, req.headers.get(h));
    }

    newHeaders.set('Host', host);

    for (const h of allowedHeaders) {
      h &&
        req.headers.has(h) &&
        !newHeaders.has(h) &&
        newHeaders.set(h, req.headers.get(h));
    }

    const newRequest = new Request(
      url.toString(),
      new Request(req, {
        method: req.method,
        body: req.body,
        redirect: req.redirect,
        headers: newHeaders
      })
    );

    const fetchResponse = await fetch(url.toString(), newRequest);
    const res = new Response(fetchResponse.body, fetchResponse);

    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.headers.set('Access-Control-Allow-Headers', '*');
    res.headers.append('Vary', 'Origin');
    res.headers.delete('Content-Security-Policy');
    res.headers.delete('X-Frame-Options');

    return res;
  }
});
