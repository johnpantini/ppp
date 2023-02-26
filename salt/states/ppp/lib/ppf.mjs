import { createServer } from 'http';
import mongodb from './vendor/mongodb.min.js';

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

createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  response.setHeader(
    'Access-Control-Allow-Headers',
    'content-type, authorization'
  );

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
          } else if (typeof invocation === 'object') {
            const result = {};

            for (const key in invocation) {
              const name = invocation[key].constructor.name;

              if (name === 'Promise') {
                result[key] = await invocation[key];
              } else if (name === 'FindCursor') {
                result[key] = await invocation[key].toArray();
              } else result[key] = invocation[key];
            }

            response.setHeader(
              'Content-Type',
              'application/json; charset=UTF-8'
            );
            response.write(JSON.stringify(EJSON.serialize(result)));
            response.end();
          }
        } else if (body.name === 'updateOne') {
          const result = await client
            .db('ppp')
            .collection(body.arguments[0].collection)
            .updateOne(
              body.arguments[1],
              body.arguments[2],
              body.arguments[3] ?? {}
            );

          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.write(JSON.stringify(EJSON.serialize(result)));
          response.end();
        } else if (body.name === 'findOne') {
          const result = await client
            .db('ppp')
            .collection(body.arguments[0].collection)
            .findOne(body.arguments[1], body.arguments[2]);

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
}).listen(process.env.PORT ?? 14444);
