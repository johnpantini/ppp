create or replace function ppp_perform_job_[%#payload.serviceId%]()
returns json as $$
  plv8.execute(`select pg_sleep([%#payload.interval - 1%]);`);

  return plv8.find_function('process_spbex_halts_[%#payload.serviceId%]')();
$$ language plv8;

create or replace function ppp_interval_[%#payload.serviceId%](duration interval default '60 seconds')
returns bool as
$$
declare
  end_time timestamptz := now() + duration;
begin
  while now() < end_time loop
    perform from dblink('dbname=[%#payload.api.db%] port=[%#payload.api.port%] host=[%#payload.api.hostname%] user=[%#payload.api.user%] password=[%#payload.api.password%]', 'select ppp_perform_job_[%#payload.serviceId%]();') as (res text);
    perform pg_sleep(1);
  end loop;

  return true;
end;
$$ language plpgsql;

select cron.schedule('ppp-[%#payload.serviceId%]', '* * * * *', 'select ppp_interval_[%#payload.serviceId%]()');

select dblink_connect('ppp-[%#payload.serviceId%]', 'dbname=[%#payload.api.db%] port=[%#payload.api.port%] host=[%#payload.api.hostname%] user=[%#payload.api.user%] password=[%#payload.api.password%]');
select dblink_send_query('ppp-[%#payload.serviceId%]', 'select process_spbex_halts_[%#payload.serviceId%]();');
