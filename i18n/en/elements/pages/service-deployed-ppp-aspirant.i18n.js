export default function (i18n) {
  i18n.extend({
    $serviceDeployedPppAspirantPage: {
      serviceUrl: 'Service URL',
      serviceUrlDescription: 'A link to a running Aspirant service.',
      dockerHint:
        'To run a local Aspirant in Docker, choose a Redis API profile below to generate the command.',
      chooseRedisProfile: 'Choose a Redis profile',
      doNotCheckUrl: 'Do not verify the URL with requests',
      checkAndSaveToPPP: 'Verify and save to PPP',
      urlCannotBeUsed: 'The provided URL cannot be used'
    }
  });
}
