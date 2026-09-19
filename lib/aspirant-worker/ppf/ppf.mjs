// ==PPPScript==
// @version 5
// ==/PPPScript==

import { createServer } from 'node:http';

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';
const { default: mongodb } = await import(`${ROOT}/vendor/mongodb.min.js`);
const { MongoClient, BSON } = mongodb;

await import(`${ROOT}/lib/debug.js`);

const $$ppf = globalThis.ppp.$debug('ppf');
const EJSON = BSON.EJSON;
// biome-ignore lint/complexity/useArrowFunction: OK
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const mongoClients = new Map();

// The map holds pending connections, so that concurrent requests for the
// same URI share one client and wait for it to be connected.
async function getMongoClient(uri) {
  if (!mongoClients.has(uri)) {
    const newClient = new MongoClient(uri.replace('localhost', '0.0.0.0'));

    $$ppf('connecting to MongoDB...');

    mongoClients.set(
      uri,
      newClient.connect().catch((e) => {
        $$ppf('MongoDB connection failed: %o', e);
        mongoClients.delete(uri);

        throw e;
      })
    );
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
    response.setHeader('Access-Control-Allow-Headers', '*, Authorization');
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
            } else if (typeof invocation !== 'object') {
              // Primitives (numbers, strings, booleans) are returned as is.
              result = invocation;
            } else {
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
      } else {
        // Neither a gateway check nor a function call: do not leave
        // the request hanging.
        response.setHeader('Content-Type', 'application/json; charset=UTF-8');
        response.writeHead(422);
        response.write(JSON.stringify({ error: 'E_INVALID_BODY' }));
        response.end();
      }
    } catch (e) {
      $$ppf('%s failed: %o', request.url, e);
      response.setHeader('Content-Type', 'application/json; charset=UTF-8');
      response.writeHead(400);
      response.write(
        e
          ? JSON.stringify(
              // Error#message and Error#name are not enumerable, expose them
              // in the "error" and "error_code" fields the client reads.
              {
                error: e.message,
                error_code: e.codeName ?? e.name,
                ...e
              },
              (key, value) =>
                value && value instanceof Set ? Array.from(value) : value
            )
          : JSON.stringify({ error: 'UnknownMongoDBError' })
      );
      response.end();
    }
  } else if (request.url === '/') {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.write(
      JSON.stringify({
        ok: true,
        result: {
          env: {
            PPP_WORKER_ID: process.env.PPP_WORKER_ID ?? ''
          }
        }
      })
    );
    response.end();
  } else {
    response.writeHead(404).end();
  }
}).listen(process.env.NOMAD_PORT_HTTP ?? process.env.PPF_PORT ?? 14444, () => {
  $$ppf('listening on port %d', server.address().port);
});
