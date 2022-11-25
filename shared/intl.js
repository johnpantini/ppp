export function getInstrumentPrecision(instrument) {
  const [dec, frac] = (instrument.minPriceIncrement ?? 0.01)
    .toString()
    .split('.');

  return frac ? frac.length : 0;
}

export function formatDate(date) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).format(new Date(date));
}

export function formatPrice(price, instrument) {
  if (!instrument || typeof price !== 'number' || isNaN(price)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: instrument.currency,
    minimumFractionDigits: getInstrumentPrecision(instrument)
  }).format(price);
}

export function formatPriceWithoutCurrency(price, instrument) {
  if (!instrument || typeof price !== 'number' || isNaN(price)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: getInstrumentPrecision(instrument)
  }).format(price);
}

export function formatAmount(amount, currency) {
  if (!currency || typeof amount !== 'number' || isNaN(amount)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatAbsoluteChange(price, instrument) {
  if (!instrument || typeof price !== 'number' || isNaN(price)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: getInstrumentPrecision(instrument),
    signDisplay: 'always'
  }).format(price);
}

export function formatRelativeChange(change) {
  if (typeof change !== 'number' || isNaN(change)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(change);
}

export function formatQuantity(quantity) {
  if (typeof quantity !== 'number' || isNaN(quantity)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(quantity);
}

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

export function priceCurrencySymbol(instrument) {
  if (instrument) {
    return (0)
      .toLocaleString('ru-RU', {
        style: 'currency',
        currency: instrument.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      .replace(/\d/g, '')
      .trim();
  } else return '';
}
