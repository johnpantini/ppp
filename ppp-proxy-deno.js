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

  const host = req.headers.get('x-host');

  if (!host) {
    return new Response(null, {
      status: 404
    });
  } else {
    const url = new URL(req.url);

    url.hostname = host;

    let res = await fetch(url.toString(), req);

    res = new Response(res.body, res);

    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.headers.set('Access-Control-Allow-Headers', '*');
    res.headers.append('Vary', 'Origin');

    return res;
  }
});
