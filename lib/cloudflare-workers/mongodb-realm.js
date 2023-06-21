// ==PPPScript==
// @version 2
// ==/PPPScript==

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

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);

    url.hostname = 'realm.mongodb.com';

    let response = await fetch(url.toString(), request);

    response = new Response(response.body, response);

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.append('Vary', 'Origin');

    return response;
  }
};
