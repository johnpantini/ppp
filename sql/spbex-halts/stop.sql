do $$
try {
  plv8.execute(`select cron.unschedule('ppp-[%#ctx.document._id%]')`);
} catch(e) {
  void 0;
} $$ language plv8;
drop function if exists ppp_interval_[%#ctx.document._id%](duration interval);
drop function if exists ppp_perform_job_[%#ctx.document._id%]();
