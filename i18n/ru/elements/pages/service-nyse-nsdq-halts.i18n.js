import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $serviceNyseNsdqHaltsPage: {
      supabaseApiProfile: 'Профиль API Supabase',
      addSupabaseApi: 'Добавить API Supabase',
      pusherIntegration: 'Интеграция с Pusher',
      pusherIntegrationDescription:
        'Опциональная интеграция, позволяющая принимать сообщения от парсера в канал ppp платформы Pusher.',
      addPusherApi: 'Добавить API Pusher',
      pollingInterval: 'Интервал опроса',
      pollingIntervalDescription:
        'Периодичность проверки новых сообщений о торговых паузах от биржи. Задаётся в секундах.',
      storageDepth: 'Глубина хранения',
      storageDepthDescription:
        'Максимальное количество записей для хранения в базе данных.',
      symbolsToTrack: 'Тикеры для отслеживания',
      symbolsToTrackDescription:
        'Тело функции на языке PLV8, которая возвращает массив тикеров для отслеживания. Можно воспользоваться готовыми шаблонами:',
      trackAllSymbols: 'Отслеживать все тикеры',
      callFunction: 'Выполнить функцию',
      bot: 'Бот',
      botDescription:
        'Будет использован для публикации сообщений о торговых паузах. Должен обладать соответствующими правами в канале/группе.',
      channelOrGroup: 'Канал или группа',
      channelOrGroupDescription:
        'Идентификатор канала или группы, куда будут отправляться уведомления о торговых паузах.',
      notificationFormatting: 'Форматирование уведомлений',
      notificationFormattingDescription:
        'Логика форматирования итогового сообщения в Telegram на языке PLV8.',
      sendTestMessage: 'Отправить тестовое сообщение',
      saveToPPPAndUpdateInSupabase: 'Сохранить в PPP и обновить в Supabase',
      messageSent: 'Сообщение отправлено.',
      functionExecutedSeeConsole:
        'База данных успешно выполнила функцию. Смотрите результат в консоли браузера.'
    }
  });
}
