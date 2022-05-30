select cron.unschedule('ppp-[%#payload.serviceId%]');
drop function if exists ppp_interval_[%#payload.serviceId%](duration interval);
drop function if exists ppp_perform_job_[%#payload.serviceId%]();
