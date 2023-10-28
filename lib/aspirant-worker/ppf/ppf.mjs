// ==PPPScript==
// @version 1
// ==/PPPScript==

import { createServer } from 'http';

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';
const { default: mongodb } = await import(`${ROOT}/vendor/mongodb.min.js`);

const { MongoClient, BSON } = mongodb;
const EJSON = BSON.EJSON;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const mongoClients = new Map();

async function getMongoClient(uri) {
  if (!mongoClients.has(uri)) {
    const newClient = new MongoClient(uri.replace('localhost', '0.0.0.0'));

    mongoClients.set(uri, newClient);
    await newClient.connect();
  }

  return mongoClients.get(uri);
}

const server = createServer(async (request, response) => {
  if (typeof process.env.NOMAD_PORT_HTTP === 'undefined') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    response.setHeader('Access-Control-Allow-Headers', '*');
  }

  if (/options/i.test(request.method)) {
    return response.writeHead(200).end();
  }

  if (/\/functions\/call/i.test(request.url) || request.url === '/mongodb') {
    const buffers = [];

    for await (const chunk of request) {
      buffers.push(chunk);
    }

    try {
      const body = JSON.parse(Buffer.concat(buffers).toString());

      if (request.url === '/mongodb' && body.mongoDbUri) {
        await getMongoClient(body.mongoDbUri);

        response.write('200 OK');
        response.end();
      } else if (body.name) {
        const client = await getMongoClient(body.mongoDbUri);

        if (body.name === 'eval') {
          const func = new AsyncFunction(
            'context',
            'BSON',
            'EJSON',
            ...body.arguments
          );
          const context = {
            services: {
              get: (service) => {
                if (service === 'mongodb-atlas') {
                  return client;
                }
              }
            }
          };
          const invocation = await func(context, BSON, EJSON);

          if (invocation === null) {
            response.setHeader(
              'Content-Type',
              'application/json; charset=UTF-8'
            );
            response.write(JSON.stringify(invocation));
            response.end();
          } else {
            let result;

            if (
              invocation?.constructor?.name === 'AggregationCursor' ||
              invocation?.constructor?.name === 'FindCursor'
            ) {
              result = await invocation.toArray();
            } else if (typeof invocation === 'object') {
              if (Array.isArray(invocation)) {
                result = invocation;
              } else {
                result = {};

                for (const key in invocation) {
                  const name = invocation[key]?.constructor?.name;

                  if (name === 'Promise') {
                    result[key] = await invocation[key];
                  } else if (name === 'FindCursor') {
                    result[key] = await invocation[key].toArray();
                  } else result[key] = invocation[key];
                }
              }
            }

            response.setHeader(
              'Content-Type',
              'application/json; charset=UTF-8'
            );
            response.write(JSON.stringify(EJSON.serialize(result)));
            response.end();
          }
        } else {
          let result = await client
            .db('ppp')
            .collection(body.arguments[0].collection)
            [body.name](
              EJSON.deserialize(body.arguments[1]),
              EJSON.deserialize(body.arguments[2] ?? {}),
              body.arguments[3],
              body.arguments[4]
            );

          if (
            result?.constructor?.name === 'AggregationCursor' ||
            result?.constructor?.name === 'FindCursor'
          ) {
            result = await result.toArray();
          }

          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.write(JSON.stringify(EJSON.serialize(result)));
          response.end();
        }
      }
    } catch (e) {
      console.error(e);

      response.setHeader('Content-Type', 'application/json; charset=UTF-8');
      response.writeHead(400);
      response.write(e.toString());
      response.end();
    }
  }
}).listen(process.env.NOMAD_PORT_HTTP ?? process.env.PORT ?? 14444, () => {
  console.log('Bound to port ' + server.address().port);
});
