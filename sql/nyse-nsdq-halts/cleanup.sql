do $$
try {
  plv8.execute(`select cron.unschedule('ppp-[%#ctx.document._id%]')`);
} catch(e) {
  void 0;
} $$ language plv8;
drop function if exists ppp_interval_[%#ctx.document._id%](duration interval);
drop function if exists ppp_perform_job_[%#ctx.document._id%]();

drop function if exists process_nyse_nsdq_halts_[%#ctx.document._id%]() cascade;

drop trigger if exists nyse_nsdq_halts_insert_trigger_[%#ctx.document._id%] on public.nyse_nsdq_halts_[%#ctx.document._id%] cascade;
drop function if exists nyse_nsdq_halts_insert_trigger_[%#ctx.document._id%]() cascade;

drop trigger if exists keep_max_record_count_[%#ctx.document._id%] on public.nyse_nsdq_halts_[%#ctx.document._id%] cascade;
drop function if exists keep_max_record_count_[%#ctx.document._id%]() cascade;

drop function if exists format_nyse_nsdq_halt_message_[%#ctx.document._id%](halt_date text, halt_time text, symbol text,
  name text, market text, reason_code text, pause_threshold_price text, resumption_date text, resumption_quote_time text,
  resumption_trade_time text) cascade;

drop function if exists send_telegram_message_for_nyse_nsdq_halt_[%#ctx.document._id%](msg text, options json) cascade;
drop function if exists parse_nyse_nsdq_halts_[%#ctx.document._id%]() cascade;
drop function if exists get_nyse_nsdq_halts_symbols_[%#ctx.document._id%]() cascade;

drop table if exists public.nyse_nsdq_halts_[%#ctx.document._id%] cascade;
