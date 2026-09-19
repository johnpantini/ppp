// ==PPPScript==
// @version 9
// ==/PPPScript==

import { WebSocket as WS } from '/ppp/vendor/websocket/websocket.mjs';
import { createHash, createHmac } from 'node:crypto';

globalThis.WebSocket ??= WS;

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';

await import(`${ROOT}/lib/debug.js`);

const $$news = globalThis.ppp.$debug('us-news');

export async function wait(delay) {
  // biome-ignore lint/complexity/useArrowFunction: OK
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

export class PsinaUSNews {
  #connection;

  async main() {
    if (
      [
        'ASTRA_DB_ID',
        'ASTRA_DB_REGION',
        'ASTRA_DB_KEYSPACE',
        'ASTRA_DB_APPLICATION_TOKEN'
      ].every((v) => typeof process.env[v] !== 'undefined')
    ) {
      await this.#ensureSchema();

      $$news('connecting to the feed...');

      return this.connect();
    } else {
      $$news('missing AstraDB-related environment variables');
    }
  }

  async #messageArrived(payload) {
    const [firstMessage] = payload;

    if (firstMessage?.msg === 'connected') {
      $$news('connected, authenticating...');

      this.#connection.send(
        JSON.stringify({
          action: 'auth',
          key: process.env.KEY,
          secret: process.env.SECRET
        })
      );
    } else if (firstMessage?.msg === 'authenticated') {
      $$news('authenticated');
    } else if (firstMessage?.T === 'error') {
      $$news('feed error: %o', firstMessage);

      if (firstMessage.code === 407) {
        return;
      }

      this.#connection.close();
    } else if (firstMessage?.T === 'n' || firstMessage?.T === 's') {
      const newsBody = {
        T: firstMessage.T,
        i: firstMessage.i,
        S: firstMessage.S,
        c: firstMessage.c,
        u: firstMessage.u,
        t: new Date(firstMessage.t).toISOString(),
        h1: firstMessage.h1,
        h2: firstMessage.h2,
        b: firstMessage.b
      };

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
          data: JSON.stringify(newsBody)
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
        ).catch((error) => $$news('pusher publish failed: %o', error));
      }

      return this.#insertRow(newsBody);
    }
  }

  // Data API. Errors come back as HTTP 200 with an "errors" array.
  async #dataAPI(command, table = '') {
    const response = await fetch(
      `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/json/v1/${process.env.ASTRA_DB_KEYSPACE}${table ? `/${table}` : ''}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: process.env.ASTRA_DB_APPLICATION_TOKEN
        },
        body: JSON.stringify(command)
      }
    );
    const json = await response.json();

    if (!response.ok || json.errors?.length) {
      throw new Error(
        `Data API ${Object.keys(command)[0]} failed (${response.status}): ${JSON.stringify(json.errors)}`
      );
    }

    return json;
  }

  // The table itself (timeuuid column, TTL) can only be created with CQL,
  // see us-news.cql next to this file. The index can be ensured here.
  // Never blocks the feed: inserts report their own errors.
  async #ensureSchema() {
    let tables;

    try {
      tables = (
        await this.#dataAPI({ listTables: { options: { explain: false } } })
      ).status?.tables;
    } catch (error) {
      $$news('schema check skipped: %o', error);

      return;
    }

    if (!tables?.includes('us_news')) {
      $$news(
        'table "us_news" is missing, create it with us-news.cql in the Astra CQL console'
      );

      return;
    }

    try {
      await this.#dataAPI(
        {
          createIndex: {
            name: 'S_idx',
            definition: { column: 'S' },
            options: { ifNotExists: true }
          }
        },
        'us_news'
      );
    } catch (error) {
      $$news('index check failed: %o', error);
    }
  }

  async #insertRow(row) {
    try {
      await this.#dataAPI({ insertOne: { document: row } }, 'us_news');
    } catch (error) {
      $$news('AstraDB insert failed: %o', error);
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
