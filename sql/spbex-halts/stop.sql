do $$
try {
  plv8.execute(`select cron.unschedule('ppp-[%#payload.serviceId%]')`);
} catch(e) {
  void 0;
} $$ language plv8;
drop function if exists ppp_interval_[%#payload.serviceId%](duration interval);
drop function if exists ppp_perform_job_[%#payload.serviceId%]();
