import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $updatesPage: {
      updateMayTakeMinutes:
        'It may take a few minutes for the update to fully apply.',
      currentVersion: 'Current version',
      updateApp: 'Update the app',
      repoInSync:
        'The application repository is in sync with the latest version',
      currentAppVersion: 'Current app version:',
      checkAgain: 'Check again',
      fetchTargetRefFailed:
        'Failed to fetch the HEAD ref of the main branch of the official repository. Make sure your GitHub token has not expired.',
      fetchTargetCommitFailed:
        'Failed to fetch the latest commit of the main branch of the official repository.',
      fetchGitHubUserFailed: 'Failed to fetch the GitHub user profile.',
      fetchCurrentRefFailed:
        'Failed to fetch the HEAD ref of the main branch of the current repository.',
      fetchCurrentCommitFailed:
        'Failed to fetch the latest commit of the main branch of the current repository.',
      updateHeadsFailed:
        'Failed to update the HEAD ref of the main branch of the current repository.',
      pagesBuildFailed:
        'Failed to request a forced GitHub Pages build.',
      appSynchronized:
        'The app is in sync with the latest version. You will be notified when the update is ready.'
    }
  });
}
