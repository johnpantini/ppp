const https = require('https');

function fetch(url, options = {}) {
  const u = new URL(url);

  return new Promise(async (resolve, reject) => {
    const requestOptions = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: options.method,
      headers: options.headers,
      rejectUnauthorized: false
    };

    const req = https.request(requestOptions, async (res) => {
      try {
        let responseText = '';

        for await (const chunk of res) {
          responseText += chunk;
        }

        resolve({
          responseText,
          headers: res.headers,
          status: res.statusCode,
          url
        });
      } catch (error) {
        reject({
          responseText: error.toString(),
          headers: res.headers,
          status: res.statusCode,
          url
        });
      }
    });

    req.on('error', (error) => reject(error));

    if (options.body) req.write(options.body);

    req.end();
  });
}

module.exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405
    };
  }

  const body = JSON.parse(event.body);

  if (!body?.url) {
    return {
      statusCode: 422
    };
  }

  const request = await fetch(body.url, {
    headers: {
      'User-Agent':
        body.userAgent ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
    }
  });

  return {
    statusCode: request.status,
    body: request.responseText,
    headers: {
      'Content-Type': request.headers['content-type']
    }
  };
};
