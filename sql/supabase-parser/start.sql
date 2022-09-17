-- Stop
do $$
try {
  plv8.execute(`select cron.unschedule('ppp-[%#ctx.document._id%]')`);
} catch(e) {
  void 0;
} $$ language plv8;
drop function if exists ppp_interval_[%#ctx.document._id%](duration interval);
drop function if exists ppp_perform_job_[%#ctx.document._id%]();

-- Start
create or replace function ppp_perform_job_[%#ctx.document._id%]()
returns json as $$
  const result = plv8.find_function('process_parsed_records_[%#ctx.document._id%]')();

  plv8.execute(`select pg_sleep([%#ctx.document.interval - 1%]);`);

  return result;
$$ language plv8;

create or replace function ppp_interval_[%#ctx.document._id%](duration interval default '60 seconds')
returns bool as
$$
declare
  end_time timestamptz := now() + duration;
begin
  while now() < end_time loop
    perform from dblink('dbname=[%#ctx.document.supabaseApi.db%] port=[%#ctx.document.supabaseApi.port%] host=[%#("db." + new URL(ctx.document.supabaseApi.url).hostname)%] user=[%#ctx.document.supabaseApi.user%] password=[%#ctx.document.supabaseApi.password%]', 'select ppp_perform_job_[%#ctx.document._id%]();') as (res text);
    perform pg_sleep(1);
  end loop;

  return true;
end;
$$ language plpgsql;

select cron.schedule('ppp-[%#ctx.document._id%]', '* * * * *', 'select ppp_interval_[%#ctx.document._id%]()');
select cron.schedule('ppp-log-run-cleanup', '0 2 * * *', $$delete from cron.job_run_details where end_time < now() - interval '1 day'$$);

select dblink_connect('ppp-[%#ctx.document._id%]', 'dbname=[%#ctx.document.supabaseApi.db%] port=[%#ctx.document.supabaseApi.port%] host=[%#("db." + new URL(ctx.document.supabaseApi.url).hostname)%] user=[%#ctx.document.supabaseApi.user%] password=[%#ctx.document.supabaseApi.password%]');
select dblink_send_query('ppp-[%#ctx.document._id%]', 'select process_parsed_records_[%#ctx.document._id%]();');
