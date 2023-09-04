// ==PPPScript==
// @version 1
// ==/PPPScript==

const url =
  "[%#ctx.document.url || 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664'%]";
const fetch = plv8.find_function('ppp_fetch');
const rss = plv8.find_function('ppp_xml_parse')(
  fetch(url, {
    headers: {
      'User-Agent': '[%#navigator.userAgent%]'
    }
  }).responseText
);

return (rss.rss.channel.item || [])
  .map((item) => {
    return {
      title: item.title,
      description: item.description,
      pub_date: item.pubDate || item['dc:date'] || new Date().toISOString(),
      link: item.link
    };
  })
  .sort((a, b) => Date.parse(a.pub_date) - Date.parse(b.pub_date));
