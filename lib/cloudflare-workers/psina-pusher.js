// ==PPPScript==
// @version 1
// ==/PPPScript==

export default {
  async fetch(request, env) {
    let requestBody;

    try {
      requestBody = await request.json();
    } catch (e) {
      return new Response('Bow-wow!');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const pusherBody = JSON.stringify({
      name: 'bark',
      channel: 'psina',
      data: JSON.stringify(requestBody)
    });
    const encodedBody = new TextEncoder().encode(pusherBody);
    const hashBuffer = await crypto.subtle.digest('MD5', encodedBody);
    const bodyMd5 = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    let params = `auth_key=${env.PUSHER_KEY}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.PUSHER_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const authSignature = Array.from(
      new Uint8Array(
        await crypto.subtle.sign(
          'HMAC',
          key,
          new TextEncoder().encode(
            ['POST', `/apps/${env.PUSHER_APPID}/events`, params].join('\n')
          )
        )
      )
    )
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    params += `&auth_signature=${authSignature}`;

    return fetch(
      `https://api-${env.PUSHER_CLUSTER}.pusher.com/apps/${env.PUSHER_APPID}/events?${params}`,
      {
        method: 'POST',
        body: pusherBody,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
