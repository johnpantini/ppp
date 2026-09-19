export default function (i18n) {
  i18n.extend({
    $apiYcPage: {
      serviceAccount: 'Сервисный аккаунт Yandex Cloud',
      serviceAccountDescription: 'Идентификатор сервисного аккаунта.',
      publicKeyId: 'Идентификатор открытого ключа Yandex Cloud',
      publicKeyIdDescription:
        'Идентификатор открытого авторизованного ключа сервисного аккаунта.',
      privateKey: 'Закрытый ключ Yandex Cloud',
      privateKeyDescription:
        'Закрытый авторизованный ключ сервисного аккаунта.',
      staticKeyId: 'Идентификатор статического ключа',
      staticKeyIdDescription: 'Требуется для доступа к хранилищу объектов.',
      staticKeySecret: 'Секрет статического ключа',
      jwtGenerationFailed:
        'Не удалось сгенерировать JWT. Проверьте правильность ключей Yandex Cloud.',
      iamTokenFailed:
        'Не удалось получить IAM-токен. Проверьте правильность ключей Yandex Cloud.',
      bucketListFailed:
        'Не удалось выгрузить список бакетов. Проверьте статический ключ.'
    }
  });
}
