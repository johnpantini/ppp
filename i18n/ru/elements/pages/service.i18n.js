import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $servicePage: {
      searchPlaceholder: 'Поиск',
      continue: 'Продолжить',
      update: 'Обновить',
      restart: 'Перезапустить',
      pause: 'Приостановить',
      officialWebsite: 'Официальный ресурс',
      cloudflareWorkerDescription: 'Бессерверная разработка от Cloudflare.',
      nyseNsdqHaltsTitle: 'Торговые паузы NYSE/NASDAQ',
      nyseNsdqHaltsDescription:
        'Оповещение о торговых паузах NYSE/NASDAQ в Telegram.',
      haltsRssFeed: 'RSS-лента пауз',
      supabaseParserTitle: 'Парсер (Supabase)',
      supabaseParserDescription:
        'Парсер общего назначения на основе Supabase.',
      aspirantDescription:
        'Сервис для запуска долго работающих процессов в облаке.',
      inCloud: 'В облаке',
      byUrl: 'По адресу',
      aspirantWorkerDescription: 'Рабочий процесс в облачном сервисе Aspirant.'
    }
  });
}
