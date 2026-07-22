import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $updatesPage: {
      updateMayTakeMinutes:
        'Для полного применения обновления может потребоваться несколько минут.',
      currentVersion: 'Текущая версия',
      updateApp: 'Обновить приложение',
      repoInSync: 'Репозиторий приложения синхронизирован с последней версией',
      currentAppVersion: 'Текущая версия приложения:',
      checkAgain: 'Проверить ещё раз',
      fetchTargetRefFailed:
        'Не удалось получить ссылку HEAD на ветку main официального репозитория. Убедитесь, что токен GitHub не истёк.',
      fetchTargetCommitFailed:
        'Не удалось получить последний commit ветки main официального репозитория.',
      fetchGitHubUserFailed: 'Не удалось получить профиль пользователя GitHub.',
      fetchCurrentRefFailed:
        'Не удалось получить ссылку HEAD на ветку main в текущем репозитории.',
      fetchCurrentCommitFailed:
        'Не удалось получить последний commit ветки main в текущем репозитории.',
      updateHeadsFailed:
        'Не удалось изменить ссылку HEAD на ветку main в текущем репозитории.',
      pagesBuildFailed:
        'Не удалось выполнить запрос на принудительную сборку GitHub Pages.',
      appSynchronized:
        'Приложение синхронизировано с последней версией. Когда обновление будет готово, вы получите уведомление.'
    }
  });
}
