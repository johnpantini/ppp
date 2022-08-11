create table if not exists public.nyse_nsdq_halts_[%#ctx.document._id%](
  ppp_counter bigint generated always as identity,
  halt_date text,
  halt_time text,
  symbol text,
  name text,
  market text,
  reason_code text,
  pause_threshold_price text,
  resumption_date text,
  resumption_quote_time text,
  resumption_trade_time text,
  primary key(halt_date, halt_time, symbol, reason_code)
);

create or replace function get_nyse_nsdq_halts_symbols_[%#ctx.document._id%]()
returns json as
$$
try {
  return [%#ctx.document.symbols%];
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return [];
}
$$ language plv8;

create or replace function parse_nyse_nsdq_halts_[%#ctx.document._id%]()
returns json as
$$
try {
  const response = plv8.execute(`select content::json->'result' as result from http(('POST', 'https://www.nasdaqtrader.com/RPCHandler.axd', array[http_header('Referer', 'https://www.nasdaqtrader.com/trader.aspx?id=TradeHalts'), http_header('User-Agent', '[%#navigator.userAgent%]')], 'application/json', '{"id":2,"method":"BL_TradeHalt.GetTradeHalts","params":"[]","version":"1.1"}')::http_request)`)[0];
  const lines = response.result.split(/\r?\n/);
  const halts = [];
  const parseLine = (l) => l.replace(/<[^>]*>/gi, '').trim();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('<td>')) {
      const codes = (lines[i + 5] || '').replace(/<[^>]*>/gi, ' ').trim().split(' ');

      halts.push({
        halt_date: parseLine(lines[i]),
        halt_time: parseLine(lines[i + 1]),
        symbol: parseLine(lines[i + 2]),
        name: encodeURIComponent(parseLine(lines[i + 3])).replace(/'/g, '%27'),
        market: parseLine(lines[i + 4]),
        reason_code: codes[codes.length - 1],
        pause_threshold_price: parseLine(lines[i + 6]),
        resumption_date: parseLine(lines[i + 7]),
        resumption_quote_time: parseLine(lines[i + 8]),
        resumption_trade_time: parseLine(lines[i + 9])
      });

      i += 10;
    }
  }

  return halts;
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return [];
}
$$ language plv8;

drop function if exists send_telegram_message_for_nyse_nsdq_halt_[%#ctx.document._id%](msg text, options json);

create or replace function send_telegram_message_for_nyse_nsdq_halt_[%#ctx.document._id%](msg text, options json)
returns json as
$$
  return plv8.find_function('send_telegram_message')('[%#ctx.document.channel%]', '[%#ctx.document.bot.token%]', msg, options);
$$ language plv8;

drop function if exists format_nyse_nsdq_halt_message_[%#ctx.document._id%](
  halt_date text, halt_time text, symbol text, name text, market text, reason_code text, pause_threshold_price text,
  resumption_date text, resumption_quote_time text, resumption_trade_time text);

create or replace function format_nyse_nsdq_halt_message_[%#ctx.document._id%](
  halt_date text, halt_time text, symbol text, name text, market text, reason_code text, pause_threshold_price text,
  resumption_date text, resumption_quote_time text, resumption_trade_time text)
returns json as
$$
  [%#ctx.document.formatterCode%]
$$ language plv8;

create or replace function nyse_nsdq_halts_insert_trigger_[%#ctx.document._id%]()
returns trigger as
$$
  const message = plv8.find_function('format_nyse_nsdq_halt_message_[%#ctx.document._id%]')(
    NEW.halt_date, NEW.halt_time, NEW.symbol, NEW.name, NEW.market, NEW.reason_code, NEW.pause_threshold_price,
    NEW.resumption_date, NEW.resumption_quote_time, NEW.resumption_trade_time
  );

  if (typeof message === 'string')
    plv8.find_function('send_telegram_message_for_nyse_nsdq_halt_[%#ctx.document._id%]')(message, {});
  else if (typeof message === 'object' && message.text)
    plv8.find_function('send_telegram_message_for_nyse_nsdq_halt_[%#ctx.document._id%]')(message.text, message.options || {});

  return null;
$$ language plv8;

create or replace trigger nyse_nsdq_halts_insert_trigger_[%#ctx.document._id%]
  after insert
  on public.nyse_nsdq_halts_[%#ctx.document._id%] for each row
  execute procedure nyse_nsdq_halts_insert_trigger_[%#ctx.document._id%]();

-- INSERT (keep row count steady)
create or replace function keep_max_record_count_[%#ctx.document._id%]()
returns trigger as
$$
begin
  execute('delete from public.nyse_nsdq_halts_[%#ctx.document._id%] where ppp_counter < (select ppp_counter from public.nyse_nsdq_halts_[%#ctx.document._id%] order by ppp_counter desc limit 1 offset [%#ctx.document.depth - 1%])');

  return null;
end;
$$ language plpgsql;

create or replace trigger keep_max_record_count_[%#ctx.document._id%]
  after insert
  on public.nyse_nsdq_halts_[%#ctx.document._id%] for each statement
  execute procedure keep_max_record_count_[%#ctx.document._id%]();

create or replace function process_nyse_nsdq_halts_[%#ctx.document._id%]()
returns json as
$$
try {
  const today = new Date();

  if (today.getUTCDay() === 6)
    return {status: 204};

  for (const halt of plv8.find_function('parse_nyse_nsdq_halts_[%#ctx.document._id%]')()) {
    try {
      if (halt.symbol && plv8.find_function('get_nyse_nsdq_halts_symbols_[%#ctx.document._id%]')().indexOf(halt.symbol) > -1) {
        plv8.execute(`insert into public.nyse_nsdq_halts_[%#ctx.document._id%](halt_date, halt_time, symbol, name,
          market, reason_code, pause_threshold_price, resumption_date, resumption_quote_time,
          resumption_trade_time) values('${halt.halt_date}', '${halt.halt_time}', '${halt.symbol}',
          '${halt.name}', '${halt.market}', '${halt.reason_code}', '${halt.pause_threshold_price}', '${halt.resumption_date}',
          '${halt.resumption_quote_time}', '${halt.resumption_trade_time}') on conflict do nothing`);
      }
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
