// ==PPPScript==
// @version 3
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
        // Astra Data API (tables). Errors arrive as HTTP 200 with "errors".
        const json = await (
          await fetch(
            `https://${env.ASTRA_DB_ID}-${env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/json/v1/${env.ASTRA_DB_KEYSPACE}/us_news`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Token: env.ASTRA_DB_APPLICATION_TOKEN
              },
              body: JSON.stringify({
                findOne: { filter: { T: 'n', i: uuid }, projection: { b: 1 } }
              })
            }
          )
        ).json();

        if (json?.errors?.length) {
          console.error(json.errors);
        } else if (json?.data?.document) {
          const { b } = json.data.document;

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
