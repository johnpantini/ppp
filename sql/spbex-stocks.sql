create table if not exists public.spbex_stocks(
  isin text primary key,
  ticker text not null,
  name text not null,
  currency text not null
);

create or replace function populate_spbex_stocks()
returns void as
$$
try {
  const instruments = JSON.parse(plv8.execute(`select content from http_get('https://api.tinkoff.ru/trading/stocks/list?sortType=ByName&orderType=Asc&country=All')`)[0].content)
    .payload.values || [];

  const values = instruments.map(i => {
    return `('${i.symbol.isin}', '${i.symbol.ticker}', '${i.symbol.showName.replace("'", "''")}', '${i.symbol.currency}')`;
  });

  if (values.length)
    plv8.execute(`insert into public.spbex_stocks(isin, ticker, name, currency) values ${values.join(',')} on conflict do nothing`);
} catch (e) {
  plv8.elog(NOTICE, e.toString());
}
$$ language plv8;

select populate_spbex_stocks();
