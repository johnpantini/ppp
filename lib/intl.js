// ppp global may not be defined in shared worker
if (
  typeof WorkerGlobalScope !== 'undefined' &&
  self instanceof WorkerGlobalScope
) {
  self.ppp ??= {
    i18nLocale: 'en-US'
  };
}

/** Currency codes displayed using the platform's localized currency symbols. */
export const KNOWN_CURRENCIES = [
  'EUR',
  'AMD',
  'KZT',
  'KGS',
  'UZS',
  'USD',
  'CNY',
  'TJS',
  'BYN',
  'HKD',
  'XAU',
  'TRY',
  'XAG',
  'RUB'
];

/**
 * Parses numeric form input with comma decimals or comma thousands separators.
 * Whitespace and non-ASCII characters are removed; blank input becomes zero.
 * @param {string | number | null | undefined} string User-entered number.
 * @returns {number} Parsed value, or NaN for nonempty unparseable text.
 */
export function stringToFloat(string) {
  if (typeof string === 'number') {
    return string;
  }

  if (!string) {
    return 0;
  }

  if (string.includes(',') && string.includes('.')) {
    string = string.replaceAll(/,/gi, '');
  }

  return parseFloat(
    string
      .replace(',', '.')
      .replace(/\s/g, '')
      .replace(/[^\x20-\x7E]/g, '')
  );
}

/** @returns {string} Decimal separator for the current PPP locale. */
export function decimalSeparator() {
  const numberWithDecimalSeparator = 1.1;

  return /** @type {Intl.NumberFormatPart} */ (
    Intl.NumberFormat(ppp.i18nLocale)
      .formatToParts(numberWithDecimalSeparator)
      .find((part) => part.type === 'decimal')
  ).value;
}

/** Decimal separator captured when this module is first imported. */
export const decSeparator = decimalSeparator();

/**
 * Chooses the configured tick, falling back to 0.0001 below 1 and 0.01 otherwise.
 * @param {import('./types.js').Instrument | null | undefined} instrument Instrument metadata.
 * @param {number | string} [price] Reference price; nonnumeric input uses the configured tick or 0.01.
 * @param {boolean} [alwaysUsePrice] Derive the tick from a valid price even if configured.
 * @returns {number} Price increment, or zero without an instrument.
 */
export function getInstrumentMinPriceIncrement(
  instrument,
  price,
  alwaysUsePrice
) {
  if (!instrument) return 0;

  if (typeof price !== 'number' || isNaN(price))
    return instrument.minPriceIncrement || 0.01;

  price = stringToFloat(price);

  let pi = instrument.minPriceIncrement;

  if (!pi || alwaysUsePrice) {
    pi = price < 1 ? 0.0001 : 0.01;
  }

  return pi;
}

/**
 * Determines display precision, including four decimals for currency instruments.
 * @param {import('./types.js').Instrument | null | undefined} instrument Instrument metadata.
 * @param {number | string} [price] Reference price; zero is displayed with two decimals.
 * @param {boolean} [alwaysUsePrice] Derive the tick from price.
 * @returns {number} Decimal digits in the selected price increment.
 */
export function getInstrumentPrecision(instrument, price, alwaysUsePrice) {
  if (!instrument) return 0;

  if (instrument.type === 'currency') {
    return 4;
  }

  if (price === 0 || price === '0') {
    return 2;
  }

  const pi = getInstrumentMinPriceIncrement(instrument, price, alwaysUsePrice);

  const [dec, frac] = pi.toString().split('.');

  return frac ? frac.length : 0;
}

/**
 * @param {import('./types.js').Instrument | null | undefined} instrument Quantity metadata.
 * @returns {number} Decimal digits in minQuantityIncrement, or zero by default.
 */
export function getInstrumentQuantityPrecision(instrument) {
  if (!instrument) return 0;

  const [dec, frac] = (instrument.minQuantityIncrement ?? 1)
    .toString()
    .split('.');

  return frac ? frac.length : 0;
}

/**
 * @param {string | number | Date} date Date accepted by the Date constructor.
 * @param {Intl.DateTimeFormatOptions} [options] Locale formatting overrides.
 * @returns {string} Localized date, or an em dash for a falsy input.
 */
export function formatDateWithOptions(date, options = {}) {
  if (!date) return '—';

  return new Intl.DateTimeFormat(
    ppp.i18nLocale,
    Object.assign(
      {
        hour12: false
      },
      options
    )
  ).format(new Date(date));
}

/**
 * @param {string | number | Date} date Date accepted by the Date constructor.
 * @returns {string} Localized month/day and 24-hour time, or an em dash.
 */
export function formatDate(date) {
  if (!date) return '—';

  return new Intl.DateTimeFormat(ppp.i18nLocale, {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).format(new Date(date));
}

/**
 * Formats elapsed seconds as a UTC clock time (wraps after 24 hours).
 * @param {number} [seconds=0] Elapsed seconds.
 * @param {Intl.DateTimeFormatOptions} [options] Clock formatting overrides.
 * @returns {string} Clock time, or an em dash for a nonnumeric input.
 */
export function formatDuration(seconds = 0, options = {}) {
  if (typeof seconds !== 'number') return '—';

  return new Date(seconds * 1000).toLocaleTimeString(
    ppp.i18nLocale,
    Object.assign(
      {
        timeZone: 'Etc/UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      },
      options
    )
  );
}

/**
 * Formats a price with its currency symbol or futures/index points suffix.
 * @param {number} price Price in quote currency.
 * @param {import('./types.js').Instrument} instrument Currency and tick metadata.
 * @param {Intl.NumberFormatOptions} [formatterOptions] Number formatting overrides.
 * @returns {string} Localized price, or an em dash for missing/invalid data.
 */
export function formatPrice(price, instrument, formatterOptions = {}) {
  if (!instrument || typeof price !== 'number' || isNaN(price)) return '—';

  if (!instrument.currency) return '—';

  const precision = getInstrumentPrecision(instrument, price);

  if (instrument.type === 'future' || instrument.type === 'index') {
    return (
      new Intl.NumberFormat(ppp.i18nLocale, {
        style: 'decimal',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(price) + ' pt.'
    );
  }

  if (!KNOWN_CURRENCIES.includes(instrument?.currency)) {
    return (
      new Intl.NumberFormat(
        ppp.i18nLocale,
        Object.assign(
          {
            style: 'decimal',
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
          },
          formatterOptions
        )
      ).format(price) +
      (instrument.currency === 'N/A' ? '' : ` ${instrument.currency}`)
    );
  }

  return (
    new Intl.NumberFormat(
      ppp.i18nLocale,
      Object.assign(
        {
          style: 'decimal',
          currency: instrument.currency,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        },
        formatterOptions
      )
    ).format(price) + ` ${priceCurrencySymbol(instrument)}`
  );
}

/**
 * Formats just the price. Without an instrument, preserves the editable input
 * representation and uses the decimal separator captured at module import.
 * @param {number} price Price in quote currency.
 * @param {import('./types.js').Instrument} [instrument] Precision metadata.
 * @param {boolean} [derivePrecisionFromPrice] Ignore the configured tick.
 * @returns {string} Formatted price; zero without an instrument becomes an empty string.
 */
export function formatPriceWithoutCurrency(
  price,
  instrument,
  derivePrecisionFromPrice
) {
  if (typeof instrument === 'undefined') {
    return (price || '').toString().replace('.', decSeparator);
  }

  if (typeof price !== 'number' || isNaN(price)) return '—';

  const precision = getInstrumentPrecision(
    instrument,
    price,
    derivePrecisionFromPrice
  );

  return new Intl.NumberFormat(ppp.i18nLocale, {
    style: 'decimal',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(price);
}

/**
 * @param {number} commission Commission amount in quote currency.
 * @param {import('./types.js').Instrument} instrument Currency metadata.
 * @param {Intl.NumberFormatOptions} [formatterOptions] Overrides for nonstandard currencies.
 * @returns {string} Localized commission with two to three decimals, or an em dash.
 */
export function formatCommission(
  commission,
  instrument,
  formatterOptions = {}
) {
  if (!instrument || typeof commission !== 'number' || isNaN(commission))
    return '—';

  if (!instrument.currency) return '—';

  if (KNOWN_CURRENCIES.indexOf(instrument?.currency) === -1) {
    return (
      new Intl.NumberFormat(
        ppp.i18nLocale,
        Object.assign(
          {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 3
          },
          formatterOptions
        )
      ).format(commission) + ` ${instrument.currency}`
    );
  }

  return new Intl.NumberFormat(ppp.i18nLocale, {
    style: 'currency',
    currency: instrument.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(commission);
}

/**
 * @param {number} amount Monetary amount or futures points.
 * @param {import('./types.js').Instrument} [instrument] Currency or quote asset.
 * @param {Intl.NumberFormatOptions} [options] Number formatting overrides.
 * @returns {string} Localized amount with its unit, or an em dash.
 */
export function formatAmount(amount, instrument = {}, options = {}) {
  const currency = instrument.currency ?? instrument.quoteCryptoAsset;

  if (!currency || typeof amount !== 'number' || isNaN(amount)) return '—';

  if (instrument.type === 'future') {
    return (
      new Intl.NumberFormat(
        ppp.i18nLocale,
        Object.assign(
          {
            style: 'decimal'
          },
          options
        )
      ).format(amount) + ' пт.'
    );
  }

  if (!KNOWN_CURRENCIES.includes(currency)) {
    return (
      new Intl.NumberFormat(
        ppp.i18nLocale,
        Object.assign(
          {
            style: 'decimal',
            minimumFractionDigits: 0
          },
          options
        )
      ).format(amount) + ` ${currency}`
    );
  }

  return new Intl.NumberFormat(
    ppp.i18nLocale,
    Object.assign(
      {
        style: 'currency',
        minimumFractionDigits: 0,
        currency
      },
      options
    )
  ).format(amount);
}

/**
 * @param {number} change Signed price difference in quote currency.
 * @param {import('./types.js').Instrument} instrument Price precision metadata.
 * @param {Intl.NumberFormatOptions} [options] Formatting overrides.
 * @returns {string} Signed localized difference, or an em dash.
 */
export function formatAbsoluteChange(change, instrument, options = {}) {
  if (!instrument || typeof change !== 'number' || isNaN(change)) return '—';

  return new Intl.NumberFormat(
    ppp.i18nLocale,
    Object.assign(
      {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: Math.max(
          2,
          getInstrumentPrecision(instrument, change)
        ),
        signDisplay: 'always'
      },
      options
    )
  ).format(change);
}

/**
 * @param {number} change Fractional change; 0.05 represents 5%.
 * @param {Intl.NumberFormatOptions} [options] Formatting overrides.
 * @returns {string} Signed percentage with two decimals by default, or an em dash.
 */
export function formatRelativeChange(change, options = {}) {
  if (typeof change !== 'number' || isNaN(change)) return '—';

  return new Intl.NumberFormat(
    ppp.i18nLocale,
    Object.assign(
      {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always'
      },
      options
    )
  ).format(change);
}

/**
 * @param {number} change Fraction (0.05 is 5%).
 * @returns {string} Percentage or an em dash.
 */
export function formatPercentage(change) {
  if (typeof change !== 'number' || isNaN(change)) return '—';

  return new Intl.NumberFormat(ppp.i18nLocale, {
    style: 'percent',
    maximumFractionDigits: 3
  }).format(change);
}

/**
 * @param {number} quantity Quantity in the trader's units.
 * @param {import('./types.js').Instrument} [instrument] Quantity step metadata.
 * @returns {string} Quantity rounded to the step's precision, or an em dash.
 */
export function formatQuantity(quantity, instrument) {
  if (typeof quantity !== 'number' || isNaN(quantity)) return '—';

  let precision = 0;

  if (typeof instrument?.minQuantityIncrement === 'number') {
    const [_, frac] = instrument.minQuantityIncrement.toString().split('.');

    precision = frac?.length ?? 0;
  }

  return new Intl.NumberFormat(ppp.i18nLocale, {
    style: 'decimal',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(quantity);
}

/**
 * Maps a wholly Cyrillic query to uppercase keys on the Latin keyboard layout.
 * @param {string} text Instrument search query.
 * @returns {string} Mapped query, or the unchanged input for mixed/Latin text.
 */
export function cyrillicToLatin(text) {
  if (/^\p{Script=Cyrillic}+$/u.test(text)) {
    const EN = 'QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>~';
    const RU = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁ';
    const map = {};

    for (let i = 0; i < RU.length; i++) {
      map[RU[i]] = EN[i];
    }

    return text
      .split('')
      .map((l) => map[l.toUpperCase()])
      .join('');
  } else {
    return text;
  }
}

/**
 * Maps keyboard positions to uppercase Cyrillic when Latin letters are present.
 * Unmapped characters in a converted query are omitted, matching existing search.
 * @param {string} text Instrument search query.
 * @returns {string} Mapped query, or the unchanged input without Latin letters.
 */
export function latinToCyrillic(text) {
  if (/[a-z]+/i.test(text)) {
    const EN = 'QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>~,.`\'[];';
    const RU = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁБЮЁЭХЪЖ';
    const map = {};

    for (let i = 0; i < RU.length; i++) {
      map[EN[i]] = RU[i];
    }

    return text
      .split('')
      .map((l) => map[l.toUpperCase()])
      .join('');
  } else {
    return text;
  }
}

/**
 * @param {import('./types.js').Instrument} instrument Currency/type metadata.
 * @returns {string | undefined} Localized currency symbol, points or quote asset.
 */
export function priceCurrencySymbol(instrument) {
  if (instrument?.type === 'future' || instrument?.type === 'index')
    return 'pt.';

  if (instrument?.type === 'cryptocurrency') return instrument.quoteCryptoAsset;

  if (instrument?.currency === 'USDT') return 'USDT';

  if (instrument?.currency && instrument.currency !== 'N/A') {
    return (0)
      .toLocaleString(ppp.i18nLocale, {
        style: 'currency',
        currency: instrument.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      .replace(/\d/g, '')
      .trim();
  } else return '';
}

/**
 * @param {string} currencyCode Currency code from the instrument.
 * @returns {string | undefined} Localized name for supported currencies; other codes are unchanged.
 */
export function currencyName(currencyCode) {
  if (KNOWN_CURRENCIES.indexOf(currencyCode) === -1) {
    return currencyCode;
  }

  if (!currencyCode) return '—';

  const currencyNames = new Intl.DisplayNames([ppp.i18nLocale], {
    type: 'currency'
  });

  return currencyNames.of(currencyCode);
}

/**
 * Checks the existing US seasonal date window using local calendar midnights.
 * Both boundary dates are inclusive; this helper is not a timezone offset lookup.
 * @param {Date} [currentDate] Date to check, defaulting to now.
 * @returns {boolean} Whether it lies between March's second and November's first Sunday.
 */
export function isDST(currentDate = new Date()) {
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch =
    firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember =
    firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);

  return (
    currentDate.getTime() <= end.getTime() &&
    currentDate.getTime() >= start.getTime()
  );
}

/**
 * @param {number} bytes Signed byte count.
 * @param {object} [options] Unit and precision settings.
 * @param {boolean} [options.si=true] Use powers of 1000; false uses 1024.
 * @param {number} [options.dp=1] Decimal places for scaled units.
 * @param {boolean} [options.useIntl=false] Use locale compact byte formatting.
 * @returns {string} Human-readable byte count.
 */
export function formatFileSize(
  bytes,
  { si = true, dp = 1, useIntl = false } = {}
) {
  if (useIntl) {
    return new Intl.NumberFormat(ppp.i18nLocale, {
      style: 'unit',
      unit: 'byte',
      notation: 'compact',
      unitDisplay: 'narrow'
    }).format(bytes);
  }

  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
}

/**
 * @param {number} number Value to format.
 * @param {Intl.NumberFormatOptions} [options] Formatting options.
 * @returns {string} Number in the current PPP locale.
 */
export function formatNumber(number, options = {}) {
  return new Intl.NumberFormat(ppp.i18nLocale, options).format(number);
}

/**
 * @param {number} volume Trade volume.
 * @param {Intl.NumberFormatOptions} [options] Overrides for compact formatting.
 * @returns {string} Localized volume with one to two decimals by default.
 */
export function formatVolume(volume, options = {}) {
  return new Intl.NumberFormat(
    ppp.i18nLocale,
    Object.assign(
      {
        style: 'decimal',
        notation: 'compact',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      },
      options
    )
  ).format(volume);
}

/**
 * Parses absolute, percentage (%) or tick-count (+) order distances.
 * @param {string} [string=''] User-entered distance; commas are accepted as decimals.
 * @returns {Partial<import('./types.js').Distance>} Empty object for invalid input.
 */
export function parseDistance(string = '') {
  /** @type {'' | '%' | '+'} */
  let unit = '';

  string = string.trim();

  if (string.endsWith('%')) {
    unit = '%';
  } else if (string.endsWith('+')) {
    unit = '+';
  }

  string = string
    .replace(',', '.')
    .replace(/\s/g, '')
    .replace(/[^\x20-\x7E]/g, '');

  let value = parseFloat(string);

  if (unit === '+') {
    value = Math.trunc(value);
  }

  if (isNaN(value)) {
    return {};
  }

  return { value, unit };
}

/**
 * @param {Partial<import('./types.js').Distance>} [distance] Parsed order distance.
 * @returns {string} Localized distance with its unit, or empty without a value.
 */
export function distanceToString({ value, unit } = {}) {
  if (typeof value === 'undefined') {
    return '';
  }

  if (unit === '%') {
    return new Intl.NumberFormat(ppp.i18nLocale, {
      style: 'percent',
      maximumFractionDigits: 2
    }).format(value / 100);
  } else if (unit === '+') {
    return `${Math.trunc(value)} +`;
  } else {
    return new Intl.NumberFormat(ppp.i18nLocale, {
      style: 'decimal'
    }).format(value);
  }
}
