// ==PPPScript==
// @version 1
// ==/PPPScript==

export default {
  async fetch(request) {
    const url = new URL(request.url);

    url.hostname = 'thefly.com';

    const response = await fetch(url.toString(), request);

    return new Response(await response.text());
  }
};
