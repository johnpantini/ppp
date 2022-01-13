create or replace function send_telegram_message(chat_id text, bot_token text, msg text)
returns json as
$$
try {
  return plv8.execute(`select content from http_post('https://api.telegram.org/bot${bot_token}/sendMessage',
    'chat_id=${chat_id}&text=${msg}&parse_mode=html', 'application/x-www-form-urlencoded')`)[0].content;
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return null;
}
$$ language plv8;
