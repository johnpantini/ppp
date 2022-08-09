do $$
try {
  plv8.execute(`select cron.unschedule('ppp-[%#ctx.document._id%]')`);
} catch(e) {
  void 0;
} $$ language plv8;
drop function if exists ppp_interval_[%#ctx.document._id%](duration interval);
drop function if exists ppp_perform_job_[%#ctx.document._id%]();

drop function if exists process_parsed_records_[%#ctx.document._id%]() cascade;

drop trigger if exists parsed_records_delete_trigger_[%#ctx.document._id%] on public.parsed_records_[%#ctx.document._id%] cascade;
drop function if exists parsed_records_delete_trigger_[%#ctx.document._id%]() cascade;

drop trigger if exists keep_max_record_count_[%#ctx.document._id%] on public.parsed_records_[%#ctx.document._id%] cascade;
drop function if exists keep_max_record_count_[%#ctx.document._id%]() cascade;

drop trigger if exists parsed_records_insert_trigger_[%#ctx.document._id%] on public.parsed_records_[%#ctx.document._id%] cascade;
drop function if exists parsed_records_insert_trigger_[%#ctx.document._id%]() cascade;

drop function if exists format_parsed_record_message_[%#ctx.document._id%](record json) cascade;
drop function if exists send_telegram_message_for_parsed_record_[%#ctx.document._id%](msg text, options json) cascade;
drop function if exists parse_[%#ctx.document._id%](consts json) cascade;
drop function if exists get_consts_data_[%#ctx.document._id%]() cascade;

drop table if exists public.parsed_records_[%#ctx.document._id%] cascade;
