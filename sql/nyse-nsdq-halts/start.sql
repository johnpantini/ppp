drop function if exists loop_[%#payload.serviceId%]();
create or replace function loop_[%#payload.serviceId%]()
returns void as
$$
  try {
    plv8.find_function('process_nyse_nsdq_halts_[%#payload.serviceId%]')();
    plv8.execute(`select pg_sleep([%#payload.interval%]);`);
    plv8.execute(`select dblink_connect('ppp-[%#payload.serviceId%]', 'dbname=[%#payload.api.db%] port=[%#payload.api.port%] host=[%#payload.api.hostname%] user=[%#payload.api.user%] password=[%#payload.api.password%]');`);
    plv8.execute(`select dblink_send_query('ppp-[%#payload.serviceId%]', 'select loop_[%#payload.serviceId%]();');`);
    plv8.execute(`select dblink_disconnect('ppp-[%#payload.serviceId%]');`);
  } catch (e) {
    plv8.execute(`select http(('POST', '[%#payload.api.url%]/rest/v1/rpc/loop_[%#payload.serviceId%]', array[http_header('apikey', '[%#payload.api.key%]')], 'application/json', '{}')::http_request);`);
  }
$$ language plv8;
