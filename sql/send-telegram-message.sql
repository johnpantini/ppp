-- Old version
drop function if exists send_telegram_message(chat_id text, bot_token text, msg text);
drop function if exists send_telegram_message(chat_id text, bot_token text, msg text, options json);

create or replace function send_telegram_message(chat_id text, bot_token text, msg text, options json)
returns json as
$$
try {
  let formData = `chat_id=${chat_id}&text=${msg}`;

  if (typeof options.parse_mode === 'undefined')
    formData += '&parse_mode=html';

  if (typeof options.entities !== 'undefined')
    formData += `&entities=${encodeURIComponent(options.entities)}`;

  if (options.disable_web_page_preview === true)
    formData += '&disable_web_page_preview=true';

  if (options.disable_notification === true)
    formData += '&disable_notification=true';

  if (options.protect_content === true)
    formData += '&protect_content=true';

  if (typeof options.reply_markup !== 'undefined')
    formData += `&reply_markup=${encodeURIComponent(options.reply_markup)}`;

  return plv8.execute(`select content from http_post('https://api.telegram.org/bot${bot_token}/sendMessage',
    '${formData}', 'application/x-www-form-urlencoded')`)[0].content;
} catch (e) {
  plv8.elog(NOTICE, e.toString());

  return null;
}
$$ language plv8;
