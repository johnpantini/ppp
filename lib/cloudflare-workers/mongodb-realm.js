// ==PPPScript==
// @version 1
// ==/PPPScript==

export default {
  async fetch(request) {
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
