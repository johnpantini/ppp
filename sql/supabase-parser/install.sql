create table if not exists public.parsed_records_[%#payload.serviceId%](
  ppp_counter integer generated always as identity,
  [%#payload.tableSchema%]
);

create or replace function get_consts_data_[%#payload.serviceId%]()
returns json as
$$
try {
  [%#payload.constsCode%]
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return null;
}
$$ language plv8;

create or replace function parse_[%#payload.serviceId%](consts json)
returns json as
$$
try {
  [%#payload.parsingCode%]
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return [];
}
$$ language plv8;

create or replace function send_telegram_message_for_parsed_record_[%#payload.serviceId%](msg text, options json)
returns json as
$$
  const result = plv8.find_function('send_telegram_message')('[%#payload.channel%]', '[%#payload.botToken%]', msg, options);

  plv8.execute('select pg_sleep(3)');

  return result;
$$ language plv8;

create or replace function format_parsed_record_message_[%#payload.serviceId%](record json)
returns json as
$$
  [%#payload.formatterCode%]
$$ language plv8;

-- INSERT
create or replace function parsed_records_insert_trigger_[%#payload.serviceId%]()
returns trigger as
$$
  if ([%#payload.telegramEnabled%]) {
    const message = plv8.find_function('format_parsed_record_message_[%#payload.serviceId%]')(NEW);

    if (typeof message === 'string')
      plv8.find_function('send_telegram_message_for_parsed_record_[%#payload.serviceId%]')(message, {});
    else if (typeof message === 'object' && message.text)
      plv8.find_function('send_telegram_message_for_parsed_record_[%#payload.serviceId%]')(message.text, message.options || {});
  }

  const TABLE_NAME = 'public.parsed_records_[%#payload.serviceId%]';

  [%#payload.insertTriggerCode%]

  return null;
$$ language plv8;

create or replace trigger parsed_records_insert_trigger_[%#payload.serviceId%]
  after insert
  on public.parsed_records_[%#payload.serviceId%] for each row
  execute procedure parsed_records_insert_trigger_[%#payload.serviceId%]();

-- DELETE
create or replace function parsed_records_delete_trigger_[%#payload.serviceId%]()
returns trigger as
$$
  const TABLE_NAME = 'public.parsed_records_[%#payload.serviceId%]';

  [%#payload.deleteTriggerCode%]

  return null;
$$ language plv8;

create or replace trigger parsed_records_delete_trigger_[%#payload.serviceId%]
  after delete
  on public.parsed_records_[%#payload.serviceId%] for each row
  execute procedure parsed_records_delete_trigger_[%#payload.serviceId%]();

-- INSERT (keep row count steady)
create or replace function keep_max_record_count_[%#payload.serviceId%]()
returns trigger as
$$
begin
  execute('delete from public.parsed_records_[%#payload.serviceId%] where ppp_counter < (select ppp_counter from public.parsed_records_[%#payload.serviceId%] order by ppp_counter desc limit 1 offset [%#payload.depth%])');

  return null;
end;
$$ language plpgsql;

create or replace trigger keep_max_record_count_[%#payload.serviceId%]
  after insert
  on public.parsed_records_[%#payload.serviceId%] for each statement
  execute procedure keep_max_record_count_[%#payload.serviceId%]();

create or replace function process_parsed_records_[%#payload.serviceId%]()
returns json as
$$
try {
  const records = plv8.find_function('parse_[%#payload.serviceId%]')(plv8.find_function('get_consts_data_[%#payload.serviceId%]')());

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

      plv8.execute(`insert into public.parsed_records_[%#payload.serviceId%](${keys.join(',')}) values(${vals.join(',')}) on conflict do nothing`);
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
