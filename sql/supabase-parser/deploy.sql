create table if not exists public.parsed_records_[%#ctx.document._id%](
  ppp_counter bigint generated always as identity,
  [%#ctx.document.tableSchema%]
);

create or replace function get_consts_data_[%#ctx.document._id%]()
returns json as
$$
try {
  return [%#ctx.document.consts%];
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return null;
}
$$ language plv8;

create or replace function parse_[%#ctx.document._id%](consts json)
returns json as
$$
try {
  [%#ctx.document.parsingCode%]
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return [];
}
$$ language plv8;

create or replace function send_telegram_message_for_parsed_record_[%#ctx.document._id%](msg text, options json)
returns json as
$$
  const result = plv8.find_function('send_telegram_message')('[%#ctx.document.channel ?? void 0%]', '[%#ctx.document.bot.token ?? void 0%]', msg, options);

  plv8.execute('select pg_sleep(3)');

  return result;
$$ language plv8;

create or replace function format_parsed_record_message_[%#ctx.document._id%](record json)
returns json as
$$
  const consts = plv8.find_function('get_consts_data_[%#ctx.document._id%]')();

  [%#ctx.document.formatterCode ?? ''%]
$$ language plv8;

-- INSERT
create or replace function parsed_records_insert_trigger_[%#ctx.document._id%]()
returns trigger as
$$
  if ([%#ctx.document.telegramEnabled%]) {
    const message = plv8.find_function('format_parsed_record_message_[%#ctx.document._id%]')(NEW);

    if (typeof message === 'string')
      plv8.find_function('send_telegram_message_for_parsed_record_[%#ctx.document._id%]')(message, {});
    else if (typeof message === 'object' && message.text)
      plv8.find_function('send_telegram_message_for_parsed_record_[%#ctx.document._id%]')(message.text, message.options || {});
  }

  const TABLE_NAME = 'public.parsed_records_[%#ctx.document._id%]';

  [%#ctx.document.insertTriggerCode%]

  return null;
$$ language plv8;

create or replace trigger parsed_records_insert_trigger_[%#ctx.document._id%]
  after insert
  on public.parsed_records_[%#ctx.document._id%] for each row
  execute procedure parsed_records_insert_trigger_[%#ctx.document._id%]();

-- DELETE
create or replace function parsed_records_delete_trigger_[%#ctx.document._id%]()
returns trigger as
$$
  const TABLE_NAME = 'public.parsed_records_[%#ctx.document._id%]';

  [%#ctx.document.deleteTriggerCode%]

  return null;
$$ language plv8;

create or replace trigger parsed_records_delete_trigger_[%#ctx.document._id%]
  after delete
  on public.parsed_records_[%#ctx.document._id%] for each row
  execute procedure parsed_records_delete_trigger_[%#ctx.document._id%]();

-- INSERT (keep row count steady)
create or replace function keep_max_record_count_[%#ctx.document._id%]()
returns trigger as
$$
begin
  execute('delete from public.parsed_records_[%#ctx.document._id%] where ppp_counter < (select ppp_counter from public.parsed_records_[%#ctx.document._id%] order by ppp_counter desc limit 1 offset [%#ctx.document.depth - 1%])');

  return null;
end;
$$ language plpgsql;

create or replace trigger keep_max_record_count_[%#ctx.document._id%]
  after insert
  on public.parsed_records_[%#ctx.document._id%] for each statement
  execute procedure keep_max_record_count_[%#ctx.document._id%]();

create or replace function process_parsed_records_[%#ctx.document._id%]()
returns json as
$$
try {
  const records = plv8.find_function('parse_[%#ctx.document._id%]')(plv8.find_function('get_consts_data_[%#ctx.document._id%]')());

  for (const record of records) {
    try {
      const keys = Object.keys(record);
      const vals = [];

      for (const k of keys) {
        if (typeof record[k] === 'boolean' || typeof record[k] === 'number')
          vals.push(record[k]);
        else
          vals.push(`'${(record[k] || '').toString().replace(/'/g, "''")}'`);
      }

      plv8.execute(`insert into public.parsed_records_[%#ctx.document._id%](${keys.join(',')}) values(${vals.join(',')}) on conflict do nothing`);
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
