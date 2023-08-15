// ==PPPScript==
// @version 3
// ==/PPPScript==

import { WebSocket } from '/salt/states/ppp/lib/websocket/websocket.mjs';
import { createHash, createHmac } from 'node:crypto';

export async function wait(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

export class PsinaUSNews {
  #connection;

  async fetchAstraRESTEndpoint(path, options = {}) {
    return await (
      await fetch(
        new URL('fetch', process.env.SERVICE_MACHINE_URL).toString(),
        {
          method: 'POST',
          body: JSON.stringify({
            method: options.method ?? 'GET',
            url: `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2${path}`,
            headers: Object.assign(
              {
                'X-Cassandra-Token': process.env.ASTRA_DB_APPLICATION_TOKEN
              },
              options?.headers ?? {}
            ),
            body: options.body
          })
        }
      ).catch((error) => console.error(error))
    ).json();
  }

  async main() {
    if (
      [
        'ASTRA_DB_ID',
        'ASTRA_DB_REGION',
        'ASTRA_DB_KEYSPACE',
        'ASTRA_DB_APPLICATION_TOKEN',
        'SERVICE_MACHINE_URL'
      ].every((v) => typeof process.env[v] !== 'undefined')
    ) {
      const keySpaces =
        (await this.fetchAstraRESTEndpoint('/schemas/keyspaces'))?.data ?? [];

      if (!keySpaces.find((ks) => ks.name === process.env.ASTRA_DB_KEYSPACE)) {
        return console.error(
          `Missing keyspace (${process.env.ASTRA_DB_KEYSPACE}).`
        );
      }

      const tableCreationResponse = await this.fetchAstraRESTEndpoint(
        `/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'us_news',
            columnDefinitions: [
              {
                name: 'T',
                typeDefinition: 'text'
              },
              {
                name: 'i',
                typeDefinition: 'timeuuid'
              },
              {
                name: 'S',
                typeDefinition: 'set<text>'
              },
              {
                name: 'c',
                typeDefinition: 'set<text>'
              },
              {
                name: 'u',
                typeDefinition: 'text'
              },
              {
                name: 't',
                typeDefinition: 'timestamp'
              },
              {
                name: 'h1',
                typeDefinition: 'text'
              },
              {
                name: 'h2',
                typeDefinition: 'text'
              },
              {
                name: 'b',
                typeDefinition: 'text'
              }
            ],
            primaryKey: {
              partitionKey: ['T'],
              clusteringKey: ['i']
            },
            ifNotExists: true,
            tableOptions: {
              defaultTimeToLive: 2592000,
              clusteringExpression: [
                {
                  column: 'i',
                  order: 'DESC'
                }
              ]
            }
          })
        }
      );

      console.log(
        'Created "us_news" table with response:',
        tableCreationResponse
      );
      console.log('Changing table options...');

      await this.fetchAstraRESTEndpoint(
        `/cql?keyspaceQP=${process.env.ASTRA_DB_KEYSPACE}`,
        {
          method: 'POST',
          body: [
            `ALTER TABLE ${process.env.ASTRA_DB_KEYSPACE}.us_news`,
            'WITH gc_grace_seconds = 86400 AND default_time_to_live = 2592000;'
          ].join(' '),
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8'
          }
        }
      );

      console.log('Options changed.');
      console.log('Creating indexes...');

      const indexCreationResponse = await this.fetchAstraRESTEndpoint(
        `/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables/us_news/indexes`,
        {
          method: 'POST',
          body: JSON.stringify({
            column: 'S',
            name: 'S_idx',
            ifNotExists: true
          })
        }
      );

      console.log(
        'Created "S_idx" index with response:',
        indexCreationResponse
      );
      console.log('Now connecting...');

      return this.connect();
    } else {
      console.error('Missing AstraDB-related environment variables.');
    }
  }

  async #messageArrived(payload) {
    const [firstMessage] = payload;

    if (firstMessage?.msg === 'connected') {
      console.log('Connected. Authenticating...');

      this.#connection.send(
        JSON.stringify({
          action: 'auth',
          key: process.env.KEY,
          secret: process.env.SECRET
        })
      );
    } else if (firstMessage?.msg === 'authenticated') {
      console.log('Authenticated.');
    } else if (firstMessage?.T === 'error') {
      console.error(firstMessage);

      if (firstMessage.code === 407) {
        return;
      }

      this.#connection.close();
    } else if (firstMessage?.T === 'n') {
      const newsBody = JSON.stringify({
        T: 'n',
        i: firstMessage.i,
        S: firstMessage.S,
        c: firstMessage.c,
        u: firstMessage.u,
        t: firstMessage.t,
        h1: firstMessage.h1,
        h2: firstMessage.h2,
        b: firstMessage.b
      });

      if (
        [
          'PUSHER_KEY',
          'PUSHER_SECRET',
          'PUSHER_APPID',
          'PUSHER_CLUSTER',
          'PPP_WORKER_ID'
        ].every((v) => typeof process.env[v] !== 'undefined')
      ) {
        const timestamp = Math.floor(Date.now() / 1000);
        const pusherBody = JSON.stringify({
          name: `${process.env.PPP_WORKER_ID}:insert`,
          channel: 'ppp',
          data: newsBody
        });
        const bodyMd5 = createHash('md5').update(pusherBody).digest('hex');
        let params = `auth_key=${process.env.PUSHER_KEY}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;
        const authSignature = createHmac('sha256', process.env.PUSHER_SECRET)
          .update(
            ['POST', `/apps/${process.env.PUSHER_APPID}/events`, params].join(
              '\n'
            )
          )
          .digest('hex');

        params += `&auth_signature=${authSignature}`;

        fetch(
          `https://api-${process.env.PUSHER_CLUSTER}.pusher.com/apps/${process.env.PUSHER_APPID}/events?${params}`,
          {
            method: 'POST',
            body: pusherBody,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        ).catch((error) => console.error(error));
      }

      return this.fetchAstraRESTEndpoint(
        `/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/us_news`,
        {
          method: 'POST',
          body: newsBody
        }
      );
    }
  }

  connect() {
    if (typeof process.env.US_NEWS_FEED_URL === 'undefined') {
      return;
    }

    this.#connection = new WebSocket(process.env.US_NEWS_FEED_URL);
    this.#connection.onclose = async () => {
      await wait(1000);

      return this.connect();
    };
    this.#connection.onerror = () => this.#connection.close();
    this.#connection.onmessage = ({ data }) =>
      this.#messageArrived(JSON.parse(data));
  }
}

await new PsinaUSNews().main();
