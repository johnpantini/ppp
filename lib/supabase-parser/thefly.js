// ==PPPScript==
// @version 1
// ==/PPPScript==

plv8.execute("select http_set_curlopt('CURLOPT_SSL_VERIFYHOST', '0')");
plv8.execute("select http_set_curlopt('CURLOPT_SSL_VERIFYPEER', '0')");

const isDST = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch =
    firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember =
    firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);

  return (
    currentDate.getTime() <= end.getTime() &&
    currentDate.getTime() >= start.getTime()
  );
};

const stories = [];
const fetch = plv8.find_function('ppp_fetch');
const html = fetch('[%#ctx.document.url%]', {
  headers: {
    'User-Agent': '[%#navigator.userAgent%]'
  }
}).responseText;

for (const m of html.matchAll(
  /(<tr id="news_[\s\S]+?)<div class='newsContent'>/gi
)) {
  const story = m[1];
  const priority = /tr_noticia_prioridad/i.test(story);
  const [_, topic, link, title] = story
    .replace('<span class="importantHeadline">', '')
    .match(
      /data-topic="(.+?)"[\s\S]+<a[\s\S]+href='([\s\S]+?)'><span>([\s\S]+?)<\/span>/i
    );
  const [__, time, date] = story.match(
    /soloHora">([\s\S]+?)<div class="fpo_overlay_ticker">([\s\S]+?)<\/div>/i
  );

  const tickers = [...story.matchAll(/data-ticker='([\s\S]+?)'/gi)].map(
    (i) => i[1]
  );

  if (tickers.some((t) => consts.indexOf(t) > -1))
    stories.push({
      date: `${date} ${time} GMT-${isDST() ? '7' : '8'}`,
      tickers: tickers.join(','),
      priority,
      topic,
      link,
      title: title.replace(/&#039;/g, "'").replace(/&amp;#39;/g, "'")
    });
}

return stories.reverse();
