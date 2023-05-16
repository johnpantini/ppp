import { serve } from 'https://deno.land/std@0.178.0/http/server.ts';

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods':
          'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'access-control-allow-headers': '*'
      }
    });
  }

  const url = new URL(request.url);

  url.hostname = 'ususdt-api-margin.utex.io';

  const response = await fetch(url.toString(), {
    method: request.method,
    body: request.body,
    mode: request.mode,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      Authorization: request.headers.get('authorization'),
      'Content-Type': 'application/json;charset=UTF-8',
      'User-Agent': request.headers.get('user-agent'),
      Origin: 'https://margin.utex.io',
      Referer: 'https://margin.utex.io/',
      'x-b3-spanid': request.headers.get('x-b3-spanid'),
      'x-b3-traceid': request.headers.get('x-b3-traceid')
    },
    redirect: request.redirect,
    cache: request.cache,
    credentials: request.credentials
  });
  const ct = response.headers.get('content-type');

  return new Response(response.body, {
    status: response.status,
    headers: {
      'content-type': ct ? ct : 'text/plain',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'access-control-allow-headers': '*'
    }
  });
});
