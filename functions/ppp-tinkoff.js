const fetchTIOpenAPI = async ({ path, body = '', token, method = 'POST' }) => {
  const https = require('https');

  return new Promise(async (resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api-invest.tinkoff.ru',
        port: 443,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body.length,
          Authorization: `Bearer ${token}`
        }
      },
      async (res) => {
        if (res.statusCode === 401) {
          resolve({
            status: 'Error',
            payload: {
              message: 'Неверный торговый токен'
            }
          });
        } else {
          try {
            let responseText = '';

            for await (const chunk of res) {
              responseText += chunk;
            }

            resolve(JSON.parse(responseText || 'null'));
          } catch (error) {
            reject(error);
          }
        }
      }
    );

    if (body) req.write(body);

    req.end();
  });
};

exports = async function (payload, response) {
  const body = EJSON.parse(payload.body.text());

  if (body.check === true) {
    response.setStatusCode(200);
    response.setBody('200 OK');
  } else {
    const ticker = body.t.replace(' ', '.');
    const price = +body.p;
    const volume = body.v;
    const direction = body.d;
    const figi = body.f;

    if (ticker && figi && volume > 0 && price > 0) {
      const tinkoffToken = context.values.get('tinkoffTokenValue');

      if (!tinkoffToken) {
        response.setStatusCode(404);
        response.setBody('Не задан торговый токен');
      } else {
        const accountId = context.values.get('tinkoffAccountId');

        if (!accountId) {
          response.setStatusCode(404);
          response.setBody('Не задан номер счёта');
        } else {
          const res = await fetchTIOpenAPI({
            path: `/openapi/orders/limit-order?figi=${figi}&brokerAccountId=${accountId}`,
            method: 'POST',
            body: JSON.stringify({
              lots: volume,
              operation: direction === 'buy' ? 'Buy' : 'Sell',
              price
            }),
            token: tinkoffToken
          });

          if (
            res &&
            res.status.toLowerCase() === 'ok' &&
            res.payload.status.toLowerCase() !== 'rejected'
          ) {
            response.setStatusCode(200);
            response.setBody('200 OK');
          } else {
            console.log(JSON.stringify(res));

            response.setStatusCode(400);
            response.setBody(res ? res.payload.message : 'Запрос не выполнен');
          }
        }
      }
    } else {
      response.setStatusCode(400);
      response.setBody('Некорректные данные в заявке');
    }
  }
};
