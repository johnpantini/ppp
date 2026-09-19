export default function (i18n) {
  i18n.extend({
    $serviceSpbexHaltsPage: {
      supabaseApiProfile: 'Профиль API Supabase',
      addSupabaseApi: 'Добавить API Supabase',
      baseUrl: 'Базовый URL',
      baseUrlDescription:
        'Ссылка на базовый ресурс биржи. Это может быть адрес прокси-сервера.',
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
      saveToPPPAndUpdateInSupabase: 'Сохранить в PPP и обновить в Supabase'
    }
  });
}
