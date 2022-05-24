drop function if exists loop_[%#payload.serviceId%]();
drop function if exists process_nyse_nsdq_halts_[%#payload.serviceId%]() cascade;
drop trigger if exists nyse_nsdq_halts_insert_trigger_[%#payload.serviceId%] on public.spbex_halts_[%#payload.serviceId%] cascade;
drop function if exists nyse_nsdq_halts_insert_trigger_[%#payload.serviceId%]() cascade;
drop function if exists format_nyse_nsdq_halt_message_[%#payload.serviceId%](halt_date text, halt_time text, symbol text,
  name text, market text, reason_code text, pause_threshold_price text, resumption_date text, resumption_quote_time text,
  resumption_trade_time text) cascade;
-- Old version
drop function if exists send_telegram_message_for_nyse_nsdq_halt_[%#payload.serviceId%](msg text) cascade;
drop function if exists send_telegram_message_for_nyse_nsdq_halt_[%#payload.serviceId%](msg text, options json) cascade;
drop function if exists parse_nyse_nsdq_halts_[%#payload.serviceId%]() cascade;
drop function if exists get_nyse_nsdq_halts_symbols_[%#payload.serviceId%]() cascade;
drop table if exists public.nyse_nsdq_halts_[%#payload.serviceId%] cascade;
