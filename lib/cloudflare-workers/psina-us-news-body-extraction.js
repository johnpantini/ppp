// ==PPPScript==
// @version 1
// ==/PPPScript==

async function fetchAstraRESTEndpoint(env, path, options = {}) {
  return await (
    await fetch(new URL('fetch', env.SERVICE_MACHINE_URL).toString(), {
      method: 'POST',
      body: JSON.stringify({
        method: options.method ?? 'GET',
        url: `https://${env.ASTRA_DB_ID}-${env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2${path}`,
        headers: Object.assign(
          {
            'X-Cassandra-Token': env.ASTRA_DB_APPLICATION_TOKEN
          },
          options?.headers ?? {}
        ),
        body: options.body
      })
    }).catch((error) => console.error(error))
  ).json();
}

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
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const uuid = url.pathname.split('/')?.[1];
    let messageBody = '<p>404 The Requested Resource Is Not Found</p>';

    if (uuid) {
      const response = await fetchAstraRESTEndpoint(
        env,
        `/keyspaces/${env.ASTRA_DB_KEYSPACE}/us_news/n/${uuid}`
      );

      if (Array.isArray(response?.data)) {
        const { b } = response.data[0];

        if (b) {
          messageBody = b;
        }
      }
    }

    return new Response(`<!DOCTYPE html><body>${messageBody}</body>`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Content-Type': 'text/html;charset=UTF-8',
        'Access-Control-Allow-Headers': '*',
        Vary: 'Origin'
      }
    });
  }
};
