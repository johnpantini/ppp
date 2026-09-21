/**
 * Registers the i18n/ru/elements/pages/service-systemd-ppp-aspirant phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $serviceSystemdPppAspirantPage: {
      redisStorage: 'Хранилище Redis',
      redisStorageDescription: 'Персистентность для сервиса.',
      addRedisApi: 'Добавить API Redis',
      server: 'Сервер',
      serverDescription:
        'Сервер, на котором будет запущен Aspirant. Нельзя изменить после создания сервиса.',
      addServer: 'Добавить сервер',
      nodeJsVersion: 'Версия node.js',
      nodeJsVersionDescription:
        'Выберите, какую версию node.js следует установить.',
      globalNetworkDomain: 'Домен глобальной сети',
      globalNetworkDomainDescription:
        'Опциональный домен, чтобы сгенерировать сертификаты.',
      tailnetDomain: 'Домен Tailnet',
      tailnetDomainDescription: 'Домен сервера в сети Tailscale.',
      saveAndDeployToServer: 'Сохранить в PPP и развернуть на сервере',
      updateTailnetCerts: 'Обновить сертификаты Tailnet',
      updateTailnetCertsTitle: 'Обновление сертификатов Tailnet',
      updateTailnetCertsConfirm:
        'Будут обновлены сертификаты сервера в сети Tailnet. Подтвердите действие.',
      cannotConfigureAspirant: 'Не удалось настроить сервис Aspirant.',
      cannotRestartAspirant: 'Не удалось перезапустить сервис Aspirant.',
      cannotStopAspirant: 'Не удалось остановить сервис Aspirant.'
    }
  });
}
