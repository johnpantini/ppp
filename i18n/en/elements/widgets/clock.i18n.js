export default function (i18n) {
  i18n.extend({
    $clockWidget: {
      descriptionBeforeName: 'The',
      descriptionAfterName:
        'widget displays the time according to the specified settings.',
      interface: 'Interface',
      displayTimeInHeader: 'Display time in the header (instead of the name)',
      headerTimeFormat: 'Header display format',
      formats: {
        default: 'Hours, minutes, seconds',
        day1: 'Day, hours, minutes, seconds',
        compact: 'Hours, minutes',
        day2: 'Day, hours, minutes'
      }
    }
  });
}
