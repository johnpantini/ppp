import { describe, expect, test } from 'bun:test';
import * as intl from '../../lib/intl.js';
import { app } from '../setup.js';

const stock = {
  symbol: 'AAPL',
  type: 'stock',
  currency: 'USD',
  minPriceIncrement: 0.01
};

test.each([
  [12.5, 12.5],
  ['', 0],
  [undefined, 0],
  [null, 0],
  ['1 234,56', 1234.56],
  ['1,234.56', 1234.56],
  ['−12,5', 12.5],
  ['-12,5', -12.5],
  ['\u00a01\u202f234,5', 1234.5],
  ['abc', NaN]
])(
  'stringToFloat(%p) preserves existing input conventions',
  (input, expected) => {
    expect(intl.stringToFloat(input)).toBe(expected);
  }
);

test('price and quantity precision follow instrument increments and fallback rules', () => {
  expect(intl.getInstrumentMinPriceIncrement(null, 10)).toBe(0);
  expect(intl.getInstrumentMinPriceIncrement({}, 0.5)).toBe(0.0001);
  expect(intl.getInstrumentMinPriceIncrement({}, 1)).toBe(0.01);
  expect(
    intl.getInstrumentMinPriceIncrement({ minPriceIncrement: 0.05 }, 0.5)
  ).toBe(0.05);
  expect(intl.getInstrumentMinPriceIncrement(stock, 0.5, true)).toBe(0.0001);
  expect(intl.getInstrumentMinPriceIncrement(stock, NaN)).toBe(0.01);
  expect(intl.getInstrumentPrecision(null)).toBe(0);
  expect(intl.getInstrumentPrecision({ type: 'currency' }, 0)).toBe(4);
  expect(intl.getInstrumentPrecision({ minPriceIncrement: 0.001 }, 0)).toBe(2);
  expect(intl.getInstrumentPrecision({ minPriceIncrement: 0.001 }, 1)).toBe(3);
  expect(intl.getInstrumentPrecision({ minPriceIncrement: 1 }, 10)).toBe(0);
  expect(intl.getInstrumentQuantityPrecision(null)).toBe(0);
  expect(intl.getInstrumentQuantityPrecision({})).toBe(0);
  expect(
    intl.getInstrumentQuantityPrecision({ minQuantityIncrement: 0.001 })
  ).toBe(3);
});

describe.each(['en-US', 'ru-RU'])('formatting in %s', (locale) => {
  test('uses the active locale and respects caller options', () => {
    app.i18nLocale = locale;
    const number = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(1234.5);

    expect(intl.formatPrice(1234.5, stock)).toBe(`${number} $`);
    expect(intl.formatPriceWithoutCurrency(1234.5, stock)).toBe(number);
    expect(intl.formatPrice(1234.5, { ...stock, type: 'future' })).toBe(
      `${number} pt.`
    );
    expect(intl.formatPrice(1234.5, { ...stock, currency: 'USDT' })).toBe(
      `${number} USDT`
    );
    expect(intl.formatPrice(1234.5, { ...stock, currency: 'N/A' })).toBe(
      number
    );
    expect(intl.formatNumber(1234.5, { useGrouping: false })).toBe(
      locale === 'en-US' ? '1234.5' : '1234,5'
    );
    expect(intl.decimalSeparator()).toBe(locale === 'en-US' ? '.' : ',');
    expect(intl.formatDuration(3661)).toBe('01:01:01');
    expect(
      intl.formatDateWithOptions('2025-01-02T03:04:05Z', {
        timeZone: 'UTC',
        year: 'numeric'
      })
    ).toBe('2025');
  });
});

test('formats amounts, commissions, changes, quantities and sizes', () => {
  expect(intl.formatAmount(1250, stock)).toBe('$1,250');
  expect(intl.formatAmount(10, { quoteCryptoAsset: 'USDT' })).toBe('10 USDT');
  expect(intl.formatAmount(10, { ...stock, type: 'future' })).toBe('10 пт.');
  expect(intl.formatCommission(1.234, stock)).toBe('$1.234');
  expect(intl.formatCommission(1.234, { currency: 'USDT' })).toBe('1.234 USDT');
  expect(intl.formatAbsoluteChange(-1.5, stock)).toBe('-1.50');
  expect(intl.formatAbsoluteChange(0, stock)).toBe('+0.00');
  expect(intl.formatRelativeChange(0.125)).toBe('+12.50%');
  expect(intl.formatPercentage(0.125)).toBe('12.5%');
  expect(intl.formatQuantity(1.234, { minQuantityIncrement: 0.01 })).toBe(
    '1.23'
  );
  expect(intl.formatQuantity(1.6)).toBe('2');
  expect(intl.formatVolume(1200)).toBe('1.2K');
  expect(intl.formatFileSize(0)).toBe('0 B');
  expect(intl.formatFileSize(1000)).toBe('1.0 kB');
  expect(intl.formatFileSize(1024, { si: false, dp: 2 })).toBe('1.00 KiB');
  expect(intl.formatFileSize(-2000)).toBe('-2.0 kB');
  expect(intl.formatFileSize(999999)).toBe('1.0 MB');
  expect(intl.formatFileSize(1000, { useIntl: true })).toContain('1K');
});

test('missing numeric data uses the UI placeholder while zero remains meaningful', () => {
  for (const fn of [
    intl.formatRelativeChange,
    intl.formatPercentage,
    intl.formatQuantity
  ]) {
    expect(fn(NaN)).toBe('—');
    expect(fn(undefined)).toBe('—');
    expect(fn(0)).not.toBe('—');
  }

  for (const fn of [
    intl.formatPrice,
    intl.formatCommission,
    intl.formatAbsoluteChange
  ]) {
    expect(fn(NaN, stock)).toBe('—');
    expect(fn(10, undefined)).toBe('—');
  }

  expect(intl.formatPrice(10, {})).toBe('—');
  expect(intl.formatCommission(10, {})).toBe('—');
  expect(intl.formatAmount(10)).toBe('—');
  expect(intl.formatPriceWithoutCurrency(NaN, stock)).toBe('—');
  expect(intl.formatPriceWithoutCurrency(0)).toBe('');
  expect(intl.formatPriceWithoutCurrency(1.5)).toBe('1.5');
  expect(intl.formatDate(null)).toBe('—');
  expect(intl.formatDateWithOptions(null)).toBe('—');
  expect(intl.formatDuration('60')).toBe('—');
});

test.each([
  ['', {}],
  ['abc', {}],
  [' 1,5 % ', { value: 1.5, unit: '%' }],
  ['2.9+', { value: 2, unit: '+' }],
  ['-2,5', { value: -2.5, unit: '' }]
])('parses distance %p', (value, expected) => {
  expect(intl.parseDistance(value)).toEqual(expected);
});

test('distance formatting retains the units used by orders', () => {
  expect(intl.distanceToString()).toBe('');
  expect(intl.distanceToString({ value: 1.5, unit: '%' })).toBe('1.5%');
  expect(intl.distanceToString({ value: 2.9, unit: '+' })).toBe('2 +');
  expect(intl.distanceToString({ value: 1.25, unit: '' })).toBe('1.25');
});

test('keyboard layout conversion and currency labels retain existing behavior', () => {
  expect(intl.cyrillicToLatin('фззд')).toBe('APPL');
  expect(intl.cyrillicToLatin('AAPL')).toBe('AAPL');
  expect(intl.latinToCyrillic('aapl')).toBe('ФФЗД');
  expect(intl.latinToCyrillic('123')).toBe('123');
  expect(intl.priceCurrencySymbol({ type: 'future' })).toBe('pt.');
  expect(
    intl.priceCurrencySymbol({
      type: 'cryptocurrency',
      quoteCryptoAsset: 'BTC'
    })
  ).toBe('BTC');
  expect(intl.priceCurrencySymbol({ currency: 'USDT' })).toBe('USDT');
  expect(intl.priceCurrencySymbol({ currency: 'N/A' })).toBe('');
  expect(intl.currencyName('USD')).toBe('US Dollar');
  expect(intl.currencyName('USDT')).toBe('USDT');
});

test('DST helper retains its local-calendar inclusive boundaries', () => {
  expect(intl.isDST(new Date(2025, 0, 15))).toBe(false);
  expect(intl.isDST(new Date(2025, 6, 15))).toBe(true);
  expect(intl.isDST(new Date(2025, 2, 9))).toBe(true);
  expect(intl.isDST(new Date(2025, 10, 2))).toBe(true);
  expect(intl.isDST(new Date(2025, 10, 2, 1))).toBe(false);
});
