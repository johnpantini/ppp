import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $instrumentsManagePage: {
      binanceSpot: 'Binance (spot)',
      utexMarginStocks: 'UTEX Margin (stocks & ETFs, US)',
      ibStocks: 'Interactive Brokers (stocks & ETFs, US)',
      psinaStocks: 'Psina (stocks & ETFs, US)',
      alpacaStocks: 'Alpaca (stocks & ETFs, US)',
      alorSpbx: 'Alor (SPB Exchange)',
      alorMoexSecurities: 'Alor (MOEX), stock market',
      alorForts: 'Alor (MOEX), derivatives market',
      alorMoexFxMetals: 'Alor (MOEX), FX and precious metals',
      dictionary: 'Dictionary',
      dictionaryDescription:
        'Select a source dictionary. Instruments are added and edited within the existing dictionary.',
      exchange: 'Exchange',
      exchangeDescription:
        'The exchange where the instrument is traded (listed).',
      symbolDescription:
        'Enter a symbol to find the instrument in the database.',
      notFoundInDatabase: 'The instrument was not found in the database.',
      fullName: 'Full name',
      fullNameDescription: 'The full name of the instrument.',
      typeDescription: 'The type of the traded instrument.',
      cryptocurrencyPair: 'Cryptocurrency pair',
      currency: 'Currency',
      currencyDescription: 'The currency the instrument is traded in.',
      notApplicable: 'Not applicable',
      utexSymbolID: 'UTEX instrument identifier',
      identifier: 'Identifier',
      flags: 'Flags',
      flagsDescription: 'Instrument parameters holding a Yes or No value.',
      forQualInvestorFlag: 'For qualified investors only',
      amortizationFlag: 'Bond with amortization',
      floatingCouponFlag: 'Floating coupon',
      perpetualFlag: 'Perpetual bond',
      subordinatedFlag: 'Subordinated bond',
      lot: 'Lot size',
      lotDescription: 'The minimum quantity available for purchase.',
      minPriceIncrement: 'Price step',
      minPriceIncrementDescription:
        'If set to zero, the step will be determined automatically based on the instrument price.',
      minQuantityIncrement: 'Quantity step',
      minNotional: 'Minimum order amount',
      minNotionalDescription: 'Measured in units of the quote asset.',
      isinDescription: 'International Securities Identification Number.',
      figi: 'FIGI identifier',
      classCodeTitle: 'Class code (trading section)',
      classCode: 'Class code',
      issueKind: 'Issue kind',
      documentary: 'Documentary',
      nonDocumentary: 'Non-documentary',
      initialNominal: 'Initial nominal',
      nominal: 'Current nominal',
      maturityDate: 'Bond maturity date',
      maturityDatePlaceholder: 'Maturity date',
      couponQuantityPerYear: 'Number of coupon payments per year',
      couponQuantityPerYearPlaceholder: 'Coupons per year',
      baseAsset: 'Base asset',
      expirationDate: 'Expiration date',
      quoteAsset: 'Quote asset',
      userFlags: 'User flags',
      userFlagsDescription:
        'Hold a Yes or No value; not overwritten when importing instruments.',
      removedFlag: 'Hidden from widget search',
      saveInstrument: 'Save instrument'
    }
  });
}
