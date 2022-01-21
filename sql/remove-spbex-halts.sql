drop function if exists process_spbex_halts_[%#payload.serviceId%]();
drop trigger if exists spbex_halts_insert_trigger_[%#payload.serviceId%] on public.spbex_halts_[%#payload.serviceId%];
drop function if exists spbex_halts_insert_trigger_[%#payload.serviceId%]();
drop function if exists format_spbex_halt_message_[%#payload.serviceId%](isin text, ticker text, name text,
  currency text, date text, url text, start text, finish text);
drop function if exists send_telegram_message_for_spbex_halt_[%#payload.serviceId%](msg text);
drop function if exists parse_spbex_halt_[%#payload.serviceId%](url text, isin text);
drop function if exists parse_spbex_halts_[%#payload.serviceId%]();
drop function if exists populate_spbex_halts_instruments_[%#payload.serviceId%]();
drop function if exists get_spbex_halts_instruments_[%#payload.serviceId%]();
drop table if exists public.spbex_halts_[%#payload.serviceId%];
drop table if exists public.spbex_halts_instruments_[%#payload.serviceId%];
