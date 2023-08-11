// ==PPPScript==
// @version 1
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

  async #messageArrived(payload) {
    const [firstMessage] = payload;

    if (firstMessage?.msg === 'connected') {
      console.log('Connected.');

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
        S: firstMessage.S,
        c: firstMessage.c,
        u: firstMessage.u,
        t: firstMessage.t,
        ti: firstMessage.ti,
        h: firstMessage.h
      });

      if (
        ['PUSHER_KEY', 'PUSHER_SECRET', 'PUSHER_APPID', 'PUSHER_CLUSTER'].every(
          (v) => typeof process.env[v] !== 'undefined'
        )
      ) {
        const timestamp = Math.floor(Date.now() / 1000);
        const pusherBody = JSON.stringify({
          name: 'news',
          channel: 'psina-us-news',
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

      if (
        [
          'ASTRA_DB_ID',
          'ASTRA_DB_REGION',
          'ASTRA_DB_KEYSPACE',
          'ASTRA_DB_APPLICATION_TOKEN',
          'SERVICE_MACHINE_URL'
        ].every((v) => typeof process.env[v] !== 'undefined')
      ) {
        fetch(new URL('fetch', process.env.SERVICE_MACHINE_URL).toString(), {
          method: 'POST',
          body: JSON.stringify({
            method: 'POST',
            url: `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/namespaces/${process.env.ASTRA_DB_KEYSPACE}/collections/us_news?ttl=2592000`,
            headers: {
              'X-Cassandra-Token': process.env.ASTRA_DB_APPLICATION_TOKEN
            },
            body: newsBody
          })
        }).catch((error) => console.error(error));
      }
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

new PsinaUSNews().connect();
