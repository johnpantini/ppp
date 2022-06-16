select cron.unschedule('ppp-[%#payload.serviceId%]');
drop function if exists ppp_interval_[%#payload.serviceId%](duration interval);
drop function if exists ppp_perform_job_[%#payload.serviceId%]();

drop function if exists process_parsed_records_[%#payload.serviceId%]() cascade;

drop trigger if exists keep_max_record_count_[%#payload.serviceId%] on public.parsed_records_[%#payload.serviceId%] cascade;
drop function if exists keep_max_record_count_[%#payload.serviceId%]() cascade;

drop trigger if exists parsed_records_delete_trigger_[%#payload.serviceId%] on public.parsed_records_[%#payload.serviceId%] cascade;
drop function if exists parsed_records_delete_trigger_[%#payload.serviceId%]() cascade;

drop trigger if exists parsed_records_insert_trigger_[%#payload.serviceId%] on public.parsed_records_[%#payload.serviceId%] cascade;
drop function if exists parsed_records_insert_trigger_[%#payload.serviceId%]() cascade;

drop function if exists format_parsed_record_message_[%#payload.serviceId%](record json) cascade;
drop function if exists send_telegram_message_for_parsed_record_[%#payload.serviceId%](msg text, options json) cascade;
drop function if exists parse_[%#payload.serviceId%](consts json) cascade;
drop function if exists get_consts_data_[%#payload.serviceId%]() cascade;

drop table if exists public.parsed_records_[%#payload.serviceId%] cascade;
