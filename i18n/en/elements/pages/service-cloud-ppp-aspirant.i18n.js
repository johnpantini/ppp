export default function (i18n) {
  i18n.extend({
    $serviceCloudPppAspirantPage: {
      redisStorage: 'Redis storage',
      redisStorageDescription: 'Persistence for the service.',
      addRedisApi: 'Add a Redis API',
      cloudProviderApiProfile: 'Cloud provider API profile',
      cloudProviderApiDescription:
        'Northflank or Render. Can only be chosen at creation time or after the service has been removed.',
      northflankBanner:
        'Northflank: a project named ppp must be created in the cloud beforehand.',
      renderBannerBeforeSuffix:
        'Render: create an empty service (Docker type) named aspirant-',
      renderBannerSuffixWord: 'suffix',
      renderBannerAfterSuffix: '. Generate the suffix below.',
      addNorthflankApi: 'Add a Northflank API',
      addRenderApi: 'Add a Render API',
      slugHeader: 'Service suffix in the cloud provider (11 characters)',
      slugDescription:
        'This value must be unique and confidential. It can only be set at creation time or after the service has been removed.',
      slugPlaceholder: 'Generate a unique value with the button',
      generateSlug: 'Generate a unique value',
      saveAndDeployToCloud: 'Save to PPP and deploy to the cloud',
      slugLengthError: 'The value must contain 11 characters',
      slugCharsError: 'Only digits and Latin letters are allowed',
      cannotFetchRenderServices:
        'Failed to fetch the service list from the Render cloud. The operation cannot be completed.',
      serviceNotFoundInRender:
        'Service %{serviceName} was not found in the Render cloud. Create it before saving to PPP.',
      cannotFetchNorthflankProjects:
        'Failed to fetch the Northflank project list.',
      pppProjectNotFoundInNorthflank:
        'A project named ppp was not found in the Northflank cloud.',
      cannotCreateAspirantService:
        'Failed to create the Aspirant service, see the browser console for details.',
      cannotUpdateRenderEnvVars:
        'Failed to update the service environment variables in the Render cloud.',
      cannotUpdateRenderService:
        'Failed to update the Aspirant service in the Render cloud, see the browser console for details.',
      cannotDeployRenderService:
        'Failed to deploy the Aspirant service to the Render cloud.',
      cannotRestartNorthflankService:
        'Failed to restart the service in the Northflank cloud.',
      cannotRestartRenderService:
        'Failed to restart the service in the Render cloud.',
      cannotStopNorthflankService:
        'Failed to stop the service in the Northflank cloud.',
      cannotStopRenderService: 'Failed to stop the service in the Render cloud.',
      cannotRemoveNorthflankService:
        'Failed to remove the service completely. Remove it manually in the Northflank dashboard.',
      cannotRemoveRenderService:
        'Failed to remove the service completely. Remove it manually in the Render dashboard.'
    }
  });
}
