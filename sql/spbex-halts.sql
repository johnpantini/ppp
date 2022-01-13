create table if not exists public.spbex_halts(
  id int primary key,
  isin text not null,
  url text not null
);

create or replace function parse_spbex_halts()
returns json as
$$
try {
  return plv8.execute("select content from http_get('https://spbexchange.ru/ru/about/news.aspx?sectionrss=30')")[0].content
    .match(
      /приостановке организованных торгов ценными бумагами [\s\S]+?<link>(.*?)<\/link>/gi
    )
    .map((l) => {
      const [title, link] = l
        .replace(/<link>/, '')
        .replace(/<\/link>/, '')
        .replace(/]]><\/title>/, '')
        .replace('&amp;', '&')
        .split(/\r?\n/);

      const p = title.split(/,/);
      const url = link.trim();
      const id = parseInt(url.split(/news=/)[1]);

      return {
        id,
        isin: p[p.length - 1].trim(),
        url
      };
    });
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return null;
}
$$ language plv8;

create or replace function parse_spbex_halt(url text, isin text)
returns json as
$$
try {
  const pageHtml = plv8.execute(`select content from http_get('${url}')`)[0].content;
  const name = pageHtml.match(
    /приостановке организованных торгов ценными бумагами (.*?)<\/h1>/i
  )[1];
  const date = pageHtml.match(/<span class="news-date-time">(.*?)<\/span>/i)[1];
  const start = pageHtml.match(/приостановке в <b>([0-9:]+)<\/b>/)[1];
  const finish = pageHtml.match(/до <b>([0-9:]+)<\/b>/i)[1];

  return {
    name: name.split(', ' + isin)[0].trim(),
    date,
    start,
    finish
  };
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return null;
}
$$ language plv8;

create or replace function spbex_halts_insert_trigger()
returns trigger as
$$
  const halt = plv8.find_function('parse_spbex_halt')(NEW.url, NEW.isin);

  if (halt) {
    const {
      name, date, start, finish
    } = halt;
    const stocks = plv8.execute(`select isin, ticker, currency, name from public.spbex_stocks where isin = '${NEW.isin}'`);

    let ticker = '';
    let currency = 'USD';
    let showName = name;

    if (stocks.length) {
      const stock = stocks[0];

      ticker = stock.ticker;
      currency = stock.currency;
      showName = stock.name;
    }

    const message = plv8.find_function('format_spbex_halt_message')(NEW.isin, ticker, showName, currency, date,
      NEW.url, start, finish);

    plv8.find_function('send_telegram_message_for_spbex_halt')(message);
  }

  return NEW;
$$ language plv8;

create or replace trigger spbex_halts_insert_trigger
  after insert
  on public.spbex_halts for each row
  execute procedure spbex_halts_insert_trigger();

create or replace function process_spbex_halts()
returns json as
$$
try {
  for (const halt of plv8.find_function('parse_spbex_halts')()) {
    try {
      plv8.execute(`insert into public.spbex_halts(id, isin, url) values(${halt.id}, '${halt.isin}', '${halt.url}') on conflict do nothing`);
    } catch (e) {
      plv8.elog(NOTICE, e.toString());

      continue;
    }
  }

  return {status: 200};
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return {status: 500};
}
$$ language plv8;
