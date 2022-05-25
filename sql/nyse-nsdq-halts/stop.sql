drop function if exists loop_[%#payload.serviceId%]();
create or replace function loop_[%#payload.serviceId%]()
returns void as
$$
  try {
    plv8.execute(`select dblink_disconnect('ppp-[%#payload.serviceId%]');`);
  } catch (e) {
    return;
  }
$$ language plv8;
