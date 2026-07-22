export default function (i18n) {
  i18n.extend({
    $serviceCloudflareWorkerPage: {
      globalLinkBanner: 'Global service link in Cloudflare:',
      cloudflareApiProfile: 'Cloudflare API profile',
      cloudflareApiProfileDescription:
        'Required for authorization, cannot be changed after creation.',
      addCloudflareApi: 'Add a Cloudflare API',
      serviceImplementation: 'Service implementation',
      serviceImplementationDescription: 'The Cloudflare Worker code.',
      versioning: 'Versioning',
      versioningDescription:
        'Enable this option to track the service version and offer updates.',
      trackVersionByFile: 'Track the service version by this file:',
      enterUrlPlaceholder: 'Enter a link',
      predefinedTemplates: 'Predefined service templates',
      predefinedTemplatesDescription:
        'Use predefined service templates to set them up quickly.',
      customTemplate: 'By the tracking file',
      defaultTemplate: 'Test example',
      tradingviewTemplate: 'Proxy for ru.tradingview.com',
      theflyTemplate: 'Proxy for thefly.com',
      psinaPusherTemplate: 'Pusher and Psina integration',
      psinaUsNewsBodyExtractionTemplate: 'News (Psina) - content from AstraDB',
      choosePusherApi: 'Choose a Pusher API profile',
      chooseAstraDbApi: 'Choose an AstraDB API profile',
      doNotFillEnvVars: 'Do not fill in environment variables',
      fillFormsWithTemplate: 'Fill out the forms with this template',
      envVars: 'Environment variables',
      envVarsDescription:
        'A JavaScript object with environment variables that will be passed to the Worker.',
      secretEnvVars: 'Encrypted environment variables',
      secretEnvVarsDescription:
        'A JavaScript object with environment variables that will be passed to the Worker as is, but stored encrypted in the database.',
      saveAndUpdateInCloudflare: 'Save to PPP and update in Cloudflare',
      cannotLoadTemplateFile: 'Failed to load the template file.',
      templateLoaded: 'The "%{template}" template has been loaded.',
      invalidUrl: 'Invalid URL',
      cannotReadSubdomain: 'Failed to read the Cloudflare Workers subdomain.',
      subdomainNotConfigured:
        'No subdomain is configured in the Cloudflare Workers service',
      codeContainsErrors: 'The code contains errors',
      cannotDeployWorker: 'Failed to deploy the service to Cloudflare.',
      cannotEnableSubdomain:
        'Failed to enable the *.dev subdomain for the service in Cloudflare.'
    }
  });
}
