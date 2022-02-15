create table if not exists public.spbex_halts_instruments_[%#payload.serviceId%](
  isin text primary key,
  ticker text not null,
  name text not null,
  currency text not null
);

create table if not exists public.spbex_halts_[%#payload.serviceId%](
  id int primary key,
  isin text not null,
  url text not null
);

create or replace function get_spbex_halts_instruments_[%#payload.serviceId%]()
returns json as
$$
try {
  [%#payload.instrumentsCode%]
} catch (e) {
  plv8.elog(NOTICE, e.toString());
}
$$ language plv8;

create or replace function populate_spbex_halts_instruments_[%#payload.serviceId%]()
returns void as
$$
try {
  const values = plv8.find_function('get_spbex_halts_instruments_[%#payload.serviceId%]')().map(i => {
    return `('${i.isin}', '${i.ticker}', '${i.name}', '${i.currency}')`;
  });

  if (values.length)
    plv8.execute(`insert into public.spbex_halts_instruments_[%#payload.serviceId%](isin, ticker, name, currency) values ${values.join(',')} on conflict do nothing`);
} catch (e) {
  plv8.elog(NOTICE, e.toString());
}
$$ language plv8;

-- Populate SPBEX instruments immediately
select populate_spbex_halts_instruments_[%#payload.serviceId%]();

select http_set_curlopt('CURLOPT_SSL_VERIFYPEER', '0');
select http_set_curlopt('CURLOPT_SSL_VERIFYHOST', '0');

create or replace function parse_spbex_halts_[%#payload.serviceId%]()
returns json as
$$
try {
  plv8.execute("select http_set_curlopt('CURLOPT_SSL_VERIFYPEER', '0')");
  plv8.execute("select http_set_curlopt('CURLOPT_SSL_VERIFYHOST', '0')");

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

create or replace function parse_spbex_halt_[%#payload.serviceId%](url text, isin text)
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

-- Old version
drop function if exists send_telegram_message_for_spbex_halt_[%#payload.serviceId%](msg text);
drop function if exists send_telegram_message_for_spbex_halt_[%#payload.serviceId%](msg text, options json);

create or replace function send_telegram_message_for_spbex_halt_[%#payload.serviceId%](msg text, options json)
returns json as
$$
  return plv8.find_function('send_telegram_message')('[%#payload.channel%]', '[%#payload.botToken%]', msg, options);
$$ language plv8;

-- Old version
drop function if exists format_spbex_halt_message_[%#payload.serviceId%](isin text,
  ticker text, name text, currency text, date text, url text, start text, finish text);

create or replace function format_spbex_halt_message_[%#payload.serviceId%](isin text,
  ticker text, name text, currency text, date text, url text, start text, finish text)
returns json as
$$
  [%#payload.formatterCode%]
$$ language plv8;

create or replace function spbex_halts_insert_trigger_[%#payload.serviceId%]()
returns trigger as
$$
  const halt = plv8.find_function('parse_spbex_halt_[%#payload.serviceId%]')(NEW.url, NEW.isin);

  if (halt) {
    const {
      name, date, start, finish
    } = halt;
    const stocks = plv8.execute(`select isin, ticker, currency, name from public.spbex_halts_instruments_[%#payload.serviceId%] where isin = '${NEW.isin}'`);

    let ticker = '';
    let currency = 'USD';
    let showName = name;

    if (stocks && stocks.length) {
      const stock = stocks[0];

      ticker = stock.ticker;
      currency = stock.currency;
      showName = stock.name;
    }

    const message = plv8.find_function('format_spbex_halt_message_[%#payload.serviceId%]')(NEW.isin, ticker, showName, currency, date,
      NEW.url, start, finish);

    if (typeof message === 'string')
      plv8.find_function('send_telegram_message_for_spbex_halt_[%#payload.serviceId%]')(message, {});
    else
      plv8.find_function('send_telegram_message_for_spbex_halt_[%#payload.serviceId%]')(message.text, message.options || {});
  }

  return NEW;
$$ language plv8;

create or replace trigger spbex_halts_insert_trigger_[%#payload.serviceId%]
  after insert
  on public.spbex_halts_[%#payload.serviceId%] for each row
  execute procedure spbex_halts_insert_trigger_[%#payload.serviceId%]();

create or replace function process_spbex_halts_[%#payload.serviceId%]()
returns json as
$$
try {
  for (const halt of plv8.find_function('parse_spbex_halts_[%#payload.serviceId%]')()) {
    try {
      if (halt.isin)
        plv8.execute(`insert into public.spbex_halts_[%#payload.serviceId%](id, isin, url) values(${halt.id}, '${halt.isin}', '${halt.url}') on conflict do nothing`);
    } catch (e) {
      plv8.elog(NOTICE, e.toString());

      continue;
    }
  }

  return {status: 200};
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return {status: e.toString()};
}
$$ language plv8;
