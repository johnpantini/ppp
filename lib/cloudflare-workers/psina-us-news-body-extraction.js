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
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const uuid = url.pathname.split('/')?.[1];
    let messageBody = `<p>The requested resource (${uuid}) was not found.</p>`;

    if (uuid) {
      try {
        const path = `/keyspaces/${env.ASTRA_DB_KEYSPACE}/us_news/n/${uuid}`;
        const json = await (
          await fetch(
            `https://${
              new URL(env.GLOBAL_PROXY_URL).hostname
            }/api/rest/v2${path}`,
            {
              headers: {
                'X-Cassandra-Token': env.ASTRA_DB_APPLICATION_TOKEN,
                'X-Host': `${env.ASTRA_DB_ID}-${env.ASTRA_DB_REGION}.apps.astra.datastax.com`,
                'X-Allowed-Headers': 'X-Cassandra-Token'
              }
            }
          )
        ).json();

        if (Array.isArray(json?.data)) {
          const { b } = json.data[0];

          if (b) {
            messageBody = b;
          }
        }
      } catch (e) {
        console.error(e);
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
