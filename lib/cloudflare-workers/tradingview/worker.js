// ==PPPScript==
// @version 1
// ==/PPPScript==

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const subdomain = url.hostname.split('.').at(-3);

    url.hostname = 'ru.tradingview.com';

    const newRequest = new Request(url.href, request);

    newRequest.headers.set('Referer', url.href);
    newRequest.headers.set('Origin', url.href);

    const response = await fetch(newRequest);
    const newResponse = new Response(response.body, response);
    const text = await response.text();

    newResponse.headers.delete('content-security-policy');
    newResponse.headers.delete('x-frame-options');

    const setCookie = newResponse.headers.get('set-cookie');

    if (typeof setCookie === 'string') {
      newResponse.headers.set(
        'set-cookie',
        setCookie
          .replace(/\.tradingview\.com/gi, `.${subdomain}.workers.dev`)
          .replace(/SameSite=Lax/gi, 'SameSite=None')
      );
    }

    return new Response(
      text.replace(
        '<head>',
        `<head><script src="${env.INJECTION_LIB_URL}"></script>`
      ),
      {
        headers: newResponse.headers
      }
    );
  }
};
