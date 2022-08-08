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
  plv8.execute(`select pg_sleep([%#ctx.document.interval - 1%]);`);

  return plv8.find_function('process_spbex_halts_[%#ctx.document._id%]')();
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

select dblink_connect('ppp-[%#ctx.document._id%]', 'dbname=[%#ctx.document.supabaseApi.db%] port=[%#ctx.document.supabaseApi.port%] host=[%#("db." + new URL(ctx.document.supabaseApi.url).hostname)%] user=[%#ctx.document.supabaseApi.user%] password=[%#ctx.document.supabaseApi.password%]');
select dblink_send_query('ppp-[%#ctx.document._id%]', 'select process_spbex_halts_[%#ctx.document._id%]();');
