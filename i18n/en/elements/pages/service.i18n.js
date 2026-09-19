import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $servicePage: {
      searchPlaceholder: 'Search',
      continue: 'Continue',
      update: 'Update',
      restart: 'Restart',
      pause: 'Pause',
      officialWebsite: 'Official website',
      cloudflareWorkerDescription: 'Serverless development by Cloudflare.',
      nyseNsdqHaltsTitle: 'NYSE/NASDAQ trading halts',
      nyseNsdqHaltsDescription:
        'NYSE/NASDAQ trading halts notifications in Telegram.',
      haltsRssFeed: 'Halts RSS feed',
      supabaseParserTitle: 'Parser (Supabase)',
      supabaseParserDescription:
        'A general-purpose parser based on Supabase.',
      aspirantDescription:
        'A service for running long-lived processes in the cloud.',
      inCloud: 'In the cloud',
      byUrl: 'By URL',
      aspirantWorkerDescription:
        'A worker process in the Aspirant cloud service.'
    }
  });
}
