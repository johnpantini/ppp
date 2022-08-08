do $$
try {
  plv8.execute(`select cron.unschedule('ppp-[%#ctx.document._id%]')`);
} catch(e) {
  void 0;
} $$ language plv8;
drop function if exists ppp_interval_[%#ctx.document._id%](duration interval);
drop function if exists ppp_perform_job_[%#ctx.document._id%]();

drop function if exists process_spbex_halts_[%#ctx.document._id%]() cascade;

drop trigger if exists spbex_halts_insert_trigger_[%#ctx.document._id%] on public.spbex_halts_[%#ctx.document._id%] cascade;
drop function if exists spbex_halts_insert_trigger_[%#ctx.document._id%]() cascade;

drop trigger if exists keep_max_record_count_[%#ctx.document._id%] on public.spbex_halts_[%#ctx.document._id%] cascade;
drop function if exists keep_max_record_count_[%#ctx.document._id%]() cascade;

drop function if exists format_spbex_halt_message_[%#ctx.document._id%](isin text, ticker text, name text,
  currency text, date text, url text, start text, finish text) cascade;

drop function if exists send_telegram_message_for_spbex_halt_[%#ctx.document._id%](msg text, options json) cascade;
drop function if exists parse_spbex_halt_[%#ctx.document._id%](url text, isin text) cascade;
drop function if exists parse_spbex_halts_[%#ctx.document._id%]() cascade;
drop function if exists populate_spbex_halts_instruments_[%#ctx.document._id%]() cascade;
drop function if exists get_spbex_halts_instruments_[%#ctx.document._id%]() cascade;

drop table if exists public.spbex_halts_[%#ctx.document._id%] cascade;
drop table if exists public.spbex_halts_instruments_[%#ctx.document._id%] cascade;
