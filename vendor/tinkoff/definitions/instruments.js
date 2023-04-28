import Long from '../../long.js';
import protobuf from '../../protobuf/minimal.js';
import {
  MoneyValue,
  Quotation,
  securityTradingStatusFromJSON,
  securityTradingStatusToJSON
} from './common.js';
import { Timestamp } from './google/protobuf/timestamp.js';

export const protobufPackage = 'tinkoff.public.invest.api.contract.v1';
/** Тип купонов. */
export var CouponType;
(function (CouponType) {
  /** COUPON_TYPE_UNSPECIFIED - Неопределенное значение */
  CouponType[(CouponType['COUPON_TYPE_UNSPECIFIED'] = 0)] =
    'COUPON_TYPE_UNSPECIFIED';
  /** COUPON_TYPE_CONSTANT - Постоянный */
  CouponType[(CouponType['COUPON_TYPE_CONSTANT'] = 1)] = 'COUPON_TYPE_CONSTANT';
  /** COUPON_TYPE_FLOATING - Плавающий */
  CouponType[(CouponType['COUPON_TYPE_FLOATING'] = 2)] = 'COUPON_TYPE_FLOATING';
  /** COUPON_TYPE_DISCOUNT - Дисконт */
  CouponType[(CouponType['COUPON_TYPE_DISCOUNT'] = 3)] = 'COUPON_TYPE_DISCOUNT';
  /** COUPON_TYPE_MORTGAGE - Ипотечный */
  CouponType[(CouponType['COUPON_TYPE_MORTGAGE'] = 4)] = 'COUPON_TYPE_MORTGAGE';
  /** COUPON_TYPE_FIX - Фиксированный */
  CouponType[(CouponType['COUPON_TYPE_FIX'] = 5)] = 'COUPON_TYPE_FIX';
  /** COUPON_TYPE_VARIABLE - Переменный */
  CouponType[(CouponType['COUPON_TYPE_VARIABLE'] = 6)] = 'COUPON_TYPE_VARIABLE';
  /** COUPON_TYPE_OTHER - Прочее */
  CouponType[(CouponType['COUPON_TYPE_OTHER'] = 7)] = 'COUPON_TYPE_OTHER';
  CouponType[(CouponType['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(CouponType || (CouponType = {}));

export function couponTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'COUPON_TYPE_UNSPECIFIED':
      return CouponType.COUPON_TYPE_UNSPECIFIED;
    case 1:
    case 'COUPON_TYPE_CONSTANT':
      return CouponType.COUPON_TYPE_CONSTANT;
    case 2:
    case 'COUPON_TYPE_FLOATING':
      return CouponType.COUPON_TYPE_FLOATING;
    case 3:
    case 'COUPON_TYPE_DISCOUNT':
      return CouponType.COUPON_TYPE_DISCOUNT;
    case 4:
    case 'COUPON_TYPE_MORTGAGE':
      return CouponType.COUPON_TYPE_MORTGAGE;
    case 5:
    case 'COUPON_TYPE_FIX':
      return CouponType.COUPON_TYPE_FIX;
    case 6:
    case 'COUPON_TYPE_VARIABLE':
      return CouponType.COUPON_TYPE_VARIABLE;
    case 7:
    case 'COUPON_TYPE_OTHER':
      return CouponType.COUPON_TYPE_OTHER;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return CouponType.UNRECOGNIZED;
  }
}

export function couponTypeToJSON(object) {
  switch (object) {
    case CouponType.COUPON_TYPE_UNSPECIFIED:
      return 'COUPON_TYPE_UNSPECIFIED';
    case CouponType.COUPON_TYPE_CONSTANT:
      return 'COUPON_TYPE_CONSTANT';
    case CouponType.COUPON_TYPE_FLOATING:
      return 'COUPON_TYPE_FLOATING';
    case CouponType.COUPON_TYPE_DISCOUNT:
      return 'COUPON_TYPE_DISCOUNT';
    case CouponType.COUPON_TYPE_MORTGAGE:
      return 'COUPON_TYPE_MORTGAGE';
    case CouponType.COUPON_TYPE_FIX:
      return 'COUPON_TYPE_FIX';
    case CouponType.COUPON_TYPE_VARIABLE:
      return 'COUPON_TYPE_VARIABLE';
    case CouponType.COUPON_TYPE_OTHER:
      return 'COUPON_TYPE_OTHER';
    case CouponType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип опциона по направлению сделки. */
export var OptionDirection;
(function (OptionDirection) {
  /** OPTION_DIRECTION_UNSPECIFIED - Тип не определен. */
  OptionDirection[(OptionDirection['OPTION_DIRECTION_UNSPECIFIED'] = 0)] =
    'OPTION_DIRECTION_UNSPECIFIED';
  /** OPTION_DIRECTION_PUT - Опцион на продажу. */
  OptionDirection[(OptionDirection['OPTION_DIRECTION_PUT'] = 1)] =
    'OPTION_DIRECTION_PUT';
  /** OPTION_DIRECTION_CALL - Опцион на покупку. */
  OptionDirection[(OptionDirection['OPTION_DIRECTION_CALL'] = 2)] =
    'OPTION_DIRECTION_CALL';
  OptionDirection[(OptionDirection['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(OptionDirection || (OptionDirection = {}));

export function optionDirectionFromJSON(object) {
  switch (object) {
    case 0:
    case 'OPTION_DIRECTION_UNSPECIFIED':
      return OptionDirection.OPTION_DIRECTION_UNSPECIFIED;
    case 1:
    case 'OPTION_DIRECTION_PUT':
      return OptionDirection.OPTION_DIRECTION_PUT;
    case 2:
    case 'OPTION_DIRECTION_CALL':
      return OptionDirection.OPTION_DIRECTION_CALL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OptionDirection.UNRECOGNIZED;
  }
}

export function optionDirectionToJSON(object) {
  switch (object) {
    case OptionDirection.OPTION_DIRECTION_UNSPECIFIED:
      return 'OPTION_DIRECTION_UNSPECIFIED';
    case OptionDirection.OPTION_DIRECTION_PUT:
      return 'OPTION_DIRECTION_PUT';
    case OptionDirection.OPTION_DIRECTION_CALL:
      return 'OPTION_DIRECTION_CALL';
    case OptionDirection.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип расчетов по опциону. */
export var OptionPaymentType;
(function (OptionPaymentType) {
  /** OPTION_PAYMENT_TYPE_UNSPECIFIED - Тип не определен. */
  OptionPaymentType[
    (OptionPaymentType['OPTION_PAYMENT_TYPE_UNSPECIFIED'] = 0)
  ] = 'OPTION_PAYMENT_TYPE_UNSPECIFIED';
  /** OPTION_PAYMENT_TYPE_PREMIUM - Опционы с использованием премии в расчетах. */
  OptionPaymentType[(OptionPaymentType['OPTION_PAYMENT_TYPE_PREMIUM'] = 1)] =
    'OPTION_PAYMENT_TYPE_PREMIUM';
  /** OPTION_PAYMENT_TYPE_MARGINAL - Маржируемые опционы. */
  OptionPaymentType[(OptionPaymentType['OPTION_PAYMENT_TYPE_MARGINAL'] = 2)] =
    'OPTION_PAYMENT_TYPE_MARGINAL';
  OptionPaymentType[(OptionPaymentType['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(OptionPaymentType || (OptionPaymentType = {}));

export function optionPaymentTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'OPTION_PAYMENT_TYPE_UNSPECIFIED':
      return OptionPaymentType.OPTION_PAYMENT_TYPE_UNSPECIFIED;
    case 1:
    case 'OPTION_PAYMENT_TYPE_PREMIUM':
      return OptionPaymentType.OPTION_PAYMENT_TYPE_PREMIUM;
    case 2:
    case 'OPTION_PAYMENT_TYPE_MARGINAL':
      return OptionPaymentType.OPTION_PAYMENT_TYPE_MARGINAL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OptionPaymentType.UNRECOGNIZED;
  }
}

export function optionPaymentTypeToJSON(object) {
  switch (object) {
    case OptionPaymentType.OPTION_PAYMENT_TYPE_UNSPECIFIED:
      return 'OPTION_PAYMENT_TYPE_UNSPECIFIED';
    case OptionPaymentType.OPTION_PAYMENT_TYPE_PREMIUM:
      return 'OPTION_PAYMENT_TYPE_PREMIUM';
    case OptionPaymentType.OPTION_PAYMENT_TYPE_MARGINAL:
      return 'OPTION_PAYMENT_TYPE_MARGINAL';
    case OptionPaymentType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип опциона по стилю. */
export var OptionStyle;
(function (OptionStyle) {
  /** OPTION_STYLE_UNSPECIFIED - Тип не определен. */
  OptionStyle[(OptionStyle['OPTION_STYLE_UNSPECIFIED'] = 0)] =
    'OPTION_STYLE_UNSPECIFIED';
  /** OPTION_STYLE_AMERICAN - Американский опцион. */
  OptionStyle[(OptionStyle['OPTION_STYLE_AMERICAN'] = 1)] =
    'OPTION_STYLE_AMERICAN';
  /** OPTION_STYLE_EUROPEAN - Европейский опцион. */
  OptionStyle[(OptionStyle['OPTION_STYLE_EUROPEAN'] = 2)] =
    'OPTION_STYLE_EUROPEAN';
  OptionStyle[(OptionStyle['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(OptionStyle || (OptionStyle = {}));

export function optionStyleFromJSON(object) {
  switch (object) {
    case 0:
    case 'OPTION_STYLE_UNSPECIFIED':
      return OptionStyle.OPTION_STYLE_UNSPECIFIED;
    case 1:
    case 'OPTION_STYLE_AMERICAN':
      return OptionStyle.OPTION_STYLE_AMERICAN;
    case 2:
    case 'OPTION_STYLE_EUROPEAN':
      return OptionStyle.OPTION_STYLE_EUROPEAN;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OptionStyle.UNRECOGNIZED;
  }
}

export function optionStyleToJSON(object) {
  switch (object) {
    case OptionStyle.OPTION_STYLE_UNSPECIFIED:
      return 'OPTION_STYLE_UNSPECIFIED';
    case OptionStyle.OPTION_STYLE_AMERICAN:
      return 'OPTION_STYLE_AMERICAN';
    case OptionStyle.OPTION_STYLE_EUROPEAN:
      return 'OPTION_STYLE_EUROPEAN';
    case OptionStyle.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип опциона по способу исполнения. */
export var OptionSettlementType;
(function (OptionSettlementType) {
  /** OPTION_EXECUTION_TYPE_UNSPECIFIED - Тип не определен. */
  OptionSettlementType[
    (OptionSettlementType['OPTION_EXECUTION_TYPE_UNSPECIFIED'] = 0)
  ] = 'OPTION_EXECUTION_TYPE_UNSPECIFIED';
  /** OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY - Поставочный тип опциона. */
  OptionSettlementType[
    (OptionSettlementType['OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY'] = 1)
  ] = 'OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY';
  /** OPTION_EXECUTION_TYPE_CASH_SETTLEMENT - Расчетный тип опциона. */
  OptionSettlementType[
    (OptionSettlementType['OPTION_EXECUTION_TYPE_CASH_SETTLEMENT'] = 2)
  ] = 'OPTION_EXECUTION_TYPE_CASH_SETTLEMENT';
  OptionSettlementType[(OptionSettlementType['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(OptionSettlementType || (OptionSettlementType = {}));

export function optionSettlementTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'OPTION_EXECUTION_TYPE_UNSPECIFIED':
      return OptionSettlementType.OPTION_EXECUTION_TYPE_UNSPECIFIED;
    case 1:
    case 'OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY':
      return OptionSettlementType.OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY;
    case 2:
    case 'OPTION_EXECUTION_TYPE_CASH_SETTLEMENT':
      return OptionSettlementType.OPTION_EXECUTION_TYPE_CASH_SETTLEMENT;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OptionSettlementType.UNRECOGNIZED;
  }
}

export function optionSettlementTypeToJSON(object) {
  switch (object) {
    case OptionSettlementType.OPTION_EXECUTION_TYPE_UNSPECIFIED:
      return 'OPTION_EXECUTION_TYPE_UNSPECIFIED';
    case OptionSettlementType.OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY:
      return 'OPTION_EXECUTION_TYPE_PHYSICAL_DELIVERY';
    case OptionSettlementType.OPTION_EXECUTION_TYPE_CASH_SETTLEMENT:
      return 'OPTION_EXECUTION_TYPE_CASH_SETTLEMENT';
    case OptionSettlementType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип идентификатора инструмента. Подробнее об идентификации инструментов: [Идентификация инструментов](https://tinkoff.github.io/investAPI/faq_identification/) */
export var InstrumentIdType;
(function (InstrumentIdType) {
  /** INSTRUMENT_ID_UNSPECIFIED - Значение не определено. */
  InstrumentIdType[(InstrumentIdType['INSTRUMENT_ID_UNSPECIFIED'] = 0)] =
    'INSTRUMENT_ID_UNSPECIFIED';
  /** INSTRUMENT_ID_TYPE_FIGI - Figi. */
  InstrumentIdType[(InstrumentIdType['INSTRUMENT_ID_TYPE_FIGI'] = 1)] =
    'INSTRUMENT_ID_TYPE_FIGI';
  /** INSTRUMENT_ID_TYPE_TICKER - Ticker. */
  InstrumentIdType[(InstrumentIdType['INSTRUMENT_ID_TYPE_TICKER'] = 2)] =
    'INSTRUMENT_ID_TYPE_TICKER';
  /** INSTRUMENT_ID_TYPE_UID - Уникальный идентификатор. */
  InstrumentIdType[(InstrumentIdType['INSTRUMENT_ID_TYPE_UID'] = 3)] =
    'INSTRUMENT_ID_TYPE_UID';
  /** INSTRUMENT_ID_TYPE_POSITION_UID - Идентификатор позиции. */
  InstrumentIdType[(InstrumentIdType['INSTRUMENT_ID_TYPE_POSITION_UID'] = 4)] =
    'INSTRUMENT_ID_TYPE_POSITION_UID';
  InstrumentIdType[(InstrumentIdType['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(InstrumentIdType || (InstrumentIdType = {}));

export function instrumentIdTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'INSTRUMENT_ID_UNSPECIFIED':
      return InstrumentIdType.INSTRUMENT_ID_UNSPECIFIED;
    case 1:
    case 'INSTRUMENT_ID_TYPE_FIGI':
      return InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI;
    case 2:
    case 'INSTRUMENT_ID_TYPE_TICKER':
      return InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER;
    case 3:
    case 'INSTRUMENT_ID_TYPE_UID':
      return InstrumentIdType.INSTRUMENT_ID_TYPE_UID;
    case 4:
    case 'INSTRUMENT_ID_TYPE_POSITION_UID':
      return InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return InstrumentIdType.UNRECOGNIZED;
  }
}

export function instrumentIdTypeToJSON(object) {
  switch (object) {
    case InstrumentIdType.INSTRUMENT_ID_UNSPECIFIED:
      return 'INSTRUMENT_ID_UNSPECIFIED';
    case InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI:
      return 'INSTRUMENT_ID_TYPE_FIGI';
    case InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER:
      return 'INSTRUMENT_ID_TYPE_TICKER';
    case InstrumentIdType.INSTRUMENT_ID_TYPE_UID:
      return 'INSTRUMENT_ID_TYPE_UID';
    case InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID:
      return 'INSTRUMENT_ID_TYPE_POSITION_UID';
    case InstrumentIdType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Статус запрашиваемых инструментов. */
export var InstrumentStatus;
(function (InstrumentStatus) {
  /** INSTRUMENT_STATUS_UNSPECIFIED - Значение не определено. */
  InstrumentStatus[(InstrumentStatus['INSTRUMENT_STATUS_UNSPECIFIED'] = 0)] =
    'INSTRUMENT_STATUS_UNSPECIFIED';
  /** INSTRUMENT_STATUS_BASE - Базовый список инструментов (по умолчанию). Инструменты доступные для торговли через TINKOFF INVEST API. */
  InstrumentStatus[(InstrumentStatus['INSTRUMENT_STATUS_BASE'] = 1)] =
    'INSTRUMENT_STATUS_BASE';
  /** INSTRUMENT_STATUS_ALL - Список всех инструментов. */
  InstrumentStatus[(InstrumentStatus['INSTRUMENT_STATUS_ALL'] = 2)] =
    'INSTRUMENT_STATUS_ALL';
  InstrumentStatus[(InstrumentStatus['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(InstrumentStatus || (InstrumentStatus = {}));

export function instrumentStatusFromJSON(object) {
  switch (object) {
    case 0:
    case 'INSTRUMENT_STATUS_UNSPECIFIED':
      return InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED;
    case 1:
    case 'INSTRUMENT_STATUS_BASE':
      return InstrumentStatus.INSTRUMENT_STATUS_BASE;
    case 2:
    case 'INSTRUMENT_STATUS_ALL':
      return InstrumentStatus.INSTRUMENT_STATUS_ALL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return InstrumentStatus.UNRECOGNIZED;
  }
}

export function instrumentStatusToJSON(object) {
  switch (object) {
    case InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED:
      return 'INSTRUMENT_STATUS_UNSPECIFIED';
    case InstrumentStatus.INSTRUMENT_STATUS_BASE:
      return 'INSTRUMENT_STATUS_BASE';
    case InstrumentStatus.INSTRUMENT_STATUS_ALL:
      return 'INSTRUMENT_STATUS_ALL';
    case InstrumentStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип акций. */
export var ShareType;
(function (ShareType) {
  /** SHARE_TYPE_UNSPECIFIED - Значение не определено. */
  ShareType[(ShareType['SHARE_TYPE_UNSPECIFIED'] = 0)] =
    'SHARE_TYPE_UNSPECIFIED';
  /** SHARE_TYPE_COMMON - Обыкновенная */
  ShareType[(ShareType['SHARE_TYPE_COMMON'] = 1)] = 'SHARE_TYPE_COMMON';
  /** SHARE_TYPE_PREFERRED - Привилегированная */
  ShareType[(ShareType['SHARE_TYPE_PREFERRED'] = 2)] = 'SHARE_TYPE_PREFERRED';
  /** SHARE_TYPE_ADR - Американские депозитарные расписки */
  ShareType[(ShareType['SHARE_TYPE_ADR'] = 3)] = 'SHARE_TYPE_ADR';
  /** SHARE_TYPE_GDR - Глобальные депозитарные расписки */
  ShareType[(ShareType['SHARE_TYPE_GDR'] = 4)] = 'SHARE_TYPE_GDR';
  /** SHARE_TYPE_MLP - Товарищество с ограниченной ответственностью */
  ShareType[(ShareType['SHARE_TYPE_MLP'] = 5)] = 'SHARE_TYPE_MLP';
  /** SHARE_TYPE_NY_REG_SHRS - Акции из реестра Нью-Йорка */
  ShareType[(ShareType['SHARE_TYPE_NY_REG_SHRS'] = 6)] =
    'SHARE_TYPE_NY_REG_SHRS';
  /** SHARE_TYPE_CLOSED_END_FUND - Закрытый инвестиционный фонд */
  ShareType[(ShareType['SHARE_TYPE_CLOSED_END_FUND'] = 7)] =
    'SHARE_TYPE_CLOSED_END_FUND';
  /** SHARE_TYPE_REIT - Траст недвижимости */
  ShareType[(ShareType['SHARE_TYPE_REIT'] = 8)] = 'SHARE_TYPE_REIT';
  ShareType[(ShareType['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(ShareType || (ShareType = {}));

export function shareTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'SHARE_TYPE_UNSPECIFIED':
      return ShareType.SHARE_TYPE_UNSPECIFIED;
    case 1:
    case 'SHARE_TYPE_COMMON':
      return ShareType.SHARE_TYPE_COMMON;
    case 2:
    case 'SHARE_TYPE_PREFERRED':
      return ShareType.SHARE_TYPE_PREFERRED;
    case 3:
    case 'SHARE_TYPE_ADR':
      return ShareType.SHARE_TYPE_ADR;
    case 4:
    case 'SHARE_TYPE_GDR':
      return ShareType.SHARE_TYPE_GDR;
    case 5:
    case 'SHARE_TYPE_MLP':
      return ShareType.SHARE_TYPE_MLP;
    case 6:
    case 'SHARE_TYPE_NY_REG_SHRS':
      return ShareType.SHARE_TYPE_NY_REG_SHRS;
    case 7:
    case 'SHARE_TYPE_CLOSED_END_FUND':
      return ShareType.SHARE_TYPE_CLOSED_END_FUND;
    case 8:
    case 'SHARE_TYPE_REIT':
      return ShareType.SHARE_TYPE_REIT;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ShareType.UNRECOGNIZED;
  }
}

export function shareTypeToJSON(object) {
  switch (object) {
    case ShareType.SHARE_TYPE_UNSPECIFIED:
      return 'SHARE_TYPE_UNSPECIFIED';
    case ShareType.SHARE_TYPE_COMMON:
      return 'SHARE_TYPE_COMMON';
    case ShareType.SHARE_TYPE_PREFERRED:
      return 'SHARE_TYPE_PREFERRED';
    case ShareType.SHARE_TYPE_ADR:
      return 'SHARE_TYPE_ADR';
    case ShareType.SHARE_TYPE_GDR:
      return 'SHARE_TYPE_GDR';
    case ShareType.SHARE_TYPE_MLP:
      return 'SHARE_TYPE_MLP';
    case ShareType.SHARE_TYPE_NY_REG_SHRS:
      return 'SHARE_TYPE_NY_REG_SHRS';
    case ShareType.SHARE_TYPE_CLOSED_END_FUND:
      return 'SHARE_TYPE_CLOSED_END_FUND';
    case ShareType.SHARE_TYPE_REIT:
      return 'SHARE_TYPE_REIT';
    case ShareType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип актива. */
export var AssetType;
(function (AssetType) {
  /** ASSET_TYPE_UNSPECIFIED - Тип не определён. */
  AssetType[(AssetType['ASSET_TYPE_UNSPECIFIED'] = 0)] =
    'ASSET_TYPE_UNSPECIFIED';
  /** ASSET_TYPE_CURRENCY - Валюта. */
  AssetType[(AssetType['ASSET_TYPE_CURRENCY'] = 1)] = 'ASSET_TYPE_CURRENCY';
  /** ASSET_TYPE_COMMODITY - Товар. */
  AssetType[(AssetType['ASSET_TYPE_COMMODITY'] = 2)] = 'ASSET_TYPE_COMMODITY';
  /** ASSET_TYPE_INDEX - Индекс. */
  AssetType[(AssetType['ASSET_TYPE_INDEX'] = 3)] = 'ASSET_TYPE_INDEX';
  /** ASSET_TYPE_SECURITY - Ценная бумага. */
  AssetType[(AssetType['ASSET_TYPE_SECURITY'] = 4)] = 'ASSET_TYPE_SECURITY';
  AssetType[(AssetType['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(AssetType || (AssetType = {}));

export function assetTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'ASSET_TYPE_UNSPECIFIED':
      return AssetType.ASSET_TYPE_UNSPECIFIED;
    case 1:
    case 'ASSET_TYPE_CURRENCY':
      return AssetType.ASSET_TYPE_CURRENCY;
    case 2:
    case 'ASSET_TYPE_COMMODITY':
      return AssetType.ASSET_TYPE_COMMODITY;
    case 3:
    case 'ASSET_TYPE_INDEX':
      return AssetType.ASSET_TYPE_INDEX;
    case 4:
    case 'ASSET_TYPE_SECURITY':
      return AssetType.ASSET_TYPE_SECURITY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return AssetType.UNRECOGNIZED;
  }
}

export function assetTypeToJSON(object) {
  switch (object) {
    case AssetType.ASSET_TYPE_UNSPECIFIED:
      return 'ASSET_TYPE_UNSPECIFIED';
    case AssetType.ASSET_TYPE_CURRENCY:
      return 'ASSET_TYPE_CURRENCY';
    case AssetType.ASSET_TYPE_COMMODITY:
      return 'ASSET_TYPE_COMMODITY';
    case AssetType.ASSET_TYPE_INDEX:
      return 'ASSET_TYPE_INDEX';
    case AssetType.ASSET_TYPE_SECURITY:
      return 'ASSET_TYPE_SECURITY';
    case AssetType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип структурной ноты. */
export var StructuredProductType;
(function (StructuredProductType) {
  /** SP_TYPE_UNSPECIFIED - Тип не определён. */
  StructuredProductType[(StructuredProductType['SP_TYPE_UNSPECIFIED'] = 0)] =
    'SP_TYPE_UNSPECIFIED';
  /** SP_TYPE_DELIVERABLE - Поставочный. */
  StructuredProductType[(StructuredProductType['SP_TYPE_DELIVERABLE'] = 1)] =
    'SP_TYPE_DELIVERABLE';
  /** SP_TYPE_NON_DELIVERABLE - Беспоставочный. */
  StructuredProductType[
    (StructuredProductType['SP_TYPE_NON_DELIVERABLE'] = 2)
  ] = 'SP_TYPE_NON_DELIVERABLE';
  StructuredProductType[(StructuredProductType['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(StructuredProductType || (StructuredProductType = {}));

export function structuredProductTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'SP_TYPE_UNSPECIFIED':
      return StructuredProductType.SP_TYPE_UNSPECIFIED;
    case 1:
    case 'SP_TYPE_DELIVERABLE':
      return StructuredProductType.SP_TYPE_DELIVERABLE;
    case 2:
    case 'SP_TYPE_NON_DELIVERABLE':
      return StructuredProductType.SP_TYPE_NON_DELIVERABLE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return StructuredProductType.UNRECOGNIZED;
  }
}

export function structuredProductTypeToJSON(object) {
  switch (object) {
    case StructuredProductType.SP_TYPE_UNSPECIFIED:
      return 'SP_TYPE_UNSPECIFIED';
    case StructuredProductType.SP_TYPE_DELIVERABLE:
      return 'SP_TYPE_DELIVERABLE';
    case StructuredProductType.SP_TYPE_NON_DELIVERABLE:
      return 'SP_TYPE_NON_DELIVERABLE';
    case StructuredProductType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Тип действия со списком избранных инструментов. */
export var EditFavoritesActionType;
(function (EditFavoritesActionType) {
  /** EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED - Тип не определён. */
  EditFavoritesActionType[
    (EditFavoritesActionType['EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED'] = 0)
  ] = 'EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED';
  /** EDIT_FAVORITES_ACTION_TYPE_ADD - Добавить в список. */
  EditFavoritesActionType[
    (EditFavoritesActionType['EDIT_FAVORITES_ACTION_TYPE_ADD'] = 1)
  ] = 'EDIT_FAVORITES_ACTION_TYPE_ADD';
  /** EDIT_FAVORITES_ACTION_TYPE_DEL - Удалить из списка. */
  EditFavoritesActionType[
    (EditFavoritesActionType['EDIT_FAVORITES_ACTION_TYPE_DEL'] = 2)
  ] = 'EDIT_FAVORITES_ACTION_TYPE_DEL';
  EditFavoritesActionType[(EditFavoritesActionType['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(EditFavoritesActionType || (EditFavoritesActionType = {}));

export function editFavoritesActionTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED':
      return EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED;
    case 1:
    case 'EDIT_FAVORITES_ACTION_TYPE_ADD':
      return EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_ADD;
    case 2:
    case 'EDIT_FAVORITES_ACTION_TYPE_DEL':
      return EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_DEL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return EditFavoritesActionType.UNRECOGNIZED;
  }
}

export function editFavoritesActionTypeToJSON(object) {
  switch (object) {
    case EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED:
      return 'EDIT_FAVORITES_ACTION_TYPE_UNSPECIFIED';
    case EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_ADD:
      return 'EDIT_FAVORITES_ACTION_TYPE_ADD';
    case EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_DEL:
      return 'EDIT_FAVORITES_ACTION_TYPE_DEL';
    case EditFavoritesActionType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Реальная площадка исполнения расчётов. */
export var RealExchange;
(function (RealExchange) {
  /** REAL_EXCHANGE_UNSPECIFIED - Тип не определён. */
  RealExchange[(RealExchange['REAL_EXCHANGE_UNSPECIFIED'] = 0)] =
    'REAL_EXCHANGE_UNSPECIFIED';
  /** REAL_EXCHANGE_MOEX - Московская биржа. */
  RealExchange[(RealExchange['REAL_EXCHANGE_MOEX'] = 1)] = 'REAL_EXCHANGE_MOEX';
  /** REAL_EXCHANGE_RTS - Санкт-Петербургская биржа. */
  RealExchange[(RealExchange['REAL_EXCHANGE_RTS'] = 2)] = 'REAL_EXCHANGE_RTS';
  /** REAL_EXCHANGE_OTC - Внебиржевой инструмент. */
  RealExchange[(RealExchange['REAL_EXCHANGE_OTC'] = 3)] = 'REAL_EXCHANGE_OTC';
  RealExchange[(RealExchange['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(RealExchange || (RealExchange = {}));

export function realExchangeFromJSON(object) {
  switch (object) {
    case 0:
    case 'REAL_EXCHANGE_UNSPECIFIED':
      return RealExchange.REAL_EXCHANGE_UNSPECIFIED;
    case 1:
    case 'REAL_EXCHANGE_MOEX':
      return RealExchange.REAL_EXCHANGE_MOEX;
    case 2:
    case 'REAL_EXCHANGE_RTS':
      return RealExchange.REAL_EXCHANGE_RTS;
    case 3:
    case 'REAL_EXCHANGE_OTC':
      return RealExchange.REAL_EXCHANGE_OTC;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RealExchange.UNRECOGNIZED;
  }
}

export function realExchangeToJSON(object) {
  switch (object) {
    case RealExchange.REAL_EXCHANGE_UNSPECIFIED:
      return 'REAL_EXCHANGE_UNSPECIFIED';
    case RealExchange.REAL_EXCHANGE_MOEX:
      return 'REAL_EXCHANGE_MOEX';
    case RealExchange.REAL_EXCHANGE_RTS:
      return 'REAL_EXCHANGE_RTS';
    case RealExchange.REAL_EXCHANGE_OTC:
      return 'REAL_EXCHANGE_OTC';
    case RealExchange.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

function createBaseTradingSchedulesRequest() {
  return { exchange: '', from: undefined, to: undefined };
}

export const TradingSchedulesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.exchange !== '') {
      writer.uint32(10).string(message.exchange);
    }

    if (message.from !== undefined) {
      Timestamp.encode(
        toTimestamp(message.from),
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.to !== undefined) {
      Timestamp.encode(
        toTimestamp(message.to),
        writer.uint32(26).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradingSchedulesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.exchange = reader.string();

          break;
        case 2:
          message.from = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.to = fromTimestamp(Timestamp.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      from: isSet(object.from) ? fromJsonTimestamp(object.from) : undefined,
      to: isSet(object.to) ? fromJsonTimestamp(object.to) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.from !== undefined && (obj.from = message.from.toISOString());
    message.to !== undefined && (obj.to = message.to.toISOString());

    return obj;
  }
};

function createBaseTradingSchedulesResponse() {
  return { exchanges: [] };
}

export const TradingSchedulesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.exchanges) {
      TradingSchedule.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradingSchedulesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.exchanges.push(
            TradingSchedule.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      exchanges: Array.isArray(object?.exchanges)
        ? object.exchanges.map((e) => TradingSchedule.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.exchanges) {
      obj.exchanges = message.exchanges.map((e) =>
        e ? TradingSchedule.toJSON(e) : undefined
      );
    } else {
      obj.exchanges = [];
    }

    return obj;
  }
};

function createBaseTradingSchedule() {
  return { exchange: '', days: [] };
}

export const TradingSchedule = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.exchange !== '') {
      writer.uint32(10).string(message.exchange);
    }

    for (const v of message.days) {
      TradingDay.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradingSchedule();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.exchange = reader.string();

          break;
        case 2:
          message.days.push(TradingDay.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      days: Array.isArray(object?.days)
        ? object.days.map((e) => TradingDay.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.exchange !== undefined && (obj.exchange = message.exchange);

    if (message.days) {
      obj.days = message.days.map((e) =>
        e ? TradingDay.toJSON(e) : undefined
      );
    } else {
      obj.days = [];
    }

    return obj;
  }
};

function createBaseTradingDay() {
  return {
    date: undefined,
    isTradingDay: false,
    startTime: undefined,
    endTime: undefined,
    openingAuctionStartTime: undefined,
    closingAuctionEndTime: undefined,
    eveningOpeningAuctionStartTime: undefined,
    eveningStartTime: undefined,
    eveningEndTime: undefined,
    clearingStartTime: undefined,
    clearingEndTime: undefined,
    premarketStartTime: undefined,
    premarketEndTime: undefined
  };
}

export const TradingDay = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.date !== undefined) {
      Timestamp.encode(
        toTimestamp(message.date),
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.isTradingDay === true) {
      writer.uint32(16).bool(message.isTradingDay);
    }

    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.endTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.endTime),
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.openingAuctionStartTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.openingAuctionStartTime),
        writer.uint32(58).fork()
      ).ldelim();
    }

    if (message.closingAuctionEndTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.closingAuctionEndTime),
        writer.uint32(66).fork()
      ).ldelim();
    }

    if (message.eveningOpeningAuctionStartTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.eveningOpeningAuctionStartTime),
        writer.uint32(74).fork()
      ).ldelim();
    }

    if (message.eveningStartTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.eveningStartTime),
        writer.uint32(82).fork()
      ).ldelim();
    }

    if (message.eveningEndTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.eveningEndTime),
        writer.uint32(90).fork()
      ).ldelim();
    }

    if (message.clearingStartTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.clearingStartTime),
        writer.uint32(98).fork()
      ).ldelim();
    }

    if (message.clearingEndTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.clearingEndTime),
        writer.uint32(106).fork()
      ).ldelim();
    }

    if (message.premarketStartTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.premarketStartTime),
        writer.uint32(114).fork()
      ).ldelim();
    }

    if (message.premarketEndTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.premarketEndTime),
        writer.uint32(122).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradingDay();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.date = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 2:
          message.isTradingDay = reader.bool();

          break;
        case 3:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 4:
          message.endTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 7:
          message.openingAuctionStartTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 8:
          message.closingAuctionEndTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 9:
          message.eveningOpeningAuctionStartTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 10:
          message.eveningStartTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 11:
          message.eveningEndTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 12:
          message.clearingStartTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 13:
          message.clearingEndTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 14:
          message.premarketStartTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 15:
          message.premarketEndTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      date: isSet(object.date) ? fromJsonTimestamp(object.date) : undefined,
      isTradingDay: isSet(object.isTradingDay)
        ? Boolean(object.isTradingDay)
        : false,
      startTime: isSet(object.startTime)
        ? fromJsonTimestamp(object.startTime)
        : undefined,
      endTime: isSet(object.endTime)
        ? fromJsonTimestamp(object.endTime)
        : undefined,
      openingAuctionStartTime: isSet(object.openingAuctionStartTime)
        ? fromJsonTimestamp(object.openingAuctionStartTime)
        : undefined,
      closingAuctionEndTime: isSet(object.closingAuctionEndTime)
        ? fromJsonTimestamp(object.closingAuctionEndTime)
        : undefined,
      eveningOpeningAuctionStartTime: isSet(
        object.eveningOpeningAuctionStartTime
      )
        ? fromJsonTimestamp(object.eveningOpeningAuctionStartTime)
        : undefined,
      eveningStartTime: isSet(object.eveningStartTime)
        ? fromJsonTimestamp(object.eveningStartTime)
        : undefined,
      eveningEndTime: isSet(object.eveningEndTime)
        ? fromJsonTimestamp(object.eveningEndTime)
        : undefined,
      clearingStartTime: isSet(object.clearingStartTime)
        ? fromJsonTimestamp(object.clearingStartTime)
        : undefined,
      clearingEndTime: isSet(object.clearingEndTime)
        ? fromJsonTimestamp(object.clearingEndTime)
        : undefined,
      premarketStartTime: isSet(object.premarketStartTime)
        ? fromJsonTimestamp(object.premarketStartTime)
        : undefined,
      premarketEndTime: isSet(object.premarketEndTime)
        ? fromJsonTimestamp(object.premarketEndTime)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.date !== undefined && (obj.date = message.date.toISOString());
    message.isTradingDay !== undefined &&
      (obj.isTradingDay = message.isTradingDay);
    message.startTime !== undefined &&
      (obj.startTime = message.startTime.toISOString());
    message.endTime !== undefined &&
      (obj.endTime = message.endTime.toISOString());
    message.openingAuctionStartTime !== undefined &&
      (obj.openingAuctionStartTime =
        message.openingAuctionStartTime.toISOString());
    message.closingAuctionEndTime !== undefined &&
      (obj.closingAuctionEndTime = message.closingAuctionEndTime.toISOString());
    message.eveningOpeningAuctionStartTime !== undefined &&
      (obj.eveningOpeningAuctionStartTime =
        message.eveningOpeningAuctionStartTime.toISOString());
    message.eveningStartTime !== undefined &&
      (obj.eveningStartTime = message.eveningStartTime.toISOString());
    message.eveningEndTime !== undefined &&
      (obj.eveningEndTime = message.eveningEndTime.toISOString());
    message.clearingStartTime !== undefined &&
      (obj.clearingStartTime = message.clearingStartTime.toISOString());
    message.clearingEndTime !== undefined &&
      (obj.clearingEndTime = message.clearingEndTime.toISOString());
    message.premarketStartTime !== undefined &&
      (obj.premarketStartTime = message.premarketStartTime.toISOString());
    message.premarketEndTime !== undefined &&
      (obj.premarketEndTime = message.premarketEndTime.toISOString());

    return obj;
  }
};

function createBaseInstrumentRequest() {
  return { idType: 0, classCode: '', id: '' };
}

export const InstrumentRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.idType !== 0) {
      writer.uint32(8).int32(message.idType);
    }

    if (message.classCode !== '') {
      writer.uint32(18).string(message.classCode);
    }

    if (message.id !== '') {
      writer.uint32(26).string(message.id);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrumentRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.idType = reader.int32();

          break;
        case 2:
          message.classCode = reader.string();

          break;
        case 3:
          message.id = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      idType: isSet(object.idType)
        ? instrumentIdTypeFromJSON(object.idType)
        : 0,
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      id: isSet(object.id) ? String(object.id) : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.idType !== undefined &&
      (obj.idType = instrumentIdTypeToJSON(message.idType));
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.id !== undefined && (obj.id = message.id);

    return obj;
  }
};

function createBaseInstrumentsRequest() {
  return { instrumentStatus: 0 };
}

export const InstrumentsRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrumentStatus !== 0) {
      writer.uint32(8).int32(message.instrumentStatus);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrumentsRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrumentStatus = reader.int32();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrumentStatus: isSet(object.instrumentStatus)
        ? instrumentStatusFromJSON(object.instrumentStatus)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrumentStatus !== undefined &&
      (obj.instrumentStatus = instrumentStatusToJSON(message.instrumentStatus));

    return obj;
  }
};

function createBaseBondResponse() {
  return { instrument: undefined };
}

export const BondResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrument !== undefined) {
      Bond.encode(message.instrument, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBondResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrument = Bond.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrument: isSet(object.instrument)
        ? Bond.fromJSON(object.instrument)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrument !== undefined &&
      (obj.instrument = message.instrument
        ? Bond.toJSON(message.instrument)
        : undefined);

    return obj;
  }
};

function createBaseBondsResponse() {
  return { instruments: [] };
}

export const BondsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      Bond.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBondsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(Bond.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => Bond.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? Bond.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseGetBondCouponsRequest() {
  return { figi: '', from: undefined, to: undefined };
}

export const GetBondCouponsRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.from !== undefined) {
      Timestamp.encode(
        toTimestamp(message.from),
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.to !== undefined) {
      Timestamp.encode(
        toTimestamp(message.to),
        writer.uint32(26).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetBondCouponsRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.from = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.to = fromTimestamp(Timestamp.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      from: isSet(object.from) ? fromJsonTimestamp(object.from) : undefined,
      to: isSet(object.to) ? fromJsonTimestamp(object.to) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.from !== undefined && (obj.from = message.from.toISOString());
    message.to !== undefined && (obj.to = message.to.toISOString());

    return obj;
  }
};

function createBaseGetBondCouponsResponse() {
  return { events: [] };
}

export const GetBondCouponsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.events) {
      Coupon.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetBondCouponsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.events.push(Coupon.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      events: Array.isArray(object?.events)
        ? object.events.map((e) => Coupon.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.events) {
      obj.events = message.events.map((e) =>
        e ? Coupon.toJSON(e) : undefined
      );
    } else {
      obj.events = [];
    }

    return obj;
  }
};

function createBaseCoupon() {
  return {
    figi: '',
    couponDate: undefined,
    couponNumber: 0,
    fixDate: undefined,
    payOneBond: undefined,
    couponType: 0,
    couponStartDate: undefined,
    couponEndDate: undefined,
    couponPeriod: 0
  };
}

export const Coupon = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.couponDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.couponDate),
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.couponNumber !== 0) {
      writer.uint32(24).int64(message.couponNumber);
    }

    if (message.fixDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.fixDate),
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.payOneBond !== undefined) {
      MoneyValue.encode(message.payOneBond, writer.uint32(42).fork()).ldelim();
    }

    if (message.couponType !== 0) {
      writer.uint32(48).int32(message.couponType);
    }

    if (message.couponStartDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.couponStartDate),
        writer.uint32(58).fork()
      ).ldelim();
    }

    if (message.couponEndDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.couponEndDate),
        writer.uint32(66).fork()
      ).ldelim();
    }

    if (message.couponPeriod !== 0) {
      writer.uint32(72).int32(message.couponPeriod);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoupon();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.couponDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.couponNumber = longToNumber(reader.int64());

          break;
        case 4:
          message.fixDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 5:
          message.payOneBond = MoneyValue.decode(reader, reader.uint32());

          break;
        case 6:
          message.couponType = reader.int32();

          break;
        case 7:
          message.couponStartDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 8:
          message.couponEndDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 9:
          message.couponPeriod = reader.int32();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      couponDate: isSet(object.couponDate)
        ? fromJsonTimestamp(object.couponDate)
        : undefined,
      couponNumber: isSet(object.couponNumber)
        ? Number(object.couponNumber)
        : 0,
      fixDate: isSet(object.fixDate)
        ? fromJsonTimestamp(object.fixDate)
        : undefined,
      payOneBond: isSet(object.payOneBond)
        ? MoneyValue.fromJSON(object.payOneBond)
        : undefined,
      couponType: isSet(object.couponType)
        ? couponTypeFromJSON(object.couponType)
        : 0,
      couponStartDate: isSet(object.couponStartDate)
        ? fromJsonTimestamp(object.couponStartDate)
        : undefined,
      couponEndDate: isSet(object.couponEndDate)
        ? fromJsonTimestamp(object.couponEndDate)
        : undefined,
      couponPeriod: isSet(object.couponPeriod) ? Number(object.couponPeriod) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.couponDate !== undefined &&
      (obj.couponDate = message.couponDate.toISOString());
    message.couponNumber !== undefined &&
      (obj.couponNumber = Math.round(message.couponNumber));
    message.fixDate !== undefined &&
      (obj.fixDate = message.fixDate.toISOString());
    message.payOneBond !== undefined &&
      (obj.payOneBond = message.payOneBond
        ? MoneyValue.toJSON(message.payOneBond)
        : undefined);
    message.couponType !== undefined &&
      (obj.couponType = couponTypeToJSON(message.couponType));
    message.couponStartDate !== undefined &&
      (obj.couponStartDate = message.couponStartDate.toISOString());
    message.couponEndDate !== undefined &&
      (obj.couponEndDate = message.couponEndDate.toISOString());
    message.couponPeriod !== undefined &&
      (obj.couponPeriod = Math.round(message.couponPeriod));

    return obj;
  }
};

function createBaseCurrencyResponse() {
  return { instrument: undefined };
}

export const CurrencyResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrument !== undefined) {
      Currency.encode(message.instrument, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCurrencyResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrument = Currency.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrument: isSet(object.instrument)
        ? Currency.fromJSON(object.instrument)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrument !== undefined &&
      (obj.instrument = message.instrument
        ? Currency.toJSON(message.instrument)
        : undefined);

    return obj;
  }
};

function createBaseCurrenciesResponse() {
  return { instruments: [] };
}

export const CurrenciesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      Currency.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCurrenciesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(Currency.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => Currency.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? Currency.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseEtfResponse() {
  return { instrument: undefined };
}

export const EtfResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrument !== undefined) {
      Etf.encode(message.instrument, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEtfResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrument = Etf.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrument: isSet(object.instrument)
        ? Etf.fromJSON(object.instrument)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrument !== undefined &&
      (obj.instrument = message.instrument
        ? Etf.toJSON(message.instrument)
        : undefined);

    return obj;
  }
};

function createBaseEtfsResponse() {
  return { instruments: [] };
}

export const EtfsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      Etf.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEtfsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(Etf.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => Etf.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? Etf.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseFutureResponse() {
  return { instrument: undefined };
}

export const FutureResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrument !== undefined) {
      Future.encode(message.instrument, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFutureResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrument = Future.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrument: isSet(object.instrument)
        ? Future.fromJSON(object.instrument)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrument !== undefined &&
      (obj.instrument = message.instrument
        ? Future.toJSON(message.instrument)
        : undefined);

    return obj;
  }
};

function createBaseFuturesResponse() {
  return { instruments: [] };
}

export const FuturesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      Future.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuturesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(Future.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => Future.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? Future.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseOptionResponse() {
  return { instrument: undefined };
}

export const OptionResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrument !== undefined) {
      Option.encode(message.instrument, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOptionResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrument = Option.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrument: isSet(object.instrument)
        ? Option.fromJSON(object.instrument)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrument !== undefined &&
      (obj.instrument = message.instrument
        ? Option.toJSON(message.instrument)
        : undefined);

    return obj;
  }
};

function createBaseOptionsResponse() {
  return { instruments: [] };
}

export const OptionsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      Option.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOptionsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(Option.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => Option.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? Option.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseOption() {
  return {
    uid: '',
    positionUid: '',
    ticker: '',
    classCode: '',
    basicAssetPositionUid: '',
    tradingStatus: 0,
    realExchange: 0,
    direction: 0,
    paymentType: 0,
    style: 0,
    settlementType: 0,
    name: '',
    currency: '',
    settlementCurrency: '',
    assetType: '',
    basicAsset: '',
    exchange: '',
    countryOfRisk: '',
    countryOfRiskName: '',
    sector: '',
    lot: 0,
    basicAssetSize: undefined,
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    minPriceIncrement: undefined,
    strikePrice: undefined,
    expirationDate: undefined,
    firstTradeDate: undefined,
    lastTradeDate: undefined,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined,
    shortEnabledFlag: false,
    forIisFlag: false,
    otcFlag: false,
    buyAvailableFlag: false,
    sellAvailableFlag: false,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    apiTradeAvailableFlag: false
  };
}

export const Option = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.uid !== '') {
      writer.uint32(10).string(message.uid);
    }

    if (message.positionUid !== '') {
      writer.uint32(18).string(message.positionUid);
    }

    if (message.ticker !== '') {
      writer.uint32(26).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(34).string(message.classCode);
    }

    if (message.basicAssetPositionUid !== '') {
      writer.uint32(42).string(message.basicAssetPositionUid);
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(168).int32(message.tradingStatus);
    }

    if (message.realExchange !== 0) {
      writer.uint32(248).int32(message.realExchange);
    }

    if (message.direction !== 0) {
      writer.uint32(328).int32(message.direction);
    }

    if (message.paymentType !== 0) {
      writer.uint32(336).int32(message.paymentType);
    }

    if (message.style !== 0) {
      writer.uint32(344).int32(message.style);
    }

    if (message.settlementType !== 0) {
      writer.uint32(352).int32(message.settlementType);
    }

    if (message.name !== '') {
      writer.uint32(810).string(message.name);
    }

    if (message.currency !== '') {
      writer.uint32(890).string(message.currency);
    }

    if (message.settlementCurrency !== '') {
      writer.uint32(898).string(message.settlementCurrency);
    }

    if (message.assetType !== '') {
      writer.uint32(1050).string(message.assetType);
    }

    if (message.basicAsset !== '') {
      writer.uint32(1058).string(message.basicAsset);
    }

    if (message.exchange !== '') {
      writer.uint32(1130).string(message.exchange);
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(1210).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(1218).string(message.countryOfRiskName);
    }

    if (message.sector !== '') {
      writer.uint32(1290).string(message.sector);
    }

    if (message.lot !== 0) {
      writer.uint32(1608).int32(message.lot);
    }

    if (message.basicAssetSize !== undefined) {
      Quotation.encode(
        message.basicAssetSize,
        writer.uint32(1690).fork()
      ).ldelim();
    }

    if (message.klong !== undefined) {
      Quotation.encode(message.klong, writer.uint32(1770).fork()).ldelim();
    }

    if (message.kshort !== undefined) {
      Quotation.encode(message.kshort, writer.uint32(1778).fork()).ldelim();
    }

    if (message.dlong !== undefined) {
      Quotation.encode(message.dlong, writer.uint32(1786).fork()).ldelim();
    }

    if (message.dshort !== undefined) {
      Quotation.encode(message.dshort, writer.uint32(1794).fork()).ldelim();
    }

    if (message.dlongMin !== undefined) {
      Quotation.encode(message.dlongMin, writer.uint32(1802).fork()).ldelim();
    }

    if (message.dshortMin !== undefined) {
      Quotation.encode(message.dshortMin, writer.uint32(1810).fork()).ldelim();
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(1850).fork()
      ).ldelim();
    }

    if (message.strikePrice !== undefined) {
      MoneyValue.encode(
        message.strikePrice,
        writer.uint32(1930).fork()
      ).ldelim();
    }

    if (message.expirationDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.expirationDate),
        writer.uint32(2410).fork()
      ).ldelim();
    }

    if (message.firstTradeDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.firstTradeDate),
        writer.uint32(2490).fork()
      ).ldelim();
    }

    if (message.lastTradeDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastTradeDate),
        writer.uint32(2498).fork()
      ).ldelim();
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(2570).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(2578).fork()
      ).ldelim();
    }

    if (message.shortEnabledFlag === true) {
      writer.uint32(3208).bool(message.shortEnabledFlag);
    }

    if (message.forIisFlag === true) {
      writer.uint32(3216).bool(message.forIisFlag);
    }

    if (message.otcFlag === true) {
      writer.uint32(3224).bool(message.otcFlag);
    }

    if (message.buyAvailableFlag === true) {
      writer.uint32(3232).bool(message.buyAvailableFlag);
    }

    if (message.sellAvailableFlag === true) {
      writer.uint32(3240).bool(message.sellAvailableFlag);
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(3248).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(3256).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(3264).bool(message.blockedTcaFlag);
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(3272).bool(message.apiTradeAvailableFlag);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOption();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.uid = reader.string();

          break;
        case 2:
          message.positionUid = reader.string();

          break;
        case 3:
          message.ticker = reader.string();

          break;
        case 4:
          message.classCode = reader.string();

          break;
        case 5:
          message.basicAssetPositionUid = reader.string();

          break;
        case 21:
          message.tradingStatus = reader.int32();

          break;
        case 31:
          message.realExchange = reader.int32();

          break;
        case 41:
          message.direction = reader.int32();

          break;
        case 42:
          message.paymentType = reader.int32();

          break;
        case 43:
          message.style = reader.int32();

          break;
        case 44:
          message.settlementType = reader.int32();

          break;
        case 101:
          message.name = reader.string();

          break;
        case 111:
          message.currency = reader.string();

          break;
        case 112:
          message.settlementCurrency = reader.string();

          break;
        case 131:
          message.assetType = reader.string();

          break;
        case 132:
          message.basicAsset = reader.string();

          break;
        case 141:
          message.exchange = reader.string();

          break;
        case 151:
          message.countryOfRisk = reader.string();

          break;
        case 152:
          message.countryOfRiskName = reader.string();

          break;
        case 161:
          message.sector = reader.string();

          break;
        case 201:
          message.lot = reader.int32();

          break;
        case 211:
          message.basicAssetSize = Quotation.decode(reader, reader.uint32());

          break;
        case 221:
          message.klong = Quotation.decode(reader, reader.uint32());

          break;
        case 222:
          message.kshort = Quotation.decode(reader, reader.uint32());

          break;
        case 223:
          message.dlong = Quotation.decode(reader, reader.uint32());

          break;
        case 224:
          message.dshort = Quotation.decode(reader, reader.uint32());

          break;
        case 225:
          message.dlongMin = Quotation.decode(reader, reader.uint32());

          break;
        case 226:
          message.dshortMin = Quotation.decode(reader, reader.uint32());

          break;
        case 231:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 241:
          message.strikePrice = MoneyValue.decode(reader, reader.uint32());

          break;
        case 301:
          message.expirationDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 311:
          message.firstTradeDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 312:
          message.lastTradeDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 321:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 322:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 401:
          message.shortEnabledFlag = reader.bool();

          break;
        case 402:
          message.forIisFlag = reader.bool();

          break;
        case 403:
          message.otcFlag = reader.bool();

          break;
        case 404:
          message.buyAvailableFlag = reader.bool();

          break;
        case 405:
          message.sellAvailableFlag = reader.bool();

          break;
        case 406:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 407:
          message.weekendFlag = reader.bool();

          break;
        case 408:
          message.blockedTcaFlag = reader.bool();

          break;
        case 409:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      uid: isSet(object.uid) ? String(object.uid) : '',
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      basicAssetPositionUid: isSet(object.basicAssetPositionUid)
        ? String(object.basicAssetPositionUid)
        : '',
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      realExchange: isSet(object.realExchange)
        ? realExchangeFromJSON(object.realExchange)
        : 0,
      direction: isSet(object.direction)
        ? optionDirectionFromJSON(object.direction)
        : 0,
      paymentType: isSet(object.paymentType)
        ? optionPaymentTypeFromJSON(object.paymentType)
        : 0,
      style: isSet(object.style) ? optionStyleFromJSON(object.style) : 0,
      settlementType: isSet(object.settlementType)
        ? optionSettlementTypeFromJSON(object.settlementType)
        : 0,
      name: isSet(object.name) ? String(object.name) : '',
      currency: isSet(object.currency) ? String(object.currency) : '',
      settlementCurrency: isSet(object.settlementCurrency)
        ? String(object.settlementCurrency)
        : '',
      assetType: isSet(object.assetType) ? String(object.assetType) : '',
      basicAsset: isSet(object.basicAsset) ? String(object.basicAsset) : '',
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : '',
      sector: isSet(object.sector) ? String(object.sector) : '',
      lot: isSet(object.lot) ? Number(object.lot) : 0,
      basicAssetSize: isSet(object.basicAssetSize)
        ? Quotation.fromJSON(object.basicAssetSize)
        : undefined,
      klong: isSet(object.klong) ? Quotation.fromJSON(object.klong) : undefined,
      kshort: isSet(object.kshort)
        ? Quotation.fromJSON(object.kshort)
        : undefined,
      dlong: isSet(object.dlong) ? Quotation.fromJSON(object.dlong) : undefined,
      dshort: isSet(object.dshort)
        ? Quotation.fromJSON(object.dshort)
        : undefined,
      dlongMin: isSet(object.dlongMin)
        ? Quotation.fromJSON(object.dlongMin)
        : undefined,
      dshortMin: isSet(object.dshortMin)
        ? Quotation.fromJSON(object.dshortMin)
        : undefined,
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      strikePrice: isSet(object.strikePrice)
        ? MoneyValue.fromJSON(object.strikePrice)
        : undefined,
      expirationDate: isSet(object.expirationDate)
        ? fromJsonTimestamp(object.expirationDate)
        : undefined,
      firstTradeDate: isSet(object.firstTradeDate)
        ? fromJsonTimestamp(object.firstTradeDate)
        : undefined,
      lastTradeDate: isSet(object.lastTradeDate)
        ? fromJsonTimestamp(object.lastTradeDate)
        : undefined,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined,
      shortEnabledFlag: isSet(object.shortEnabledFlag)
        ? Boolean(object.shortEnabledFlag)
        : false,
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      buyAvailableFlag: isSet(object.buyAvailableFlag)
        ? Boolean(object.buyAvailableFlag)
        : false,
      sellAvailableFlag: isSet(object.sellAvailableFlag)
        ? Boolean(object.sellAvailableFlag)
        : false,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false
    };
  },
  toJSON(message) {
    const obj = {};

    message.uid !== undefined && (obj.uid = message.uid);
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.basicAssetPositionUid !== undefined &&
      (obj.basicAssetPositionUid = message.basicAssetPositionUid);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.realExchange !== undefined &&
      (obj.realExchange = realExchangeToJSON(message.realExchange));
    message.direction !== undefined &&
      (obj.direction = optionDirectionToJSON(message.direction));
    message.paymentType !== undefined &&
      (obj.paymentType = optionPaymentTypeToJSON(message.paymentType));
    message.style !== undefined &&
      (obj.style = optionStyleToJSON(message.style));
    message.settlementType !== undefined &&
      (obj.settlementType = optionSettlementTypeToJSON(message.settlementType));
    message.name !== undefined && (obj.name = message.name);
    message.currency !== undefined && (obj.currency = message.currency);
    message.settlementCurrency !== undefined &&
      (obj.settlementCurrency = message.settlementCurrency);
    message.assetType !== undefined && (obj.assetType = message.assetType);
    message.basicAsset !== undefined && (obj.basicAsset = message.basicAsset);
    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);
    message.sector !== undefined && (obj.sector = message.sector);
    message.lot !== undefined && (obj.lot = Math.round(message.lot));
    message.basicAssetSize !== undefined &&
      (obj.basicAssetSize = message.basicAssetSize
        ? Quotation.toJSON(message.basicAssetSize)
        : undefined);
    message.klong !== undefined &&
      (obj.klong = message.klong ? Quotation.toJSON(message.klong) : undefined);
    message.kshort !== undefined &&
      (obj.kshort = message.kshort
        ? Quotation.toJSON(message.kshort)
        : undefined);
    message.dlong !== undefined &&
      (obj.dlong = message.dlong ? Quotation.toJSON(message.dlong) : undefined);
    message.dshort !== undefined &&
      (obj.dshort = message.dshort
        ? Quotation.toJSON(message.dshort)
        : undefined);
    message.dlongMin !== undefined &&
      (obj.dlongMin = message.dlongMin
        ? Quotation.toJSON(message.dlongMin)
        : undefined);
    message.dshortMin !== undefined &&
      (obj.dshortMin = message.dshortMin
        ? Quotation.toJSON(message.dshortMin)
        : undefined);
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.strikePrice !== undefined &&
      (obj.strikePrice = message.strikePrice
        ? MoneyValue.toJSON(message.strikePrice)
        : undefined);
    message.expirationDate !== undefined &&
      (obj.expirationDate = message.expirationDate.toISOString());
    message.firstTradeDate !== undefined &&
      (obj.firstTradeDate = message.firstTradeDate.toISOString());
    message.lastTradeDate !== undefined &&
      (obj.lastTradeDate = message.lastTradeDate.toISOString());
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());
    message.shortEnabledFlag !== undefined &&
      (obj.shortEnabledFlag = message.shortEnabledFlag);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.buyAvailableFlag !== undefined &&
      (obj.buyAvailableFlag = message.buyAvailableFlag);
    message.sellAvailableFlag !== undefined &&
      (obj.sellAvailableFlag = message.sellAvailableFlag);
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);

    return obj;
  }
};

function createBaseShareResponse() {
  return { instrument: undefined };
}

export const ShareResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrument !== undefined) {
      Share.encode(message.instrument, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseShareResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrument = Share.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrument: isSet(object.instrument)
        ? Share.fromJSON(object.instrument)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrument !== undefined &&
      (obj.instrument = message.instrument
        ? Share.toJSON(message.instrument)
        : undefined);

    return obj;
  }
};

function createBaseSharesResponse() {
  return { instruments: [] };
}

export const SharesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      Share.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSharesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(Share.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => Share.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? Share.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseBond() {
  return {
    figi: '',
    ticker: '',
    classCode: '',
    isin: '',
    lot: 0,
    currency: '',
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    shortEnabledFlag: false,
    name: '',
    exchange: '',
    couponQuantityPerYear: 0,
    maturityDate: undefined,
    nominal: undefined,
    initialNominal: undefined,
    stateRegDate: undefined,
    placementDate: undefined,
    placementPrice: undefined,
    aciValue: undefined,
    countryOfRisk: '',
    countryOfRiskName: '',
    sector: '',
    issueKind: '',
    issueSize: 0,
    issueSizePlan: 0,
    tradingStatus: 0,
    otcFlag: false,
    buyAvailableFlag: false,
    sellAvailableFlag: false,
    floatingCouponFlag: false,
    perpetualFlag: false,
    amortizationFlag: false,
    minPriceIncrement: undefined,
    apiTradeAvailableFlag: false,
    uid: '',
    realExchange: 0,
    positionUid: '',
    forIisFlag: false,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined
  };
}

export const Bond = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(26).string(message.classCode);
    }

    if (message.isin !== '') {
      writer.uint32(34).string(message.isin);
    }

    if (message.lot !== 0) {
      writer.uint32(40).int32(message.lot);
    }

    if (message.currency !== '') {
      writer.uint32(50).string(message.currency);
    }

    if (message.klong !== undefined) {
      Quotation.encode(message.klong, writer.uint32(58).fork()).ldelim();
    }

    if (message.kshort !== undefined) {
      Quotation.encode(message.kshort, writer.uint32(66).fork()).ldelim();
    }

    if (message.dlong !== undefined) {
      Quotation.encode(message.dlong, writer.uint32(74).fork()).ldelim();
    }

    if (message.dshort !== undefined) {
      Quotation.encode(message.dshort, writer.uint32(82).fork()).ldelim();
    }

    if (message.dlongMin !== undefined) {
      Quotation.encode(message.dlongMin, writer.uint32(90).fork()).ldelim();
    }

    if (message.dshortMin !== undefined) {
      Quotation.encode(message.dshortMin, writer.uint32(98).fork()).ldelim();
    }

    if (message.shortEnabledFlag === true) {
      writer.uint32(104).bool(message.shortEnabledFlag);
    }

    if (message.name !== '') {
      writer.uint32(122).string(message.name);
    }

    if (message.exchange !== '') {
      writer.uint32(130).string(message.exchange);
    }

    if (message.couponQuantityPerYear !== 0) {
      writer.uint32(136).int32(message.couponQuantityPerYear);
    }

    if (message.maturityDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.maturityDate),
        writer.uint32(146).fork()
      ).ldelim();
    }

    if (message.nominal !== undefined) {
      MoneyValue.encode(message.nominal, writer.uint32(154).fork()).ldelim();
    }

    if (message.initialNominal !== undefined) {
      MoneyValue.encode(
        message.initialNominal,
        writer.uint32(162).fork()
      ).ldelim();
    }

    if (message.stateRegDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.stateRegDate),
        writer.uint32(170).fork()
      ).ldelim();
    }

    if (message.placementDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.placementDate),
        writer.uint32(178).fork()
      ).ldelim();
    }

    if (message.placementPrice !== undefined) {
      MoneyValue.encode(
        message.placementPrice,
        writer.uint32(186).fork()
      ).ldelim();
    }

    if (message.aciValue !== undefined) {
      MoneyValue.encode(message.aciValue, writer.uint32(194).fork()).ldelim();
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(202).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(210).string(message.countryOfRiskName);
    }

    if (message.sector !== '') {
      writer.uint32(218).string(message.sector);
    }

    if (message.issueKind !== '') {
      writer.uint32(226).string(message.issueKind);
    }

    if (message.issueSize !== 0) {
      writer.uint32(232).int64(message.issueSize);
    }

    if (message.issueSizePlan !== 0) {
      writer.uint32(240).int64(message.issueSizePlan);
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(248).int32(message.tradingStatus);
    }

    if (message.otcFlag === true) {
      writer.uint32(256).bool(message.otcFlag);
    }

    if (message.buyAvailableFlag === true) {
      writer.uint32(264).bool(message.buyAvailableFlag);
    }

    if (message.sellAvailableFlag === true) {
      writer.uint32(272).bool(message.sellAvailableFlag);
    }

    if (message.floatingCouponFlag === true) {
      writer.uint32(280).bool(message.floatingCouponFlag);
    }

    if (message.perpetualFlag === true) {
      writer.uint32(288).bool(message.perpetualFlag);
    }

    if (message.amortizationFlag === true) {
      writer.uint32(296).bool(message.amortizationFlag);
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(306).fork()
      ).ldelim();
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(312).bool(message.apiTradeAvailableFlag);
    }

    if (message.uid !== '') {
      writer.uint32(322).string(message.uid);
    }

    if (message.realExchange !== 0) {
      writer.uint32(328).int32(message.realExchange);
    }

    if (message.positionUid !== '') {
      writer.uint32(338).string(message.positionUid);
    }

    if (message.forIisFlag === true) {
      writer.uint32(408).bool(message.forIisFlag);
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(416).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(424).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(432).bool(message.blockedTcaFlag);
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(490).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(498).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBond();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.ticker = reader.string();

          break;
        case 3:
          message.classCode = reader.string();

          break;
        case 4:
          message.isin = reader.string();

          break;
        case 5:
          message.lot = reader.int32();

          break;
        case 6:
          message.currency = reader.string();

          break;
        case 7:
          message.klong = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.kshort = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.dlong = Quotation.decode(reader, reader.uint32());

          break;
        case 10:
          message.dshort = Quotation.decode(reader, reader.uint32());

          break;
        case 11:
          message.dlongMin = Quotation.decode(reader, reader.uint32());

          break;
        case 12:
          message.dshortMin = Quotation.decode(reader, reader.uint32());

          break;
        case 13:
          message.shortEnabledFlag = reader.bool();

          break;
        case 15:
          message.name = reader.string();

          break;
        case 16:
          message.exchange = reader.string();

          break;
        case 17:
          message.couponQuantityPerYear = reader.int32();

          break;
        case 18:
          message.maturityDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 19:
          message.nominal = MoneyValue.decode(reader, reader.uint32());

          break;
        case 20:
          message.initialNominal = MoneyValue.decode(reader, reader.uint32());

          break;
        case 21:
          message.stateRegDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 22:
          message.placementDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 23:
          message.placementPrice = MoneyValue.decode(reader, reader.uint32());

          break;
        case 24:
          message.aciValue = MoneyValue.decode(reader, reader.uint32());

          break;
        case 25:
          message.countryOfRisk = reader.string();

          break;
        case 26:
          message.countryOfRiskName = reader.string();

          break;
        case 27:
          message.sector = reader.string();

          break;
        case 28:
          message.issueKind = reader.string();

          break;
        case 29:
          message.issueSize = longToNumber(reader.int64());

          break;
        case 30:
          message.issueSizePlan = longToNumber(reader.int64());

          break;
        case 31:
          message.tradingStatus = reader.int32();

          break;
        case 32:
          message.otcFlag = reader.bool();

          break;
        case 33:
          message.buyAvailableFlag = reader.bool();

          break;
        case 34:
          message.sellAvailableFlag = reader.bool();

          break;
        case 35:
          message.floatingCouponFlag = reader.bool();

          break;
        case 36:
          message.perpetualFlag = reader.bool();

          break;
        case 37:
          message.amortizationFlag = reader.bool();

          break;
        case 38:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 39:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 40:
          message.uid = reader.string();

          break;
        case 41:
          message.realExchange = reader.int32();

          break;
        case 42:
          message.positionUid = reader.string();

          break;
        case 51:
          message.forIisFlag = reader.bool();

          break;
        case 52:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 53:
          message.weekendFlag = reader.bool();

          break;
        case 54:
          message.blockedTcaFlag = reader.bool();

          break;
        case 61:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 62:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      isin: isSet(object.isin) ? String(object.isin) : '',
      lot: isSet(object.lot) ? Number(object.lot) : 0,
      currency: isSet(object.currency) ? String(object.currency) : '',
      klong: isSet(object.klong) ? Quotation.fromJSON(object.klong) : undefined,
      kshort: isSet(object.kshort)
        ? Quotation.fromJSON(object.kshort)
        : undefined,
      dlong: isSet(object.dlong) ? Quotation.fromJSON(object.dlong) : undefined,
      dshort: isSet(object.dshort)
        ? Quotation.fromJSON(object.dshort)
        : undefined,
      dlongMin: isSet(object.dlongMin)
        ? Quotation.fromJSON(object.dlongMin)
        : undefined,
      dshortMin: isSet(object.dshortMin)
        ? Quotation.fromJSON(object.dshortMin)
        : undefined,
      shortEnabledFlag: isSet(object.shortEnabledFlag)
        ? Boolean(object.shortEnabledFlag)
        : false,
      name: isSet(object.name) ? String(object.name) : '',
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      couponQuantityPerYear: isSet(object.couponQuantityPerYear)
        ? Number(object.couponQuantityPerYear)
        : 0,
      maturityDate: isSet(object.maturityDate)
        ? fromJsonTimestamp(object.maturityDate)
        : undefined,
      nominal: isSet(object.nominal)
        ? MoneyValue.fromJSON(object.nominal)
        : undefined,
      initialNominal: isSet(object.initialNominal)
        ? MoneyValue.fromJSON(object.initialNominal)
        : undefined,
      stateRegDate: isSet(object.stateRegDate)
        ? fromJsonTimestamp(object.stateRegDate)
        : undefined,
      placementDate: isSet(object.placementDate)
        ? fromJsonTimestamp(object.placementDate)
        : undefined,
      placementPrice: isSet(object.placementPrice)
        ? MoneyValue.fromJSON(object.placementPrice)
        : undefined,
      aciValue: isSet(object.aciValue)
        ? MoneyValue.fromJSON(object.aciValue)
        : undefined,
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : '',
      sector: isSet(object.sector) ? String(object.sector) : '',
      issueKind: isSet(object.issueKind) ? String(object.issueKind) : '',
      issueSize: isSet(object.issueSize) ? Number(object.issueSize) : 0,
      issueSizePlan: isSet(object.issueSizePlan)
        ? Number(object.issueSizePlan)
        : 0,
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      buyAvailableFlag: isSet(object.buyAvailableFlag)
        ? Boolean(object.buyAvailableFlag)
        : false,
      sellAvailableFlag: isSet(object.sellAvailableFlag)
        ? Boolean(object.sellAvailableFlag)
        : false,
      floatingCouponFlag: isSet(object.floatingCouponFlag)
        ? Boolean(object.floatingCouponFlag)
        : false,
      perpetualFlag: isSet(object.perpetualFlag)
        ? Boolean(object.perpetualFlag)
        : false,
      amortizationFlag: isSet(object.amortizationFlag)
        ? Boolean(object.amortizationFlag)
        : false,
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      uid: isSet(object.uid) ? String(object.uid) : '',
      realExchange: isSet(object.realExchange)
        ? realExchangeFromJSON(object.realExchange)
        : 0,
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.isin !== undefined && (obj.isin = message.isin);
    message.lot !== undefined && (obj.lot = Math.round(message.lot));
    message.currency !== undefined && (obj.currency = message.currency);
    message.klong !== undefined &&
      (obj.klong = message.klong ? Quotation.toJSON(message.klong) : undefined);
    message.kshort !== undefined &&
      (obj.kshort = message.kshort
        ? Quotation.toJSON(message.kshort)
        : undefined);
    message.dlong !== undefined &&
      (obj.dlong = message.dlong ? Quotation.toJSON(message.dlong) : undefined);
    message.dshort !== undefined &&
      (obj.dshort = message.dshort
        ? Quotation.toJSON(message.dshort)
        : undefined);
    message.dlongMin !== undefined &&
      (obj.dlongMin = message.dlongMin
        ? Quotation.toJSON(message.dlongMin)
        : undefined);
    message.dshortMin !== undefined &&
      (obj.dshortMin = message.dshortMin
        ? Quotation.toJSON(message.dshortMin)
        : undefined);
    message.shortEnabledFlag !== undefined &&
      (obj.shortEnabledFlag = message.shortEnabledFlag);
    message.name !== undefined && (obj.name = message.name);
    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.couponQuantityPerYear !== undefined &&
      (obj.couponQuantityPerYear = Math.round(message.couponQuantityPerYear));
    message.maturityDate !== undefined &&
      (obj.maturityDate = message.maturityDate.toISOString());
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? MoneyValue.toJSON(message.nominal)
        : undefined);
    message.initialNominal !== undefined &&
      (obj.initialNominal = message.initialNominal
        ? MoneyValue.toJSON(message.initialNominal)
        : undefined);
    message.stateRegDate !== undefined &&
      (obj.stateRegDate = message.stateRegDate.toISOString());
    message.placementDate !== undefined &&
      (obj.placementDate = message.placementDate.toISOString());
    message.placementPrice !== undefined &&
      (obj.placementPrice = message.placementPrice
        ? MoneyValue.toJSON(message.placementPrice)
        : undefined);
    message.aciValue !== undefined &&
      (obj.aciValue = message.aciValue
        ? MoneyValue.toJSON(message.aciValue)
        : undefined);
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);
    message.sector !== undefined && (obj.sector = message.sector);
    message.issueKind !== undefined && (obj.issueKind = message.issueKind);
    message.issueSize !== undefined &&
      (obj.issueSize = Math.round(message.issueSize));
    message.issueSizePlan !== undefined &&
      (obj.issueSizePlan = Math.round(message.issueSizePlan));
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.buyAvailableFlag !== undefined &&
      (obj.buyAvailableFlag = message.buyAvailableFlag);
    message.sellAvailableFlag !== undefined &&
      (obj.sellAvailableFlag = message.sellAvailableFlag);
    message.floatingCouponFlag !== undefined &&
      (obj.floatingCouponFlag = message.floatingCouponFlag);
    message.perpetualFlag !== undefined &&
      (obj.perpetualFlag = message.perpetualFlag);
    message.amortizationFlag !== undefined &&
      (obj.amortizationFlag = message.amortizationFlag);
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.uid !== undefined && (obj.uid = message.uid);
    message.realExchange !== undefined &&
      (obj.realExchange = realExchangeToJSON(message.realExchange));
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());

    return obj;
  }
};

function createBaseCurrency() {
  return {
    figi: '',
    ticker: '',
    classCode: '',
    isin: '',
    lot: 0,
    currency: '',
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    shortEnabledFlag: false,
    name: '',
    exchange: '',
    nominal: undefined,
    countryOfRisk: '',
    countryOfRiskName: '',
    tradingStatus: 0,
    otcFlag: false,
    buyAvailableFlag: false,
    sellAvailableFlag: false,
    isoCurrencyName: '',
    minPriceIncrement: undefined,
    apiTradeAvailableFlag: false,
    uid: '',
    realExchange: 0,
    positionUid: '',
    forIisFlag: false,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined
  };
}

export const Currency = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(26).string(message.classCode);
    }

    if (message.isin !== '') {
      writer.uint32(34).string(message.isin);
    }

    if (message.lot !== 0) {
      writer.uint32(40).int32(message.lot);
    }

    if (message.currency !== '') {
      writer.uint32(50).string(message.currency);
    }

    if (message.klong !== undefined) {
      Quotation.encode(message.klong, writer.uint32(58).fork()).ldelim();
    }

    if (message.kshort !== undefined) {
      Quotation.encode(message.kshort, writer.uint32(66).fork()).ldelim();
    }

    if (message.dlong !== undefined) {
      Quotation.encode(message.dlong, writer.uint32(74).fork()).ldelim();
    }

    if (message.dshort !== undefined) {
      Quotation.encode(message.dshort, writer.uint32(82).fork()).ldelim();
    }

    if (message.dlongMin !== undefined) {
      Quotation.encode(message.dlongMin, writer.uint32(90).fork()).ldelim();
    }

    if (message.dshortMin !== undefined) {
      Quotation.encode(message.dshortMin, writer.uint32(98).fork()).ldelim();
    }

    if (message.shortEnabledFlag === true) {
      writer.uint32(104).bool(message.shortEnabledFlag);
    }

    if (message.name !== '') {
      writer.uint32(122).string(message.name);
    }

    if (message.exchange !== '') {
      writer.uint32(130).string(message.exchange);
    }

    if (message.nominal !== undefined) {
      MoneyValue.encode(message.nominal, writer.uint32(138).fork()).ldelim();
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(146).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(154).string(message.countryOfRiskName);
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(160).int32(message.tradingStatus);
    }

    if (message.otcFlag === true) {
      writer.uint32(168).bool(message.otcFlag);
    }

    if (message.buyAvailableFlag === true) {
      writer.uint32(176).bool(message.buyAvailableFlag);
    }

    if (message.sellAvailableFlag === true) {
      writer.uint32(184).bool(message.sellAvailableFlag);
    }

    if (message.isoCurrencyName !== '') {
      writer.uint32(194).string(message.isoCurrencyName);
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(202).fork()
      ).ldelim();
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(208).bool(message.apiTradeAvailableFlag);
    }

    if (message.uid !== '') {
      writer.uint32(218).string(message.uid);
    }

    if (message.realExchange !== 0) {
      writer.uint32(224).int32(message.realExchange);
    }

    if (message.positionUid !== '') {
      writer.uint32(234).string(message.positionUid);
    }

    if (message.forIisFlag === true) {
      writer.uint32(328).bool(message.forIisFlag);
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(416).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(424).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(432).bool(message.blockedTcaFlag);
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(450).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(458).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCurrency();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.ticker = reader.string();

          break;
        case 3:
          message.classCode = reader.string();

          break;
        case 4:
          message.isin = reader.string();

          break;
        case 5:
          message.lot = reader.int32();

          break;
        case 6:
          message.currency = reader.string();

          break;
        case 7:
          message.klong = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.kshort = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.dlong = Quotation.decode(reader, reader.uint32());

          break;
        case 10:
          message.dshort = Quotation.decode(reader, reader.uint32());

          break;
        case 11:
          message.dlongMin = Quotation.decode(reader, reader.uint32());

          break;
        case 12:
          message.dshortMin = Quotation.decode(reader, reader.uint32());

          break;
        case 13:
          message.shortEnabledFlag = reader.bool();

          break;
        case 15:
          message.name = reader.string();

          break;
        case 16:
          message.exchange = reader.string();

          break;
        case 17:
          message.nominal = MoneyValue.decode(reader, reader.uint32());

          break;
        case 18:
          message.countryOfRisk = reader.string();

          break;
        case 19:
          message.countryOfRiskName = reader.string();

          break;
        case 20:
          message.tradingStatus = reader.int32();

          break;
        case 21:
          message.otcFlag = reader.bool();

          break;
        case 22:
          message.buyAvailableFlag = reader.bool();

          break;
        case 23:
          message.sellAvailableFlag = reader.bool();

          break;
        case 24:
          message.isoCurrencyName = reader.string();

          break;
        case 25:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 26:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 27:
          message.uid = reader.string();

          break;
        case 28:
          message.realExchange = reader.int32();

          break;
        case 29:
          message.positionUid = reader.string();

          break;
        case 41:
          message.forIisFlag = reader.bool();

          break;
        case 52:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 53:
          message.weekendFlag = reader.bool();

          break;
        case 54:
          message.blockedTcaFlag = reader.bool();

          break;
        case 56:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 57:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      isin: isSet(object.isin) ? String(object.isin) : '',
      lot: isSet(object.lot) ? Number(object.lot) : 0,
      currency: isSet(object.currency) ? String(object.currency) : '',
      klong: isSet(object.klong) ? Quotation.fromJSON(object.klong) : undefined,
      kshort: isSet(object.kshort)
        ? Quotation.fromJSON(object.kshort)
        : undefined,
      dlong: isSet(object.dlong) ? Quotation.fromJSON(object.dlong) : undefined,
      dshort: isSet(object.dshort)
        ? Quotation.fromJSON(object.dshort)
        : undefined,
      dlongMin: isSet(object.dlongMin)
        ? Quotation.fromJSON(object.dlongMin)
        : undefined,
      dshortMin: isSet(object.dshortMin)
        ? Quotation.fromJSON(object.dshortMin)
        : undefined,
      shortEnabledFlag: isSet(object.shortEnabledFlag)
        ? Boolean(object.shortEnabledFlag)
        : false,
      name: isSet(object.name) ? String(object.name) : '',
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      nominal: isSet(object.nominal)
        ? MoneyValue.fromJSON(object.nominal)
        : undefined,
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : '',
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      buyAvailableFlag: isSet(object.buyAvailableFlag)
        ? Boolean(object.buyAvailableFlag)
        : false,
      sellAvailableFlag: isSet(object.sellAvailableFlag)
        ? Boolean(object.sellAvailableFlag)
        : false,
      isoCurrencyName: isSet(object.isoCurrencyName)
        ? String(object.isoCurrencyName)
        : '',
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      uid: isSet(object.uid) ? String(object.uid) : '',
      realExchange: isSet(object.realExchange)
        ? realExchangeFromJSON(object.realExchange)
        : 0,
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.isin !== undefined && (obj.isin = message.isin);
    message.lot !== undefined && (obj.lot = Math.round(message.lot));
    message.currency !== undefined && (obj.currency = message.currency);
    message.klong !== undefined &&
      (obj.klong = message.klong ? Quotation.toJSON(message.klong) : undefined);
    message.kshort !== undefined &&
      (obj.kshort = message.kshort
        ? Quotation.toJSON(message.kshort)
        : undefined);
    message.dlong !== undefined &&
      (obj.dlong = message.dlong ? Quotation.toJSON(message.dlong) : undefined);
    message.dshort !== undefined &&
      (obj.dshort = message.dshort
        ? Quotation.toJSON(message.dshort)
        : undefined);
    message.dlongMin !== undefined &&
      (obj.dlongMin = message.dlongMin
        ? Quotation.toJSON(message.dlongMin)
        : undefined);
    message.dshortMin !== undefined &&
      (obj.dshortMin = message.dshortMin
        ? Quotation.toJSON(message.dshortMin)
        : undefined);
    message.shortEnabledFlag !== undefined &&
      (obj.shortEnabledFlag = message.shortEnabledFlag);
    message.name !== undefined && (obj.name = message.name);
    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? MoneyValue.toJSON(message.nominal)
        : undefined);
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.buyAvailableFlag !== undefined &&
      (obj.buyAvailableFlag = message.buyAvailableFlag);
    message.sellAvailableFlag !== undefined &&
      (obj.sellAvailableFlag = message.sellAvailableFlag);
    message.isoCurrencyName !== undefined &&
      (obj.isoCurrencyName = message.isoCurrencyName);
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.uid !== undefined && (obj.uid = message.uid);
    message.realExchange !== undefined &&
      (obj.realExchange = realExchangeToJSON(message.realExchange));
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());

    return obj;
  }
};

function createBaseEtf() {
  return {
    figi: '',
    ticker: '',
    classCode: '',
    isin: '',
    lot: 0,
    currency: '',
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    shortEnabledFlag: false,
    name: '',
    exchange: '',
    fixedCommission: undefined,
    focusType: '',
    releasedDate: undefined,
    numShares: undefined,
    countryOfRisk: '',
    countryOfRiskName: '',
    sector: '',
    rebalancingFreq: '',
    tradingStatus: 0,
    otcFlag: false,
    buyAvailableFlag: false,
    sellAvailableFlag: false,
    minPriceIncrement: undefined,
    apiTradeAvailableFlag: false,
    uid: '',
    realExchange: 0,
    positionUid: '',
    forIisFlag: false,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined
  };
}

export const Etf = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(26).string(message.classCode);
    }

    if (message.isin !== '') {
      writer.uint32(34).string(message.isin);
    }

    if (message.lot !== 0) {
      writer.uint32(40).int32(message.lot);
    }

    if (message.currency !== '') {
      writer.uint32(50).string(message.currency);
    }

    if (message.klong !== undefined) {
      Quotation.encode(message.klong, writer.uint32(58).fork()).ldelim();
    }

    if (message.kshort !== undefined) {
      Quotation.encode(message.kshort, writer.uint32(66).fork()).ldelim();
    }

    if (message.dlong !== undefined) {
      Quotation.encode(message.dlong, writer.uint32(74).fork()).ldelim();
    }

    if (message.dshort !== undefined) {
      Quotation.encode(message.dshort, writer.uint32(82).fork()).ldelim();
    }

    if (message.dlongMin !== undefined) {
      Quotation.encode(message.dlongMin, writer.uint32(90).fork()).ldelim();
    }

    if (message.dshortMin !== undefined) {
      Quotation.encode(message.dshortMin, writer.uint32(98).fork()).ldelim();
    }

    if (message.shortEnabledFlag === true) {
      writer.uint32(104).bool(message.shortEnabledFlag);
    }

    if (message.name !== '') {
      writer.uint32(122).string(message.name);
    }

    if (message.exchange !== '') {
      writer.uint32(130).string(message.exchange);
    }

    if (message.fixedCommission !== undefined) {
      Quotation.encode(
        message.fixedCommission,
        writer.uint32(138).fork()
      ).ldelim();
    }

    if (message.focusType !== '') {
      writer.uint32(146).string(message.focusType);
    }

    if (message.releasedDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.releasedDate),
        writer.uint32(154).fork()
      ).ldelim();
    }

    if (message.numShares !== undefined) {
      Quotation.encode(message.numShares, writer.uint32(162).fork()).ldelim();
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(170).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(178).string(message.countryOfRiskName);
    }

    if (message.sector !== '') {
      writer.uint32(186).string(message.sector);
    }

    if (message.rebalancingFreq !== '') {
      writer.uint32(194).string(message.rebalancingFreq);
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(200).int32(message.tradingStatus);
    }

    if (message.otcFlag === true) {
      writer.uint32(208).bool(message.otcFlag);
    }

    if (message.buyAvailableFlag === true) {
      writer.uint32(216).bool(message.buyAvailableFlag);
    }

    if (message.sellAvailableFlag === true) {
      writer.uint32(224).bool(message.sellAvailableFlag);
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(234).fork()
      ).ldelim();
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(240).bool(message.apiTradeAvailableFlag);
    }

    if (message.uid !== '') {
      writer.uint32(250).string(message.uid);
    }

    if (message.realExchange !== 0) {
      writer.uint32(256).int32(message.realExchange);
    }

    if (message.positionUid !== '') {
      writer.uint32(266).string(message.positionUid);
    }

    if (message.forIisFlag === true) {
      writer.uint32(328).bool(message.forIisFlag);
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(336).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(344).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(352).bool(message.blockedTcaFlag);
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(450).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(458).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEtf();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.ticker = reader.string();

          break;
        case 3:
          message.classCode = reader.string();

          break;
        case 4:
          message.isin = reader.string();

          break;
        case 5:
          message.lot = reader.int32();

          break;
        case 6:
          message.currency = reader.string();

          break;
        case 7:
          message.klong = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.kshort = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.dlong = Quotation.decode(reader, reader.uint32());

          break;
        case 10:
          message.dshort = Quotation.decode(reader, reader.uint32());

          break;
        case 11:
          message.dlongMin = Quotation.decode(reader, reader.uint32());

          break;
        case 12:
          message.dshortMin = Quotation.decode(reader, reader.uint32());

          break;
        case 13:
          message.shortEnabledFlag = reader.bool();

          break;
        case 15:
          message.name = reader.string();

          break;
        case 16:
          message.exchange = reader.string();

          break;
        case 17:
          message.fixedCommission = Quotation.decode(reader, reader.uint32());

          break;
        case 18:
          message.focusType = reader.string();

          break;
        case 19:
          message.releasedDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 20:
          message.numShares = Quotation.decode(reader, reader.uint32());

          break;
        case 21:
          message.countryOfRisk = reader.string();

          break;
        case 22:
          message.countryOfRiskName = reader.string();

          break;
        case 23:
          message.sector = reader.string();

          break;
        case 24:
          message.rebalancingFreq = reader.string();

          break;
        case 25:
          message.tradingStatus = reader.int32();

          break;
        case 26:
          message.otcFlag = reader.bool();

          break;
        case 27:
          message.buyAvailableFlag = reader.bool();

          break;
        case 28:
          message.sellAvailableFlag = reader.bool();

          break;
        case 29:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 30:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 31:
          message.uid = reader.string();

          break;
        case 32:
          message.realExchange = reader.int32();

          break;
        case 33:
          message.positionUid = reader.string();

          break;
        case 41:
          message.forIisFlag = reader.bool();

          break;
        case 42:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 43:
          message.weekendFlag = reader.bool();

          break;
        case 44:
          message.blockedTcaFlag = reader.bool();

          break;
        case 56:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 57:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      isin: isSet(object.isin) ? String(object.isin) : '',
      lot: isSet(object.lot) ? Number(object.lot) : 0,
      currency: isSet(object.currency) ? String(object.currency) : '',
      klong: isSet(object.klong) ? Quotation.fromJSON(object.klong) : undefined,
      kshort: isSet(object.kshort)
        ? Quotation.fromJSON(object.kshort)
        : undefined,
      dlong: isSet(object.dlong) ? Quotation.fromJSON(object.dlong) : undefined,
      dshort: isSet(object.dshort)
        ? Quotation.fromJSON(object.dshort)
        : undefined,
      dlongMin: isSet(object.dlongMin)
        ? Quotation.fromJSON(object.dlongMin)
        : undefined,
      dshortMin: isSet(object.dshortMin)
        ? Quotation.fromJSON(object.dshortMin)
        : undefined,
      shortEnabledFlag: isSet(object.shortEnabledFlag)
        ? Boolean(object.shortEnabledFlag)
        : false,
      name: isSet(object.name) ? String(object.name) : '',
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      fixedCommission: isSet(object.fixedCommission)
        ? Quotation.fromJSON(object.fixedCommission)
        : undefined,
      focusType: isSet(object.focusType) ? String(object.focusType) : '',
      releasedDate: isSet(object.releasedDate)
        ? fromJsonTimestamp(object.releasedDate)
        : undefined,
      numShares: isSet(object.numShares)
        ? Quotation.fromJSON(object.numShares)
        : undefined,
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : '',
      sector: isSet(object.sector) ? String(object.sector) : '',
      rebalancingFreq: isSet(object.rebalancingFreq)
        ? String(object.rebalancingFreq)
        : '',
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      buyAvailableFlag: isSet(object.buyAvailableFlag)
        ? Boolean(object.buyAvailableFlag)
        : false,
      sellAvailableFlag: isSet(object.sellAvailableFlag)
        ? Boolean(object.sellAvailableFlag)
        : false,
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      uid: isSet(object.uid) ? String(object.uid) : '',
      realExchange: isSet(object.realExchange)
        ? realExchangeFromJSON(object.realExchange)
        : 0,
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.isin !== undefined && (obj.isin = message.isin);
    message.lot !== undefined && (obj.lot = Math.round(message.lot));
    message.currency !== undefined && (obj.currency = message.currency);
    message.klong !== undefined &&
      (obj.klong = message.klong ? Quotation.toJSON(message.klong) : undefined);
    message.kshort !== undefined &&
      (obj.kshort = message.kshort
        ? Quotation.toJSON(message.kshort)
        : undefined);
    message.dlong !== undefined &&
      (obj.dlong = message.dlong ? Quotation.toJSON(message.dlong) : undefined);
    message.dshort !== undefined &&
      (obj.dshort = message.dshort
        ? Quotation.toJSON(message.dshort)
        : undefined);
    message.dlongMin !== undefined &&
      (obj.dlongMin = message.dlongMin
        ? Quotation.toJSON(message.dlongMin)
        : undefined);
    message.dshortMin !== undefined &&
      (obj.dshortMin = message.dshortMin
        ? Quotation.toJSON(message.dshortMin)
        : undefined);
    message.shortEnabledFlag !== undefined &&
      (obj.shortEnabledFlag = message.shortEnabledFlag);
    message.name !== undefined && (obj.name = message.name);
    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.fixedCommission !== undefined &&
      (obj.fixedCommission = message.fixedCommission
        ? Quotation.toJSON(message.fixedCommission)
        : undefined);
    message.focusType !== undefined && (obj.focusType = message.focusType);
    message.releasedDate !== undefined &&
      (obj.releasedDate = message.releasedDate.toISOString());
    message.numShares !== undefined &&
      (obj.numShares = message.numShares
        ? Quotation.toJSON(message.numShares)
        : undefined);
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);
    message.sector !== undefined && (obj.sector = message.sector);
    message.rebalancingFreq !== undefined &&
      (obj.rebalancingFreq = message.rebalancingFreq);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.buyAvailableFlag !== undefined &&
      (obj.buyAvailableFlag = message.buyAvailableFlag);
    message.sellAvailableFlag !== undefined &&
      (obj.sellAvailableFlag = message.sellAvailableFlag);
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.uid !== undefined && (obj.uid = message.uid);
    message.realExchange !== undefined &&
      (obj.realExchange = realExchangeToJSON(message.realExchange));
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());

    return obj;
  }
};

function createBaseFuture() {
  return {
    figi: '',
    ticker: '',
    classCode: '',
    lot: 0,
    currency: '',
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    shortEnabledFlag: false,
    name: '',
    exchange: '',
    firstTradeDate: undefined,
    lastTradeDate: undefined,
    futuresType: '',
    assetType: '',
    basicAsset: '',
    basicAssetSize: undefined,
    countryOfRisk: '',
    countryOfRiskName: '',
    sector: '',
    expirationDate: undefined,
    tradingStatus: 0,
    otcFlag: false,
    buyAvailableFlag: false,
    sellAvailableFlag: false,
    minPriceIncrement: undefined,
    apiTradeAvailableFlag: false,
    uid: '',
    realExchange: 0,
    positionUid: '',
    basicAssetPositionUid: '',
    forIisFlag: false,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined
  };
}

export const Future = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(26).string(message.classCode);
    }

    if (message.lot !== 0) {
      writer.uint32(32).int32(message.lot);
    }

    if (message.currency !== '') {
      writer.uint32(42).string(message.currency);
    }

    if (message.klong !== undefined) {
      Quotation.encode(message.klong, writer.uint32(50).fork()).ldelim();
    }

    if (message.kshort !== undefined) {
      Quotation.encode(message.kshort, writer.uint32(58).fork()).ldelim();
    }

    if (message.dlong !== undefined) {
      Quotation.encode(message.dlong, writer.uint32(66).fork()).ldelim();
    }

    if (message.dshort !== undefined) {
      Quotation.encode(message.dshort, writer.uint32(74).fork()).ldelim();
    }

    if (message.dlongMin !== undefined) {
      Quotation.encode(message.dlongMin, writer.uint32(82).fork()).ldelim();
    }

    if (message.dshortMin !== undefined) {
      Quotation.encode(message.dshortMin, writer.uint32(90).fork()).ldelim();
    }

    if (message.shortEnabledFlag === true) {
      writer.uint32(96).bool(message.shortEnabledFlag);
    }

    if (message.name !== '') {
      writer.uint32(106).string(message.name);
    }

    if (message.exchange !== '') {
      writer.uint32(114).string(message.exchange);
    }

    if (message.firstTradeDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.firstTradeDate),
        writer.uint32(122).fork()
      ).ldelim();
    }

    if (message.lastTradeDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastTradeDate),
        writer.uint32(130).fork()
      ).ldelim();
    }

    if (message.futuresType !== '') {
      writer.uint32(138).string(message.futuresType);
    }

    if (message.assetType !== '') {
      writer.uint32(146).string(message.assetType);
    }

    if (message.basicAsset !== '') {
      writer.uint32(154).string(message.basicAsset);
    }

    if (message.basicAssetSize !== undefined) {
      Quotation.encode(
        message.basicAssetSize,
        writer.uint32(162).fork()
      ).ldelim();
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(170).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(178).string(message.countryOfRiskName);
    }

    if (message.sector !== '') {
      writer.uint32(186).string(message.sector);
    }

    if (message.expirationDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.expirationDate),
        writer.uint32(194).fork()
      ).ldelim();
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(200).int32(message.tradingStatus);
    }

    if (message.otcFlag === true) {
      writer.uint32(208).bool(message.otcFlag);
    }

    if (message.buyAvailableFlag === true) {
      writer.uint32(216).bool(message.buyAvailableFlag);
    }

    if (message.sellAvailableFlag === true) {
      writer.uint32(224).bool(message.sellAvailableFlag);
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(234).fork()
      ).ldelim();
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(240).bool(message.apiTradeAvailableFlag);
    }

    if (message.uid !== '') {
      writer.uint32(250).string(message.uid);
    }

    if (message.realExchange !== 0) {
      writer.uint32(256).int32(message.realExchange);
    }

    if (message.positionUid !== '') {
      writer.uint32(266).string(message.positionUid);
    }

    if (message.basicAssetPositionUid !== '') {
      writer.uint32(274).string(message.basicAssetPositionUid);
    }

    if (message.forIisFlag === true) {
      writer.uint32(328).bool(message.forIisFlag);
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(336).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(344).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(352).bool(message.blockedTcaFlag);
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(450).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(458).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuture();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.ticker = reader.string();

          break;
        case 3:
          message.classCode = reader.string();

          break;
        case 4:
          message.lot = reader.int32();

          break;
        case 5:
          message.currency = reader.string();

          break;
        case 6:
          message.klong = Quotation.decode(reader, reader.uint32());

          break;
        case 7:
          message.kshort = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.dlong = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.dshort = Quotation.decode(reader, reader.uint32());

          break;
        case 10:
          message.dlongMin = Quotation.decode(reader, reader.uint32());

          break;
        case 11:
          message.dshortMin = Quotation.decode(reader, reader.uint32());

          break;
        case 12:
          message.shortEnabledFlag = reader.bool();

          break;
        case 13:
          message.name = reader.string();

          break;
        case 14:
          message.exchange = reader.string();

          break;
        case 15:
          message.firstTradeDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 16:
          message.lastTradeDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 17:
          message.futuresType = reader.string();

          break;
        case 18:
          message.assetType = reader.string();

          break;
        case 19:
          message.basicAsset = reader.string();

          break;
        case 20:
          message.basicAssetSize = Quotation.decode(reader, reader.uint32());

          break;
        case 21:
          message.countryOfRisk = reader.string();

          break;
        case 22:
          message.countryOfRiskName = reader.string();

          break;
        case 23:
          message.sector = reader.string();

          break;
        case 24:
          message.expirationDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 25:
          message.tradingStatus = reader.int32();

          break;
        case 26:
          message.otcFlag = reader.bool();

          break;
        case 27:
          message.buyAvailableFlag = reader.bool();

          break;
        case 28:
          message.sellAvailableFlag = reader.bool();

          break;
        case 29:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 30:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 31:
          message.uid = reader.string();

          break;
        case 32:
          message.realExchange = reader.int32();

          break;
        case 33:
          message.positionUid = reader.string();

          break;
        case 34:
          message.basicAssetPositionUid = reader.string();

          break;
        case 41:
          message.forIisFlag = reader.bool();

          break;
        case 42:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 43:
          message.weekendFlag = reader.bool();

          break;
        case 44:
          message.blockedTcaFlag = reader.bool();

          break;
        case 56:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 57:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      lot: isSet(object.lot) ? Number(object.lot) : 0,
      currency: isSet(object.currency) ? String(object.currency) : '',
      klong: isSet(object.klong) ? Quotation.fromJSON(object.klong) : undefined,
      kshort: isSet(object.kshort)
        ? Quotation.fromJSON(object.kshort)
        : undefined,
      dlong: isSet(object.dlong) ? Quotation.fromJSON(object.dlong) : undefined,
      dshort: isSet(object.dshort)
        ? Quotation.fromJSON(object.dshort)
        : undefined,
      dlongMin: isSet(object.dlongMin)
        ? Quotation.fromJSON(object.dlongMin)
        : undefined,
      dshortMin: isSet(object.dshortMin)
        ? Quotation.fromJSON(object.dshortMin)
        : undefined,
      shortEnabledFlag: isSet(object.shortEnabledFlag)
        ? Boolean(object.shortEnabledFlag)
        : false,
      name: isSet(object.name) ? String(object.name) : '',
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      firstTradeDate: isSet(object.firstTradeDate)
        ? fromJsonTimestamp(object.firstTradeDate)
        : undefined,
      lastTradeDate: isSet(object.lastTradeDate)
        ? fromJsonTimestamp(object.lastTradeDate)
        : undefined,
      futuresType: isSet(object.futuresType) ? String(object.futuresType) : '',
      assetType: isSet(object.assetType) ? String(object.assetType) : '',
      basicAsset: isSet(object.basicAsset) ? String(object.basicAsset) : '',
      basicAssetSize: isSet(object.basicAssetSize)
        ? Quotation.fromJSON(object.basicAssetSize)
        : undefined,
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : '',
      sector: isSet(object.sector) ? String(object.sector) : '',
      expirationDate: isSet(object.expirationDate)
        ? fromJsonTimestamp(object.expirationDate)
        : undefined,
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      buyAvailableFlag: isSet(object.buyAvailableFlag)
        ? Boolean(object.buyAvailableFlag)
        : false,
      sellAvailableFlag: isSet(object.sellAvailableFlag)
        ? Boolean(object.sellAvailableFlag)
        : false,
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      uid: isSet(object.uid) ? String(object.uid) : '',
      realExchange: isSet(object.realExchange)
        ? realExchangeFromJSON(object.realExchange)
        : 0,
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      basicAssetPositionUid: isSet(object.basicAssetPositionUid)
        ? String(object.basicAssetPositionUid)
        : '',
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.lot !== undefined && (obj.lot = Math.round(message.lot));
    message.currency !== undefined && (obj.currency = message.currency);
    message.klong !== undefined &&
      (obj.klong = message.klong ? Quotation.toJSON(message.klong) : undefined);
    message.kshort !== undefined &&
      (obj.kshort = message.kshort
        ? Quotation.toJSON(message.kshort)
        : undefined);
    message.dlong !== undefined &&
      (obj.dlong = message.dlong ? Quotation.toJSON(message.dlong) : undefined);
    message.dshort !== undefined &&
      (obj.dshort = message.dshort
        ? Quotation.toJSON(message.dshort)
        : undefined);
    message.dlongMin !== undefined &&
      (obj.dlongMin = message.dlongMin
        ? Quotation.toJSON(message.dlongMin)
        : undefined);
    message.dshortMin !== undefined &&
      (obj.dshortMin = message.dshortMin
        ? Quotation.toJSON(message.dshortMin)
        : undefined);
    message.shortEnabledFlag !== undefined &&
      (obj.shortEnabledFlag = message.shortEnabledFlag);
    message.name !== undefined && (obj.name = message.name);
    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.firstTradeDate !== undefined &&
      (obj.firstTradeDate = message.firstTradeDate.toISOString());
    message.lastTradeDate !== undefined &&
      (obj.lastTradeDate = message.lastTradeDate.toISOString());
    message.futuresType !== undefined &&
      (obj.futuresType = message.futuresType);
    message.assetType !== undefined && (obj.assetType = message.assetType);
    message.basicAsset !== undefined && (obj.basicAsset = message.basicAsset);
    message.basicAssetSize !== undefined &&
      (obj.basicAssetSize = message.basicAssetSize
        ? Quotation.toJSON(message.basicAssetSize)
        : undefined);
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);
    message.sector !== undefined && (obj.sector = message.sector);
    message.expirationDate !== undefined &&
      (obj.expirationDate = message.expirationDate.toISOString());
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.buyAvailableFlag !== undefined &&
      (obj.buyAvailableFlag = message.buyAvailableFlag);
    message.sellAvailableFlag !== undefined &&
      (obj.sellAvailableFlag = message.sellAvailableFlag);
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.uid !== undefined && (obj.uid = message.uid);
    message.realExchange !== undefined &&
      (obj.realExchange = realExchangeToJSON(message.realExchange));
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.basicAssetPositionUid !== undefined &&
      (obj.basicAssetPositionUid = message.basicAssetPositionUid);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());

    return obj;
  }
};

function createBaseShare() {
  return {
    figi: '',
    ticker: '',
    classCode: '',
    isin: '',
    lot: 0,
    currency: '',
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    shortEnabledFlag: false,
    name: '',
    exchange: '',
    ipoDate: undefined,
    issueSize: 0,
    countryOfRisk: '',
    countryOfRiskName: '',
    sector: '',
    issueSizePlan: 0,
    nominal: undefined,
    tradingStatus: 0,
    otcFlag: false,
    buyAvailableFlag: false,
    sellAvailableFlag: false,
    divYieldFlag: false,
    shareType: 0,
    minPriceIncrement: undefined,
    apiTradeAvailableFlag: false,
    uid: '',
    realExchange: 0,
    positionUid: '',
    forIisFlag: false,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined
  };
}

export const Share = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(26).string(message.classCode);
    }

    if (message.isin !== '') {
      writer.uint32(34).string(message.isin);
    }

    if (message.lot !== 0) {
      writer.uint32(40).int32(message.lot);
    }

    if (message.currency !== '') {
      writer.uint32(50).string(message.currency);
    }

    if (message.klong !== undefined) {
      Quotation.encode(message.klong, writer.uint32(58).fork()).ldelim();
    }

    if (message.kshort !== undefined) {
      Quotation.encode(message.kshort, writer.uint32(66).fork()).ldelim();
    }

    if (message.dlong !== undefined) {
      Quotation.encode(message.dlong, writer.uint32(74).fork()).ldelim();
    }

    if (message.dshort !== undefined) {
      Quotation.encode(message.dshort, writer.uint32(82).fork()).ldelim();
    }

    if (message.dlongMin !== undefined) {
      Quotation.encode(message.dlongMin, writer.uint32(90).fork()).ldelim();
    }

    if (message.dshortMin !== undefined) {
      Quotation.encode(message.dshortMin, writer.uint32(98).fork()).ldelim();
    }

    if (message.shortEnabledFlag === true) {
      writer.uint32(104).bool(message.shortEnabledFlag);
    }

    if (message.name !== '') {
      writer.uint32(122).string(message.name);
    }

    if (message.exchange !== '') {
      writer.uint32(130).string(message.exchange);
    }

    if (message.ipoDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.ipoDate),
        writer.uint32(138).fork()
      ).ldelim();
    }

    if (message.issueSize !== 0) {
      writer.uint32(144).int64(message.issueSize);
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(154).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(162).string(message.countryOfRiskName);
    }

    if (message.sector !== '') {
      writer.uint32(170).string(message.sector);
    }

    if (message.issueSizePlan !== 0) {
      writer.uint32(176).int64(message.issueSizePlan);
    }

    if (message.nominal !== undefined) {
      MoneyValue.encode(message.nominal, writer.uint32(186).fork()).ldelim();
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(200).int32(message.tradingStatus);
    }

    if (message.otcFlag === true) {
      writer.uint32(208).bool(message.otcFlag);
    }

    if (message.buyAvailableFlag === true) {
      writer.uint32(216).bool(message.buyAvailableFlag);
    }

    if (message.sellAvailableFlag === true) {
      writer.uint32(224).bool(message.sellAvailableFlag);
    }

    if (message.divYieldFlag === true) {
      writer.uint32(232).bool(message.divYieldFlag);
    }

    if (message.shareType !== 0) {
      writer.uint32(240).int32(message.shareType);
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(250).fork()
      ).ldelim();
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(256).bool(message.apiTradeAvailableFlag);
    }

    if (message.uid !== '') {
      writer.uint32(266).string(message.uid);
    }

    if (message.realExchange !== 0) {
      writer.uint32(272).int32(message.realExchange);
    }

    if (message.positionUid !== '') {
      writer.uint32(282).string(message.positionUid);
    }

    if (message.forIisFlag === true) {
      writer.uint32(368).bool(message.forIisFlag);
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(376).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(384).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(392).bool(message.blockedTcaFlag);
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(450).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(458).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseShare();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.ticker = reader.string();

          break;
        case 3:
          message.classCode = reader.string();

          break;
        case 4:
          message.isin = reader.string();

          break;
        case 5:
          message.lot = reader.int32();

          break;
        case 6:
          message.currency = reader.string();

          break;
        case 7:
          message.klong = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.kshort = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.dlong = Quotation.decode(reader, reader.uint32());

          break;
        case 10:
          message.dshort = Quotation.decode(reader, reader.uint32());

          break;
        case 11:
          message.dlongMin = Quotation.decode(reader, reader.uint32());

          break;
        case 12:
          message.dshortMin = Quotation.decode(reader, reader.uint32());

          break;
        case 13:
          message.shortEnabledFlag = reader.bool();

          break;
        case 15:
          message.name = reader.string();

          break;
        case 16:
          message.exchange = reader.string();

          break;
        case 17:
          message.ipoDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 18:
          message.issueSize = longToNumber(reader.int64());

          break;
        case 19:
          message.countryOfRisk = reader.string();

          break;
        case 20:
          message.countryOfRiskName = reader.string();

          break;
        case 21:
          message.sector = reader.string();

          break;
        case 22:
          message.issueSizePlan = longToNumber(reader.int64());

          break;
        case 23:
          message.nominal = MoneyValue.decode(reader, reader.uint32());

          break;
        case 25:
          message.tradingStatus = reader.int32();

          break;
        case 26:
          message.otcFlag = reader.bool();

          break;
        case 27:
          message.buyAvailableFlag = reader.bool();

          break;
        case 28:
          message.sellAvailableFlag = reader.bool();

          break;
        case 29:
          message.divYieldFlag = reader.bool();

          break;
        case 30:
          message.shareType = reader.int32();

          break;
        case 31:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 32:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 33:
          message.uid = reader.string();

          break;
        case 34:
          message.realExchange = reader.int32();

          break;
        case 35:
          message.positionUid = reader.string();

          break;
        case 46:
          message.forIisFlag = reader.bool();

          break;
        case 47:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 48:
          message.weekendFlag = reader.bool();

          break;
        case 49:
          message.blockedTcaFlag = reader.bool();

          break;
        case 56:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 57:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      isin: isSet(object.isin) ? String(object.isin) : '',
      lot: isSet(object.lot) ? Number(object.lot) : 0,
      currency: isSet(object.currency) ? String(object.currency) : '',
      klong: isSet(object.klong) ? Quotation.fromJSON(object.klong) : undefined,
      kshort: isSet(object.kshort)
        ? Quotation.fromJSON(object.kshort)
        : undefined,
      dlong: isSet(object.dlong) ? Quotation.fromJSON(object.dlong) : undefined,
      dshort: isSet(object.dshort)
        ? Quotation.fromJSON(object.dshort)
        : undefined,
      dlongMin: isSet(object.dlongMin)
        ? Quotation.fromJSON(object.dlongMin)
        : undefined,
      dshortMin: isSet(object.dshortMin)
        ? Quotation.fromJSON(object.dshortMin)
        : undefined,
      shortEnabledFlag: isSet(object.shortEnabledFlag)
        ? Boolean(object.shortEnabledFlag)
        : false,
      name: isSet(object.name) ? String(object.name) : '',
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      ipoDate: isSet(object.ipoDate)
        ? fromJsonTimestamp(object.ipoDate)
        : undefined,
      issueSize: isSet(object.issueSize) ? Number(object.issueSize) : 0,
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : '',
      sector: isSet(object.sector) ? String(object.sector) : '',
      issueSizePlan: isSet(object.issueSizePlan)
        ? Number(object.issueSizePlan)
        : 0,
      nominal: isSet(object.nominal)
        ? MoneyValue.fromJSON(object.nominal)
        : undefined,
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      buyAvailableFlag: isSet(object.buyAvailableFlag)
        ? Boolean(object.buyAvailableFlag)
        : false,
      sellAvailableFlag: isSet(object.sellAvailableFlag)
        ? Boolean(object.sellAvailableFlag)
        : false,
      divYieldFlag: isSet(object.divYieldFlag)
        ? Boolean(object.divYieldFlag)
        : false,
      shareType: isSet(object.shareType)
        ? shareTypeFromJSON(object.shareType)
        : 0,
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      uid: isSet(object.uid) ? String(object.uid) : '',
      realExchange: isSet(object.realExchange)
        ? realExchangeFromJSON(object.realExchange)
        : 0,
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.isin !== undefined && (obj.isin = message.isin);
    message.lot !== undefined && (obj.lot = Math.round(message.lot));
    message.currency !== undefined && (obj.currency = message.currency);
    message.klong !== undefined &&
      (obj.klong = message.klong ? Quotation.toJSON(message.klong) : undefined);
    message.kshort !== undefined &&
      (obj.kshort = message.kshort
        ? Quotation.toJSON(message.kshort)
        : undefined);
    message.dlong !== undefined &&
      (obj.dlong = message.dlong ? Quotation.toJSON(message.dlong) : undefined);
    message.dshort !== undefined &&
      (obj.dshort = message.dshort
        ? Quotation.toJSON(message.dshort)
        : undefined);
    message.dlongMin !== undefined &&
      (obj.dlongMin = message.dlongMin
        ? Quotation.toJSON(message.dlongMin)
        : undefined);
    message.dshortMin !== undefined &&
      (obj.dshortMin = message.dshortMin
        ? Quotation.toJSON(message.dshortMin)
        : undefined);
    message.shortEnabledFlag !== undefined &&
      (obj.shortEnabledFlag = message.shortEnabledFlag);
    message.name !== undefined && (obj.name = message.name);
    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.ipoDate !== undefined &&
      (obj.ipoDate = message.ipoDate.toISOString());
    message.issueSize !== undefined &&
      (obj.issueSize = Math.round(message.issueSize));
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);
    message.sector !== undefined && (obj.sector = message.sector);
    message.issueSizePlan !== undefined &&
      (obj.issueSizePlan = Math.round(message.issueSizePlan));
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? MoneyValue.toJSON(message.nominal)
        : undefined);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.buyAvailableFlag !== undefined &&
      (obj.buyAvailableFlag = message.buyAvailableFlag);
    message.sellAvailableFlag !== undefined &&
      (obj.sellAvailableFlag = message.sellAvailableFlag);
    message.divYieldFlag !== undefined &&
      (obj.divYieldFlag = message.divYieldFlag);
    message.shareType !== undefined &&
      (obj.shareType = shareTypeToJSON(message.shareType));
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.uid !== undefined && (obj.uid = message.uid);
    message.realExchange !== undefined &&
      (obj.realExchange = realExchangeToJSON(message.realExchange));
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());

    return obj;
  }
};

function createBaseGetAccruedInterestsRequest() {
  return { figi: '', from: undefined, to: undefined };
}

export const GetAccruedInterestsRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.from !== undefined) {
      Timestamp.encode(
        toTimestamp(message.from),
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.to !== undefined) {
      Timestamp.encode(
        toTimestamp(message.to),
        writer.uint32(26).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAccruedInterestsRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.from = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.to = fromTimestamp(Timestamp.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      from: isSet(object.from) ? fromJsonTimestamp(object.from) : undefined,
      to: isSet(object.to) ? fromJsonTimestamp(object.to) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.from !== undefined && (obj.from = message.from.toISOString());
    message.to !== undefined && (obj.to = message.to.toISOString());

    return obj;
  }
};

function createBaseGetAccruedInterestsResponse() {
  return { accruedInterests: [] };
}

export const GetAccruedInterestsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.accruedInterests) {
      AccruedInterest.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAccruedInterestsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.accruedInterests.push(
            AccruedInterest.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      accruedInterests: Array.isArray(object?.accruedInterests)
        ? object.accruedInterests.map((e) => AccruedInterest.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.accruedInterests) {
      obj.accruedInterests = message.accruedInterests.map((e) =>
        e ? AccruedInterest.toJSON(e) : undefined
      );
    } else {
      obj.accruedInterests = [];
    }

    return obj;
  }
};

function createBaseAccruedInterest() {
  return {
    date: undefined,
    value: undefined,
    valuePercent: undefined,
    nominal: undefined
  };
}

export const AccruedInterest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.date !== undefined) {
      Timestamp.encode(
        toTimestamp(message.date),
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.value !== undefined) {
      Quotation.encode(message.value, writer.uint32(18).fork()).ldelim();
    }

    if (message.valuePercent !== undefined) {
      Quotation.encode(message.valuePercent, writer.uint32(26).fork()).ldelim();
    }

    if (message.nominal !== undefined) {
      Quotation.encode(message.nominal, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccruedInterest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.date = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 2:
          message.value = Quotation.decode(reader, reader.uint32());

          break;
        case 3:
          message.valuePercent = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.nominal = Quotation.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      date: isSet(object.date) ? fromJsonTimestamp(object.date) : undefined,
      value: isSet(object.value) ? Quotation.fromJSON(object.value) : undefined,
      valuePercent: isSet(object.valuePercent)
        ? Quotation.fromJSON(object.valuePercent)
        : undefined,
      nominal: isSet(object.nominal)
        ? Quotation.fromJSON(object.nominal)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.date !== undefined && (obj.date = message.date.toISOString());
    message.value !== undefined &&
      (obj.value = message.value ? Quotation.toJSON(message.value) : undefined);
    message.valuePercent !== undefined &&
      (obj.valuePercent = message.valuePercent
        ? Quotation.toJSON(message.valuePercent)
        : undefined);
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? Quotation.toJSON(message.nominal)
        : undefined);

    return obj;
  }
};

function createBaseGetFuturesMarginRequest() {
  return { figi: '' };
}

export const GetFuturesMarginRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetFuturesMarginRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return { figi: isSet(object.figi) ? String(object.figi) : '' };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);

    return obj;
  }
};

function createBaseGetFuturesMarginResponse() {
  return {
    initialMarginOnBuy: undefined,
    initialMarginOnSell: undefined,
    minPriceIncrement: undefined,
    minPriceIncrementAmount: undefined
  };
}

export const GetFuturesMarginResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.initialMarginOnBuy !== undefined) {
      MoneyValue.encode(
        message.initialMarginOnBuy,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.initialMarginOnSell !== undefined) {
      MoneyValue.encode(
        message.initialMarginOnSell,
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.minPriceIncrementAmount !== undefined) {
      Quotation.encode(
        message.minPriceIncrementAmount,
        writer.uint32(34).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetFuturesMarginResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.initialMarginOnBuy = MoneyValue.decode(
            reader,
            reader.uint32()
          );

          break;
        case 2:
          message.initialMarginOnSell = MoneyValue.decode(
            reader,
            reader.uint32()
          );

          break;
        case 3:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.minPriceIncrementAmount = Quotation.decode(
            reader,
            reader.uint32()
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      initialMarginOnBuy: isSet(object.initialMarginOnBuy)
        ? MoneyValue.fromJSON(object.initialMarginOnBuy)
        : undefined,
      initialMarginOnSell: isSet(object.initialMarginOnSell)
        ? MoneyValue.fromJSON(object.initialMarginOnSell)
        : undefined,
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      minPriceIncrementAmount: isSet(object.minPriceIncrementAmount)
        ? Quotation.fromJSON(object.minPriceIncrementAmount)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.initialMarginOnBuy !== undefined &&
      (obj.initialMarginOnBuy = message.initialMarginOnBuy
        ? MoneyValue.toJSON(message.initialMarginOnBuy)
        : undefined);
    message.initialMarginOnSell !== undefined &&
      (obj.initialMarginOnSell = message.initialMarginOnSell
        ? MoneyValue.toJSON(message.initialMarginOnSell)
        : undefined);
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.minPriceIncrementAmount !== undefined &&
      (obj.minPriceIncrementAmount = message.minPriceIncrementAmount
        ? Quotation.toJSON(message.minPriceIncrementAmount)
        : undefined);

    return obj;
  }
};

function createBaseInstrumentResponse() {
  return { instrument: undefined };
}

export const InstrumentResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrument !== undefined) {
      Instrument.encode(message.instrument, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrumentResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrument = Instrument.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instrument: isSet(object.instrument)
        ? Instrument.fromJSON(object.instrument)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrument !== undefined &&
      (obj.instrument = message.instrument
        ? Instrument.toJSON(message.instrument)
        : undefined);

    return obj;
  }
};

function createBaseInstrument() {
  return {
    figi: '',
    ticker: '',
    classCode: '',
    isin: '',
    lot: 0,
    currency: '',
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    shortEnabledFlag: false,
    name: '',
    exchange: '',
    countryOfRisk: '',
    countryOfRiskName: '',
    instrumentType: '',
    tradingStatus: 0,
    otcFlag: false,
    buyAvailableFlag: false,
    sellAvailableFlag: false,
    minPriceIncrement: undefined,
    apiTradeAvailableFlag: false,
    uid: '',
    realExchange: 0,
    positionUid: '',
    forIisFlag: false,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined
  };
}

export const Instrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(26).string(message.classCode);
    }

    if (message.isin !== '') {
      writer.uint32(34).string(message.isin);
    }

    if (message.lot !== 0) {
      writer.uint32(40).int32(message.lot);
    }

    if (message.currency !== '') {
      writer.uint32(50).string(message.currency);
    }

    if (message.klong !== undefined) {
      Quotation.encode(message.klong, writer.uint32(58).fork()).ldelim();
    }

    if (message.kshort !== undefined) {
      Quotation.encode(message.kshort, writer.uint32(66).fork()).ldelim();
    }

    if (message.dlong !== undefined) {
      Quotation.encode(message.dlong, writer.uint32(74).fork()).ldelim();
    }

    if (message.dshort !== undefined) {
      Quotation.encode(message.dshort, writer.uint32(82).fork()).ldelim();
    }

    if (message.dlongMin !== undefined) {
      Quotation.encode(message.dlongMin, writer.uint32(90).fork()).ldelim();
    }

    if (message.dshortMin !== undefined) {
      Quotation.encode(message.dshortMin, writer.uint32(98).fork()).ldelim();
    }

    if (message.shortEnabledFlag === true) {
      writer.uint32(104).bool(message.shortEnabledFlag);
    }

    if (message.name !== '') {
      writer.uint32(114).string(message.name);
    }

    if (message.exchange !== '') {
      writer.uint32(122).string(message.exchange);
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(130).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(138).string(message.countryOfRiskName);
    }

    if (message.instrumentType !== '') {
      writer.uint32(146).string(message.instrumentType);
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(152).int32(message.tradingStatus);
    }

    if (message.otcFlag === true) {
      writer.uint32(160).bool(message.otcFlag);
    }

    if (message.buyAvailableFlag === true) {
      writer.uint32(168).bool(message.buyAvailableFlag);
    }

    if (message.sellAvailableFlag === true) {
      writer.uint32(176).bool(message.sellAvailableFlag);
    }

    if (message.minPriceIncrement !== undefined) {
      Quotation.encode(
        message.minPriceIncrement,
        writer.uint32(186).fork()
      ).ldelim();
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(192).bool(message.apiTradeAvailableFlag);
    }

    if (message.uid !== '') {
      writer.uint32(202).string(message.uid);
    }

    if (message.realExchange !== 0) {
      writer.uint32(208).int32(message.realExchange);
    }

    if (message.positionUid !== '') {
      writer.uint32(218).string(message.positionUid);
    }

    if (message.forIisFlag === true) {
      writer.uint32(288).bool(message.forIisFlag);
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(296).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(304).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(312).bool(message.blockedTcaFlag);
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(450).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(458).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.ticker = reader.string();

          break;
        case 3:
          message.classCode = reader.string();

          break;
        case 4:
          message.isin = reader.string();

          break;
        case 5:
          message.lot = reader.int32();

          break;
        case 6:
          message.currency = reader.string();

          break;
        case 7:
          message.klong = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.kshort = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.dlong = Quotation.decode(reader, reader.uint32());

          break;
        case 10:
          message.dshort = Quotation.decode(reader, reader.uint32());

          break;
        case 11:
          message.dlongMin = Quotation.decode(reader, reader.uint32());

          break;
        case 12:
          message.dshortMin = Quotation.decode(reader, reader.uint32());

          break;
        case 13:
          message.shortEnabledFlag = reader.bool();

          break;
        case 14:
          message.name = reader.string();

          break;
        case 15:
          message.exchange = reader.string();

          break;
        case 16:
          message.countryOfRisk = reader.string();

          break;
        case 17:
          message.countryOfRiskName = reader.string();

          break;
        case 18:
          message.instrumentType = reader.string();

          break;
        case 19:
          message.tradingStatus = reader.int32();

          break;
        case 20:
          message.otcFlag = reader.bool();

          break;
        case 21:
          message.buyAvailableFlag = reader.bool();

          break;
        case 22:
          message.sellAvailableFlag = reader.bool();

          break;
        case 23:
          message.minPriceIncrement = Quotation.decode(reader, reader.uint32());

          break;
        case 24:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 25:
          message.uid = reader.string();

          break;
        case 26:
          message.realExchange = reader.int32();

          break;
        case 27:
          message.positionUid = reader.string();

          break;
        case 36:
          message.forIisFlag = reader.bool();

          break;
        case 37:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 38:
          message.weekendFlag = reader.bool();

          break;
        case 39:
          message.blockedTcaFlag = reader.bool();

          break;
        case 56:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 57:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      isin: isSet(object.isin) ? String(object.isin) : '',
      lot: isSet(object.lot) ? Number(object.lot) : 0,
      currency: isSet(object.currency) ? String(object.currency) : '',
      klong: isSet(object.klong) ? Quotation.fromJSON(object.klong) : undefined,
      kshort: isSet(object.kshort)
        ? Quotation.fromJSON(object.kshort)
        : undefined,
      dlong: isSet(object.dlong) ? Quotation.fromJSON(object.dlong) : undefined,
      dshort: isSet(object.dshort)
        ? Quotation.fromJSON(object.dshort)
        : undefined,
      dlongMin: isSet(object.dlongMin)
        ? Quotation.fromJSON(object.dlongMin)
        : undefined,
      dshortMin: isSet(object.dshortMin)
        ? Quotation.fromJSON(object.dshortMin)
        : undefined,
      shortEnabledFlag: isSet(object.shortEnabledFlag)
        ? Boolean(object.shortEnabledFlag)
        : false,
      name: isSet(object.name) ? String(object.name) : '',
      exchange: isSet(object.exchange) ? String(object.exchange) : '',
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : '',
      instrumentType: isSet(object.instrumentType)
        ? String(object.instrumentType)
        : '',
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      buyAvailableFlag: isSet(object.buyAvailableFlag)
        ? Boolean(object.buyAvailableFlag)
        : false,
      sellAvailableFlag: isSet(object.sellAvailableFlag)
        ? Boolean(object.sellAvailableFlag)
        : false,
      minPriceIncrement: isSet(object.minPriceIncrement)
        ? Quotation.fromJSON(object.minPriceIncrement)
        : undefined,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      uid: isSet(object.uid) ? String(object.uid) : '',
      realExchange: isSet(object.realExchange)
        ? realExchangeFromJSON(object.realExchange)
        : 0,
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.isin !== undefined && (obj.isin = message.isin);
    message.lot !== undefined && (obj.lot = Math.round(message.lot));
    message.currency !== undefined && (obj.currency = message.currency);
    message.klong !== undefined &&
      (obj.klong = message.klong ? Quotation.toJSON(message.klong) : undefined);
    message.kshort !== undefined &&
      (obj.kshort = message.kshort
        ? Quotation.toJSON(message.kshort)
        : undefined);
    message.dlong !== undefined &&
      (obj.dlong = message.dlong ? Quotation.toJSON(message.dlong) : undefined);
    message.dshort !== undefined &&
      (obj.dshort = message.dshort
        ? Quotation.toJSON(message.dshort)
        : undefined);
    message.dlongMin !== undefined &&
      (obj.dlongMin = message.dlongMin
        ? Quotation.toJSON(message.dlongMin)
        : undefined);
    message.dshortMin !== undefined &&
      (obj.dshortMin = message.dshortMin
        ? Quotation.toJSON(message.dshortMin)
        : undefined);
    message.shortEnabledFlag !== undefined &&
      (obj.shortEnabledFlag = message.shortEnabledFlag);
    message.name !== undefined && (obj.name = message.name);
    message.exchange !== undefined && (obj.exchange = message.exchange);
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);
    message.instrumentType !== undefined &&
      (obj.instrumentType = message.instrumentType);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.buyAvailableFlag !== undefined &&
      (obj.buyAvailableFlag = message.buyAvailableFlag);
    message.sellAvailableFlag !== undefined &&
      (obj.sellAvailableFlag = message.sellAvailableFlag);
    message.minPriceIncrement !== undefined &&
      (obj.minPriceIncrement = message.minPriceIncrement
        ? Quotation.toJSON(message.minPriceIncrement)
        : undefined);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.uid !== undefined && (obj.uid = message.uid);
    message.realExchange !== undefined &&
      (obj.realExchange = realExchangeToJSON(message.realExchange));
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());

    return obj;
  }
};

function createBaseGetDividendsRequest() {
  return { figi: '', from: undefined, to: undefined };
}

export const GetDividendsRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.from !== undefined) {
      Timestamp.encode(
        toTimestamp(message.from),
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.to !== undefined) {
      Timestamp.encode(
        toTimestamp(message.to),
        writer.uint32(26).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetDividendsRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.from = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.to = fromTimestamp(Timestamp.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      from: isSet(object.from) ? fromJsonTimestamp(object.from) : undefined,
      to: isSet(object.to) ? fromJsonTimestamp(object.to) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.from !== undefined && (obj.from = message.from.toISOString());
    message.to !== undefined && (obj.to = message.to.toISOString());

    return obj;
  }
};

function createBaseGetDividendsResponse() {
  return { dividends: [] };
}

export const GetDividendsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.dividends) {
      Dividend.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetDividendsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.dividends.push(Dividend.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      dividends: Array.isArray(object?.dividends)
        ? object.dividends.map((e) => Dividend.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.dividends) {
      obj.dividends = message.dividends.map((e) =>
        e ? Dividend.toJSON(e) : undefined
      );
    } else {
      obj.dividends = [];
    }

    return obj;
  }
};

function createBaseDividend() {
  return {
    dividendNet: undefined,
    paymentDate: undefined,
    declaredDate: undefined,
    lastBuyDate: undefined,
    dividendType: '',
    recordDate: undefined,
    regularity: '',
    closePrice: undefined,
    yieldValue: undefined,
    createdAt: undefined
  };
}

export const Dividend = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.dividendNet !== undefined) {
      MoneyValue.encode(message.dividendNet, writer.uint32(10).fork()).ldelim();
    }

    if (message.paymentDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.paymentDate),
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.declaredDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.declaredDate),
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.lastBuyDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastBuyDate),
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.dividendType !== '') {
      writer.uint32(42).string(message.dividendType);
    }

    if (message.recordDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.recordDate),
        writer.uint32(50).fork()
      ).ldelim();
    }

    if (message.regularity !== '') {
      writer.uint32(58).string(message.regularity);
    }

    if (message.closePrice !== undefined) {
      MoneyValue.encode(message.closePrice, writer.uint32(66).fork()).ldelim();
    }

    if (message.yieldValue !== undefined) {
      Quotation.encode(message.yieldValue, writer.uint32(74).fork()).ldelim();
    }

    if (message.createdAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.createdAt),
        writer.uint32(82).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDividend();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.dividendNet = MoneyValue.decode(reader, reader.uint32());

          break;
        case 2:
          message.paymentDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.declaredDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 4:
          message.lastBuyDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 5:
          message.dividendType = reader.string();

          break;
        case 6:
          message.recordDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 7:
          message.regularity = reader.string();

          break;
        case 8:
          message.closePrice = MoneyValue.decode(reader, reader.uint32());

          break;
        case 9:
          message.yieldValue = Quotation.decode(reader, reader.uint32());

          break;
        case 10:
          message.createdAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      dividendNet: isSet(object.dividendNet)
        ? MoneyValue.fromJSON(object.dividendNet)
        : undefined,
      paymentDate: isSet(object.paymentDate)
        ? fromJsonTimestamp(object.paymentDate)
        : undefined,
      declaredDate: isSet(object.declaredDate)
        ? fromJsonTimestamp(object.declaredDate)
        : undefined,
      lastBuyDate: isSet(object.lastBuyDate)
        ? fromJsonTimestamp(object.lastBuyDate)
        : undefined,
      dividendType: isSet(object.dividendType)
        ? String(object.dividendType)
        : '',
      recordDate: isSet(object.recordDate)
        ? fromJsonTimestamp(object.recordDate)
        : undefined,
      regularity: isSet(object.regularity) ? String(object.regularity) : '',
      closePrice: isSet(object.closePrice)
        ? MoneyValue.fromJSON(object.closePrice)
        : undefined,
      yieldValue: isSet(object.yieldValue)
        ? Quotation.fromJSON(object.yieldValue)
        : undefined,
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.dividendNet !== undefined &&
      (obj.dividendNet = message.dividendNet
        ? MoneyValue.toJSON(message.dividendNet)
        : undefined);
    message.paymentDate !== undefined &&
      (obj.paymentDate = message.paymentDate.toISOString());
    message.declaredDate !== undefined &&
      (obj.declaredDate = message.declaredDate.toISOString());
    message.lastBuyDate !== undefined &&
      (obj.lastBuyDate = message.lastBuyDate.toISOString());
    message.dividendType !== undefined &&
      (obj.dividendType = message.dividendType);
    message.recordDate !== undefined &&
      (obj.recordDate = message.recordDate.toISOString());
    message.regularity !== undefined && (obj.regularity = message.regularity);
    message.closePrice !== undefined &&
      (obj.closePrice = message.closePrice
        ? MoneyValue.toJSON(message.closePrice)
        : undefined);
    message.yieldValue !== undefined &&
      (obj.yieldValue = message.yieldValue
        ? Quotation.toJSON(message.yieldValue)
        : undefined);
    message.createdAt !== undefined &&
      (obj.createdAt = message.createdAt.toISOString());

    return obj;
  }
};

function createBaseAssetRequest() {
  return { id: '' };
}

export const AssetRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return { id: isSet(object.id) ? String(object.id) : '' };
  },
  toJSON(message) {
    const obj = {};

    message.id !== undefined && (obj.id = message.id);

    return obj;
  }
};

function createBaseAssetResponse() {
  return { asset: undefined };
}

export const AssetResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.asset !== undefined) {
      AssetFull.encode(message.asset, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.asset = AssetFull.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      asset: isSet(object.asset) ? AssetFull.fromJSON(object.asset) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.asset !== undefined &&
      (obj.asset = message.asset ? AssetFull.toJSON(message.asset) : undefined);

    return obj;
  }
};

function createBaseAssetsRequest() {
  return {};
}

export const AssetsRequest = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetsRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};

    return obj;
  }
};

function createBaseAssetsResponse() {
  return { assets: [] };
}

export const AssetsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.assets) {
      Asset.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.assets.push(Asset.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      assets: Array.isArray(object?.assets)
        ? object.assets.map((e) => Asset.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.assets) {
      obj.assets = message.assets.map((e) => (e ? Asset.toJSON(e) : undefined));
    } else {
      obj.assets = [];
    }

    return obj;
  }
};

function createBaseAssetFull() {
  return {
    uid: '',
    type: 0,
    name: '',
    nameBrief: '',
    description: '',
    deletedAt: undefined,
    requiredTests: [],
    currency: undefined,
    security: undefined,
    gosRegCode: '',
    cfi: '',
    codeNsd: '',
    status: '',
    brand: undefined,
    updatedAt: undefined,
    brCode: '',
    brCodeName: '',
    instruments: []
  };
}

export const AssetFull = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.uid !== '') {
      writer.uint32(10).string(message.uid);
    }

    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }

    if (message.name !== '') {
      writer.uint32(26).string(message.name);
    }

    if (message.nameBrief !== '') {
      writer.uint32(34).string(message.nameBrief);
    }

    if (message.description !== '') {
      writer.uint32(42).string(message.description);
    }

    if (message.deletedAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.deletedAt),
        writer.uint32(50).fork()
      ).ldelim();
    }

    for (const v of message.requiredTests) {
      writer.uint32(58).string(v);
    }

    if (message.currency !== undefined) {
      AssetCurrency.encode(message.currency, writer.uint32(66).fork()).ldelim();
    }

    if (message.security !== undefined) {
      AssetSecurity.encode(message.security, writer.uint32(74).fork()).ldelim();
    }

    if (message.gosRegCode !== '') {
      writer.uint32(82).string(message.gosRegCode);
    }

    if (message.cfi !== '') {
      writer.uint32(90).string(message.cfi);
    }

    if (message.codeNsd !== '') {
      writer.uint32(98).string(message.codeNsd);
    }

    if (message.status !== '') {
      writer.uint32(106).string(message.status);
    }

    if (message.brand !== undefined) {
      Brand.encode(message.brand, writer.uint32(114).fork()).ldelim();
    }

    if (message.updatedAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.updatedAt),
        writer.uint32(122).fork()
      ).ldelim();
    }

    if (message.brCode !== '') {
      writer.uint32(130).string(message.brCode);
    }

    if (message.brCodeName !== '') {
      writer.uint32(138).string(message.brCodeName);
    }

    for (const v of message.instruments) {
      AssetInstrument.encode(v, writer.uint32(146).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetFull();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.uid = reader.string();

          break;
        case 2:
          message.type = reader.int32();

          break;
        case 3:
          message.name = reader.string();

          break;
        case 4:
          message.nameBrief = reader.string();

          break;
        case 5:
          message.description = reader.string();

          break;
        case 6:
          message.deletedAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 7:
          message.requiredTests.push(reader.string());

          break;
        case 8:
          message.currency = AssetCurrency.decode(reader, reader.uint32());

          break;
        case 9:
          message.security = AssetSecurity.decode(reader, reader.uint32());

          break;
        case 10:
          message.gosRegCode = reader.string();

          break;
        case 11:
          message.cfi = reader.string();

          break;
        case 12:
          message.codeNsd = reader.string();

          break;
        case 13:
          message.status = reader.string();

          break;
        case 14:
          message.brand = Brand.decode(reader, reader.uint32());

          break;
        case 15:
          message.updatedAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 16:
          message.brCode = reader.string();

          break;
        case 17:
          message.brCodeName = reader.string();

          break;
        case 18:
          message.instruments.push(
            AssetInstrument.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      uid: isSet(object.uid) ? String(object.uid) : '',
      type: isSet(object.type) ? assetTypeFromJSON(object.type) : 0,
      name: isSet(object.name) ? String(object.name) : '',
      nameBrief: isSet(object.nameBrief) ? String(object.nameBrief) : '',
      description: isSet(object.description) ? String(object.description) : '',
      deletedAt: isSet(object.deletedAt)
        ? fromJsonTimestamp(object.deletedAt)
        : undefined,
      requiredTests: Array.isArray(object?.requiredTests)
        ? object.requiredTests.map((e) => String(e))
        : [],
      currency: isSet(object.currency)
        ? AssetCurrency.fromJSON(object.currency)
        : undefined,
      security: isSet(object.security)
        ? AssetSecurity.fromJSON(object.security)
        : undefined,
      gosRegCode: isSet(object.gosRegCode) ? String(object.gosRegCode) : '',
      cfi: isSet(object.cfi) ? String(object.cfi) : '',
      codeNsd: isSet(object.codeNsd) ? String(object.codeNsd) : '',
      status: isSet(object.status) ? String(object.status) : '',
      brand: isSet(object.brand) ? Brand.fromJSON(object.brand) : undefined,
      updatedAt: isSet(object.updatedAt)
        ? fromJsonTimestamp(object.updatedAt)
        : undefined,
      brCode: isSet(object.brCode) ? String(object.brCode) : '',
      brCodeName: isSet(object.brCodeName) ? String(object.brCodeName) : '',
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => AssetInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.uid !== undefined && (obj.uid = message.uid);
    message.type !== undefined && (obj.type = assetTypeToJSON(message.type));
    message.name !== undefined && (obj.name = message.name);
    message.nameBrief !== undefined && (obj.nameBrief = message.nameBrief);
    message.description !== undefined &&
      (obj.description = message.description);
    message.deletedAt !== undefined &&
      (obj.deletedAt = message.deletedAt.toISOString());

    if (message.requiredTests) {
      obj.requiredTests = message.requiredTests.map((e) => e);
    } else {
      obj.requiredTests = [];
    }

    message.currency !== undefined &&
      (obj.currency = message.currency
        ? AssetCurrency.toJSON(message.currency)
        : undefined);
    message.security !== undefined &&
      (obj.security = message.security
        ? AssetSecurity.toJSON(message.security)
        : undefined);
    message.gosRegCode !== undefined && (obj.gosRegCode = message.gosRegCode);
    message.cfi !== undefined && (obj.cfi = message.cfi);
    message.codeNsd !== undefined && (obj.codeNsd = message.codeNsd);
    message.status !== undefined && (obj.status = message.status);
    message.brand !== undefined &&
      (obj.brand = message.brand ? Brand.toJSON(message.brand) : undefined);
    message.updatedAt !== undefined &&
      (obj.updatedAt = message.updatedAt.toISOString());
    message.brCode !== undefined && (obj.brCode = message.brCode);
    message.brCodeName !== undefined && (obj.brCodeName = message.brCodeName);

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? AssetInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseAsset() {
  return { uid: '', type: 0, name: '', instruments: [] };
}

export const Asset = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.uid !== '') {
      writer.uint32(10).string(message.uid);
    }

    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }

    if (message.name !== '') {
      writer.uint32(26).string(message.name);
    }

    for (const v of message.instruments) {
      AssetInstrument.encode(v, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAsset();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.uid = reader.string();

          break;
        case 2:
          message.type = reader.int32();

          break;
        case 3:
          message.name = reader.string();

          break;
        case 4:
          message.instruments.push(
            AssetInstrument.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      uid: isSet(object.uid) ? String(object.uid) : '',
      type: isSet(object.type) ? assetTypeFromJSON(object.type) : 0,
      name: isSet(object.name) ? String(object.name) : '',
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => AssetInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.uid !== undefined && (obj.uid = message.uid);
    message.type !== undefined && (obj.type = assetTypeToJSON(message.type));
    message.name !== undefined && (obj.name = message.name);

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? AssetInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseAssetCurrency() {
  return { baseCurrency: '' };
}

export const AssetCurrency = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.baseCurrency !== '') {
      writer.uint32(10).string(message.baseCurrency);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetCurrency();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.baseCurrency = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      baseCurrency: isSet(object.baseCurrency)
        ? String(object.baseCurrency)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.baseCurrency !== undefined &&
      (obj.baseCurrency = message.baseCurrency);

    return obj;
  }
};

function createBaseAssetSecurity() {
  return {
    isin: '',
    type: '',
    share: undefined,
    bond: undefined,
    sp: undefined,
    etf: undefined,
    clearingCertificate: undefined
  };
}

export const AssetSecurity = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.isin !== '') {
      writer.uint32(10).string(message.isin);
    }

    if (message.type !== '') {
      writer.uint32(18).string(message.type);
    }

    if (message.share !== undefined) {
      AssetShare.encode(message.share, writer.uint32(26).fork()).ldelim();
    }

    if (message.bond !== undefined) {
      AssetBond.encode(message.bond, writer.uint32(34).fork()).ldelim();
    }

    if (message.sp !== undefined) {
      AssetStructuredProduct.encode(
        message.sp,
        writer.uint32(42).fork()
      ).ldelim();
    }

    if (message.etf !== undefined) {
      AssetEtf.encode(message.etf, writer.uint32(50).fork()).ldelim();
    }

    if (message.clearingCertificate !== undefined) {
      AssetClearingCertificate.encode(
        message.clearingCertificate,
        writer.uint32(58).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetSecurity();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.isin = reader.string();

          break;
        case 2:
          message.type = reader.string();

          break;
        case 3:
          message.share = AssetShare.decode(reader, reader.uint32());

          break;
        case 4:
          message.bond = AssetBond.decode(reader, reader.uint32());

          break;
        case 5:
          message.sp = AssetStructuredProduct.decode(reader, reader.uint32());

          break;
        case 6:
          message.etf = AssetEtf.decode(reader, reader.uint32());

          break;
        case 7:
          message.clearingCertificate = AssetClearingCertificate.decode(
            reader,
            reader.uint32()
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      isin: isSet(object.isin) ? String(object.isin) : '',
      type: isSet(object.type) ? String(object.type) : '',
      share: isSet(object.share)
        ? AssetShare.fromJSON(object.share)
        : undefined,
      bond: isSet(object.bond) ? AssetBond.fromJSON(object.bond) : undefined,
      sp: isSet(object.sp)
        ? AssetStructuredProduct.fromJSON(object.sp)
        : undefined,
      etf: isSet(object.etf) ? AssetEtf.fromJSON(object.etf) : undefined,
      clearingCertificate: isSet(object.clearingCertificate)
        ? AssetClearingCertificate.fromJSON(object.clearingCertificate)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.isin !== undefined && (obj.isin = message.isin);
    message.type !== undefined && (obj.type = message.type);
    message.share !== undefined &&
      (obj.share = message.share
        ? AssetShare.toJSON(message.share)
        : undefined);
    message.bond !== undefined &&
      (obj.bond = message.bond ? AssetBond.toJSON(message.bond) : undefined);
    message.sp !== undefined &&
      (obj.sp = message.sp
        ? AssetStructuredProduct.toJSON(message.sp)
        : undefined);
    message.etf !== undefined &&
      (obj.etf = message.etf ? AssetEtf.toJSON(message.etf) : undefined);
    message.clearingCertificate !== undefined &&
      (obj.clearingCertificate = message.clearingCertificate
        ? AssetClearingCertificate.toJSON(message.clearingCertificate)
        : undefined);

    return obj;
  }
};

function createBaseAssetShare() {
  return {
    type: 0,
    issueSize: undefined,
    nominal: undefined,
    nominalCurrency: '',
    primaryIndex: '',
    dividendRate: undefined,
    preferredShareType: '',
    ipoDate: undefined,
    registryDate: undefined,
    divYieldFlag: false,
    issueKind: '',
    placementDate: undefined,
    represIsin: '',
    issueSizePlan: undefined,
    totalFloat: undefined
  };
}

export const AssetShare = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }

    if (message.issueSize !== undefined) {
      Quotation.encode(message.issueSize, writer.uint32(18).fork()).ldelim();
    }

    if (message.nominal !== undefined) {
      Quotation.encode(message.nominal, writer.uint32(26).fork()).ldelim();
    }

    if (message.nominalCurrency !== '') {
      writer.uint32(34).string(message.nominalCurrency);
    }

    if (message.primaryIndex !== '') {
      writer.uint32(42).string(message.primaryIndex);
    }

    if (message.dividendRate !== undefined) {
      Quotation.encode(message.dividendRate, writer.uint32(50).fork()).ldelim();
    }

    if (message.preferredShareType !== '') {
      writer.uint32(58).string(message.preferredShareType);
    }

    if (message.ipoDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.ipoDate),
        writer.uint32(66).fork()
      ).ldelim();
    }

    if (message.registryDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.registryDate),
        writer.uint32(74).fork()
      ).ldelim();
    }

    if (message.divYieldFlag === true) {
      writer.uint32(80).bool(message.divYieldFlag);
    }

    if (message.issueKind !== '') {
      writer.uint32(90).string(message.issueKind);
    }

    if (message.placementDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.placementDate),
        writer.uint32(98).fork()
      ).ldelim();
    }

    if (message.represIsin !== '') {
      writer.uint32(106).string(message.represIsin);
    }

    if (message.issueSizePlan !== undefined) {
      Quotation.encode(
        message.issueSizePlan,
        writer.uint32(114).fork()
      ).ldelim();
    }

    if (message.totalFloat !== undefined) {
      Quotation.encode(message.totalFloat, writer.uint32(122).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetShare();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32();

          break;
        case 2:
          message.issueSize = Quotation.decode(reader, reader.uint32());

          break;
        case 3:
          message.nominal = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.nominalCurrency = reader.string();

          break;
        case 5:
          message.primaryIndex = reader.string();

          break;
        case 6:
          message.dividendRate = Quotation.decode(reader, reader.uint32());

          break;
        case 7:
          message.preferredShareType = reader.string();

          break;
        case 8:
          message.ipoDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 9:
          message.registryDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 10:
          message.divYieldFlag = reader.bool();

          break;
        case 11:
          message.issueKind = reader.string();

          break;
        case 12:
          message.placementDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 13:
          message.represIsin = reader.string();

          break;
        case 14:
          message.issueSizePlan = Quotation.decode(reader, reader.uint32());

          break;
        case 15:
          message.totalFloat = Quotation.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      type: isSet(object.type) ? shareTypeFromJSON(object.type) : 0,
      issueSize: isSet(object.issueSize)
        ? Quotation.fromJSON(object.issueSize)
        : undefined,
      nominal: isSet(object.nominal)
        ? Quotation.fromJSON(object.nominal)
        : undefined,
      nominalCurrency: isSet(object.nominalCurrency)
        ? String(object.nominalCurrency)
        : '',
      primaryIndex: isSet(object.primaryIndex)
        ? String(object.primaryIndex)
        : '',
      dividendRate: isSet(object.dividendRate)
        ? Quotation.fromJSON(object.dividendRate)
        : undefined,
      preferredShareType: isSet(object.preferredShareType)
        ? String(object.preferredShareType)
        : '',
      ipoDate: isSet(object.ipoDate)
        ? fromJsonTimestamp(object.ipoDate)
        : undefined,
      registryDate: isSet(object.registryDate)
        ? fromJsonTimestamp(object.registryDate)
        : undefined,
      divYieldFlag: isSet(object.divYieldFlag)
        ? Boolean(object.divYieldFlag)
        : false,
      issueKind: isSet(object.issueKind) ? String(object.issueKind) : '',
      placementDate: isSet(object.placementDate)
        ? fromJsonTimestamp(object.placementDate)
        : undefined,
      represIsin: isSet(object.represIsin) ? String(object.represIsin) : '',
      issueSizePlan: isSet(object.issueSizePlan)
        ? Quotation.fromJSON(object.issueSizePlan)
        : undefined,
      totalFloat: isSet(object.totalFloat)
        ? Quotation.fromJSON(object.totalFloat)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.type !== undefined && (obj.type = shareTypeToJSON(message.type));
    message.issueSize !== undefined &&
      (obj.issueSize = message.issueSize
        ? Quotation.toJSON(message.issueSize)
        : undefined);
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? Quotation.toJSON(message.nominal)
        : undefined);
    message.nominalCurrency !== undefined &&
      (obj.nominalCurrency = message.nominalCurrency);
    message.primaryIndex !== undefined &&
      (obj.primaryIndex = message.primaryIndex);
    message.dividendRate !== undefined &&
      (obj.dividendRate = message.dividendRate
        ? Quotation.toJSON(message.dividendRate)
        : undefined);
    message.preferredShareType !== undefined &&
      (obj.preferredShareType = message.preferredShareType);
    message.ipoDate !== undefined &&
      (obj.ipoDate = message.ipoDate.toISOString());
    message.registryDate !== undefined &&
      (obj.registryDate = message.registryDate.toISOString());
    message.divYieldFlag !== undefined &&
      (obj.divYieldFlag = message.divYieldFlag);
    message.issueKind !== undefined && (obj.issueKind = message.issueKind);
    message.placementDate !== undefined &&
      (obj.placementDate = message.placementDate.toISOString());
    message.represIsin !== undefined && (obj.represIsin = message.represIsin);
    message.issueSizePlan !== undefined &&
      (obj.issueSizePlan = message.issueSizePlan
        ? Quotation.toJSON(message.issueSizePlan)
        : undefined);
    message.totalFloat !== undefined &&
      (obj.totalFloat = message.totalFloat
        ? Quotation.toJSON(message.totalFloat)
        : undefined);

    return obj;
  }
};

function createBaseAssetBond() {
  return {
    currentNominal: undefined,
    borrowName: '',
    issueSize: undefined,
    nominal: undefined,
    nominalCurrency: '',
    issueKind: '',
    interestKind: '',
    couponQuantityPerYear: 0,
    indexedNominalFlag: false,
    subordinatedFlag: false,
    collateralFlag: false,
    taxFreeFlag: false,
    amortizationFlag: false,
    floatingCouponFlag: false,
    perpetualFlag: false,
    maturityDate: undefined,
    returnCondition: '',
    stateRegDate: undefined,
    placementDate: undefined,
    placementPrice: undefined,
    issueSizePlan: undefined
  };
}

export const AssetBond = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.currentNominal !== undefined) {
      Quotation.encode(
        message.currentNominal,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.borrowName !== '') {
      writer.uint32(18).string(message.borrowName);
    }

    if (message.issueSize !== undefined) {
      Quotation.encode(message.issueSize, writer.uint32(26).fork()).ldelim();
    }

    if (message.nominal !== undefined) {
      Quotation.encode(message.nominal, writer.uint32(34).fork()).ldelim();
    }

    if (message.nominalCurrency !== '') {
      writer.uint32(42).string(message.nominalCurrency);
    }

    if (message.issueKind !== '') {
      writer.uint32(50).string(message.issueKind);
    }

    if (message.interestKind !== '') {
      writer.uint32(58).string(message.interestKind);
    }

    if (message.couponQuantityPerYear !== 0) {
      writer.uint32(64).int32(message.couponQuantityPerYear);
    }

    if (message.indexedNominalFlag === true) {
      writer.uint32(72).bool(message.indexedNominalFlag);
    }

    if (message.subordinatedFlag === true) {
      writer.uint32(80).bool(message.subordinatedFlag);
    }

    if (message.collateralFlag === true) {
      writer.uint32(88).bool(message.collateralFlag);
    }

    if (message.taxFreeFlag === true) {
      writer.uint32(96).bool(message.taxFreeFlag);
    }

    if (message.amortizationFlag === true) {
      writer.uint32(104).bool(message.amortizationFlag);
    }

    if (message.floatingCouponFlag === true) {
      writer.uint32(112).bool(message.floatingCouponFlag);
    }

    if (message.perpetualFlag === true) {
      writer.uint32(120).bool(message.perpetualFlag);
    }

    if (message.maturityDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.maturityDate),
        writer.uint32(130).fork()
      ).ldelim();
    }

    if (message.returnCondition !== '') {
      writer.uint32(138).string(message.returnCondition);
    }

    if (message.stateRegDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.stateRegDate),
        writer.uint32(146).fork()
      ).ldelim();
    }

    if (message.placementDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.placementDate),
        writer.uint32(154).fork()
      ).ldelim();
    }

    if (message.placementPrice !== undefined) {
      Quotation.encode(
        message.placementPrice,
        writer.uint32(162).fork()
      ).ldelim();
    }

    if (message.issueSizePlan !== undefined) {
      Quotation.encode(
        message.issueSizePlan,
        writer.uint32(170).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetBond();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.currentNominal = Quotation.decode(reader, reader.uint32());

          break;
        case 2:
          message.borrowName = reader.string();

          break;
        case 3:
          message.issueSize = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.nominal = Quotation.decode(reader, reader.uint32());

          break;
        case 5:
          message.nominalCurrency = reader.string();

          break;
        case 6:
          message.issueKind = reader.string();

          break;
        case 7:
          message.interestKind = reader.string();

          break;
        case 8:
          message.couponQuantityPerYear = reader.int32();

          break;
        case 9:
          message.indexedNominalFlag = reader.bool();

          break;
        case 10:
          message.subordinatedFlag = reader.bool();

          break;
        case 11:
          message.collateralFlag = reader.bool();

          break;
        case 12:
          message.taxFreeFlag = reader.bool();

          break;
        case 13:
          message.amortizationFlag = reader.bool();

          break;
        case 14:
          message.floatingCouponFlag = reader.bool();

          break;
        case 15:
          message.perpetualFlag = reader.bool();

          break;
        case 16:
          message.maturityDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 17:
          message.returnCondition = reader.string();

          break;
        case 18:
          message.stateRegDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 19:
          message.placementDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 20:
          message.placementPrice = Quotation.decode(reader, reader.uint32());

          break;
        case 21:
          message.issueSizePlan = Quotation.decode(reader, reader.uint32());

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      currentNominal: isSet(object.currentNominal)
        ? Quotation.fromJSON(object.currentNominal)
        : undefined,
      borrowName: isSet(object.borrowName) ? String(object.borrowName) : '',
      issueSize: isSet(object.issueSize)
        ? Quotation.fromJSON(object.issueSize)
        : undefined,
      nominal: isSet(object.nominal)
        ? Quotation.fromJSON(object.nominal)
        : undefined,
      nominalCurrency: isSet(object.nominalCurrency)
        ? String(object.nominalCurrency)
        : '',
      issueKind: isSet(object.issueKind) ? String(object.issueKind) : '',
      interestKind: isSet(object.interestKind)
        ? String(object.interestKind)
        : '',
      couponQuantityPerYear: isSet(object.couponQuantityPerYear)
        ? Number(object.couponQuantityPerYear)
        : 0,
      indexedNominalFlag: isSet(object.indexedNominalFlag)
        ? Boolean(object.indexedNominalFlag)
        : false,
      subordinatedFlag: isSet(object.subordinatedFlag)
        ? Boolean(object.subordinatedFlag)
        : false,
      collateralFlag: isSet(object.collateralFlag)
        ? Boolean(object.collateralFlag)
        : false,
      taxFreeFlag: isSet(object.taxFreeFlag)
        ? Boolean(object.taxFreeFlag)
        : false,
      amortizationFlag: isSet(object.amortizationFlag)
        ? Boolean(object.amortizationFlag)
        : false,
      floatingCouponFlag: isSet(object.floatingCouponFlag)
        ? Boolean(object.floatingCouponFlag)
        : false,
      perpetualFlag: isSet(object.perpetualFlag)
        ? Boolean(object.perpetualFlag)
        : false,
      maturityDate: isSet(object.maturityDate)
        ? fromJsonTimestamp(object.maturityDate)
        : undefined,
      returnCondition: isSet(object.returnCondition)
        ? String(object.returnCondition)
        : '',
      stateRegDate: isSet(object.stateRegDate)
        ? fromJsonTimestamp(object.stateRegDate)
        : undefined,
      placementDate: isSet(object.placementDate)
        ? fromJsonTimestamp(object.placementDate)
        : undefined,
      placementPrice: isSet(object.placementPrice)
        ? Quotation.fromJSON(object.placementPrice)
        : undefined,
      issueSizePlan: isSet(object.issueSizePlan)
        ? Quotation.fromJSON(object.issueSizePlan)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.currentNominal !== undefined &&
      (obj.currentNominal = message.currentNominal
        ? Quotation.toJSON(message.currentNominal)
        : undefined);
    message.borrowName !== undefined && (obj.borrowName = message.borrowName);
    message.issueSize !== undefined &&
      (obj.issueSize = message.issueSize
        ? Quotation.toJSON(message.issueSize)
        : undefined);
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? Quotation.toJSON(message.nominal)
        : undefined);
    message.nominalCurrency !== undefined &&
      (obj.nominalCurrency = message.nominalCurrency);
    message.issueKind !== undefined && (obj.issueKind = message.issueKind);
    message.interestKind !== undefined &&
      (obj.interestKind = message.interestKind);
    message.couponQuantityPerYear !== undefined &&
      (obj.couponQuantityPerYear = Math.round(message.couponQuantityPerYear));
    message.indexedNominalFlag !== undefined &&
      (obj.indexedNominalFlag = message.indexedNominalFlag);
    message.subordinatedFlag !== undefined &&
      (obj.subordinatedFlag = message.subordinatedFlag);
    message.collateralFlag !== undefined &&
      (obj.collateralFlag = message.collateralFlag);
    message.taxFreeFlag !== undefined &&
      (obj.taxFreeFlag = message.taxFreeFlag);
    message.amortizationFlag !== undefined &&
      (obj.amortizationFlag = message.amortizationFlag);
    message.floatingCouponFlag !== undefined &&
      (obj.floatingCouponFlag = message.floatingCouponFlag);
    message.perpetualFlag !== undefined &&
      (obj.perpetualFlag = message.perpetualFlag);
    message.maturityDate !== undefined &&
      (obj.maturityDate = message.maturityDate.toISOString());
    message.returnCondition !== undefined &&
      (obj.returnCondition = message.returnCondition);
    message.stateRegDate !== undefined &&
      (obj.stateRegDate = message.stateRegDate.toISOString());
    message.placementDate !== undefined &&
      (obj.placementDate = message.placementDate.toISOString());
    message.placementPrice !== undefined &&
      (obj.placementPrice = message.placementPrice
        ? Quotation.toJSON(message.placementPrice)
        : undefined);
    message.issueSizePlan !== undefined &&
      (obj.issueSizePlan = message.issueSizePlan
        ? Quotation.toJSON(message.issueSizePlan)
        : undefined);

    return obj;
  }
};

function createBaseAssetStructuredProduct() {
  return {
    borrowName: '',
    nominal: undefined,
    nominalCurrency: '',
    type: 0,
    logicPortfolio: '',
    assetType: 0,
    basicAsset: '',
    safetyBarrier: undefined,
    maturityDate: undefined,
    issueSizePlan: undefined,
    issueSize: undefined,
    placementDate: undefined,
    issueKind: ''
  };
}

export const AssetStructuredProduct = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.borrowName !== '') {
      writer.uint32(10).string(message.borrowName);
    }

    if (message.nominal !== undefined) {
      Quotation.encode(message.nominal, writer.uint32(18).fork()).ldelim();
    }

    if (message.nominalCurrency !== '') {
      writer.uint32(26).string(message.nominalCurrency);
    }

    if (message.type !== 0) {
      writer.uint32(32).int32(message.type);
    }

    if (message.logicPortfolio !== '') {
      writer.uint32(42).string(message.logicPortfolio);
    }

    if (message.assetType !== 0) {
      writer.uint32(48).int32(message.assetType);
    }

    if (message.basicAsset !== '') {
      writer.uint32(58).string(message.basicAsset);
    }

    if (message.safetyBarrier !== undefined) {
      Quotation.encode(
        message.safetyBarrier,
        writer.uint32(66).fork()
      ).ldelim();
    }

    if (message.maturityDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.maturityDate),
        writer.uint32(74).fork()
      ).ldelim();
    }

    if (message.issueSizePlan !== undefined) {
      Quotation.encode(
        message.issueSizePlan,
        writer.uint32(82).fork()
      ).ldelim();
    }

    if (message.issueSize !== undefined) {
      Quotation.encode(message.issueSize, writer.uint32(90).fork()).ldelim();
    }

    if (message.placementDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.placementDate),
        writer.uint32(98).fork()
      ).ldelim();
    }

    if (message.issueKind !== '') {
      writer.uint32(106).string(message.issueKind);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetStructuredProduct();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.borrowName = reader.string();

          break;
        case 2:
          message.nominal = Quotation.decode(reader, reader.uint32());

          break;
        case 3:
          message.nominalCurrency = reader.string();

          break;
        case 4:
          message.type = reader.int32();

          break;
        case 5:
          message.logicPortfolio = reader.string();

          break;
        case 6:
          message.assetType = reader.int32();

          break;
        case 7:
          message.basicAsset = reader.string();

          break;
        case 8:
          message.safetyBarrier = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.maturityDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 10:
          message.issueSizePlan = Quotation.decode(reader, reader.uint32());

          break;
        case 11:
          message.issueSize = Quotation.decode(reader, reader.uint32());

          break;
        case 12:
          message.placementDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 13:
          message.issueKind = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      borrowName: isSet(object.borrowName) ? String(object.borrowName) : '',
      nominal: isSet(object.nominal)
        ? Quotation.fromJSON(object.nominal)
        : undefined,
      nominalCurrency: isSet(object.nominalCurrency)
        ? String(object.nominalCurrency)
        : '',
      type: isSet(object.type) ? structuredProductTypeFromJSON(object.type) : 0,
      logicPortfolio: isSet(object.logicPortfolio)
        ? String(object.logicPortfolio)
        : '',
      assetType: isSet(object.assetType)
        ? assetTypeFromJSON(object.assetType)
        : 0,
      basicAsset: isSet(object.basicAsset) ? String(object.basicAsset) : '',
      safetyBarrier: isSet(object.safetyBarrier)
        ? Quotation.fromJSON(object.safetyBarrier)
        : undefined,
      maturityDate: isSet(object.maturityDate)
        ? fromJsonTimestamp(object.maturityDate)
        : undefined,
      issueSizePlan: isSet(object.issueSizePlan)
        ? Quotation.fromJSON(object.issueSizePlan)
        : undefined,
      issueSize: isSet(object.issueSize)
        ? Quotation.fromJSON(object.issueSize)
        : undefined,
      placementDate: isSet(object.placementDate)
        ? fromJsonTimestamp(object.placementDate)
        : undefined,
      issueKind: isSet(object.issueKind) ? String(object.issueKind) : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.borrowName !== undefined && (obj.borrowName = message.borrowName);
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? Quotation.toJSON(message.nominal)
        : undefined);
    message.nominalCurrency !== undefined &&
      (obj.nominalCurrency = message.nominalCurrency);
    message.type !== undefined &&
      (obj.type = structuredProductTypeToJSON(message.type));
    message.logicPortfolio !== undefined &&
      (obj.logicPortfolio = message.logicPortfolio);
    message.assetType !== undefined &&
      (obj.assetType = assetTypeToJSON(message.assetType));
    message.basicAsset !== undefined && (obj.basicAsset = message.basicAsset);
    message.safetyBarrier !== undefined &&
      (obj.safetyBarrier = message.safetyBarrier
        ? Quotation.toJSON(message.safetyBarrier)
        : undefined);
    message.maturityDate !== undefined &&
      (obj.maturityDate = message.maturityDate.toISOString());
    message.issueSizePlan !== undefined &&
      (obj.issueSizePlan = message.issueSizePlan
        ? Quotation.toJSON(message.issueSizePlan)
        : undefined);
    message.issueSize !== undefined &&
      (obj.issueSize = message.issueSize
        ? Quotation.toJSON(message.issueSize)
        : undefined);
    message.placementDate !== undefined &&
      (obj.placementDate = message.placementDate.toISOString());
    message.issueKind !== undefined && (obj.issueKind = message.issueKind);

    return obj;
  }
};

function createBaseAssetEtf() {
  return {
    totalExpense: undefined,
    hurdleRate: undefined,
    performanceFee: undefined,
    fixedCommission: undefined,
    paymentType: '',
    watermarkFlag: false,
    buyPremium: undefined,
    sellDiscount: undefined,
    rebalancingFlag: false,
    rebalancingFreq: '',
    managementType: '',
    primaryIndex: '',
    focusType: '',
    leveragedFlag: false,
    numShare: undefined,
    ucitsFlag: false,
    releasedDate: undefined,
    description: '',
    primaryIndexDescription: '',
    primaryIndexCompany: '',
    indexRecoveryPeriod: undefined,
    inavCode: '',
    divYieldFlag: false,
    expenseCommission: undefined,
    primaryIndexTrackingError: undefined,
    rebalancingPlan: '',
    taxRate: '',
    rebalancingDates: [],
    issueKind: '',
    nominal: undefined,
    nominalCurrency: ''
  };
}

export const AssetEtf = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.totalExpense !== undefined) {
      Quotation.encode(message.totalExpense, writer.uint32(10).fork()).ldelim();
    }

    if (message.hurdleRate !== undefined) {
      Quotation.encode(message.hurdleRate, writer.uint32(18).fork()).ldelim();
    }

    if (message.performanceFee !== undefined) {
      Quotation.encode(
        message.performanceFee,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.fixedCommission !== undefined) {
      Quotation.encode(
        message.fixedCommission,
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.paymentType !== '') {
      writer.uint32(42).string(message.paymentType);
    }

    if (message.watermarkFlag === true) {
      writer.uint32(48).bool(message.watermarkFlag);
    }

    if (message.buyPremium !== undefined) {
      Quotation.encode(message.buyPremium, writer.uint32(58).fork()).ldelim();
    }

    if (message.sellDiscount !== undefined) {
      Quotation.encode(message.sellDiscount, writer.uint32(66).fork()).ldelim();
    }

    if (message.rebalancingFlag === true) {
      writer.uint32(72).bool(message.rebalancingFlag);
    }

    if (message.rebalancingFreq !== '') {
      writer.uint32(82).string(message.rebalancingFreq);
    }

    if (message.managementType !== '') {
      writer.uint32(90).string(message.managementType);
    }

    if (message.primaryIndex !== '') {
      writer.uint32(98).string(message.primaryIndex);
    }

    if (message.focusType !== '') {
      writer.uint32(106).string(message.focusType);
    }

    if (message.leveragedFlag === true) {
      writer.uint32(112).bool(message.leveragedFlag);
    }

    if (message.numShare !== undefined) {
      Quotation.encode(message.numShare, writer.uint32(122).fork()).ldelim();
    }

    if (message.ucitsFlag === true) {
      writer.uint32(128).bool(message.ucitsFlag);
    }

    if (message.releasedDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.releasedDate),
        writer.uint32(138).fork()
      ).ldelim();
    }

    if (message.description !== '') {
      writer.uint32(146).string(message.description);
    }

    if (message.primaryIndexDescription !== '') {
      writer.uint32(154).string(message.primaryIndexDescription);
    }

    if (message.primaryIndexCompany !== '') {
      writer.uint32(162).string(message.primaryIndexCompany);
    }

    if (message.indexRecoveryPeriod !== undefined) {
      Quotation.encode(
        message.indexRecoveryPeriod,
        writer.uint32(170).fork()
      ).ldelim();
    }

    if (message.inavCode !== '') {
      writer.uint32(178).string(message.inavCode);
    }

    if (message.divYieldFlag === true) {
      writer.uint32(184).bool(message.divYieldFlag);
    }

    if (message.expenseCommission !== undefined) {
      Quotation.encode(
        message.expenseCommission,
        writer.uint32(194).fork()
      ).ldelim();
    }

    if (message.primaryIndexTrackingError !== undefined) {
      Quotation.encode(
        message.primaryIndexTrackingError,
        writer.uint32(202).fork()
      ).ldelim();
    }

    if (message.rebalancingPlan !== '') {
      writer.uint32(210).string(message.rebalancingPlan);
    }

    if (message.taxRate !== '') {
      writer.uint32(218).string(message.taxRate);
    }

    for (const v of message.rebalancingDates) {
      Timestamp.encode(toTimestamp(v), writer.uint32(226).fork()).ldelim();
    }

    if (message.issueKind !== '') {
      writer.uint32(234).string(message.issueKind);
    }

    if (message.nominal !== undefined) {
      Quotation.encode(message.nominal, writer.uint32(242).fork()).ldelim();
    }

    if (message.nominalCurrency !== '') {
      writer.uint32(250).string(message.nominalCurrency);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetEtf();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.totalExpense = Quotation.decode(reader, reader.uint32());

          break;
        case 2:
          message.hurdleRate = Quotation.decode(reader, reader.uint32());

          break;
        case 3:
          message.performanceFee = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.fixedCommission = Quotation.decode(reader, reader.uint32());

          break;
        case 5:
          message.paymentType = reader.string();

          break;
        case 6:
          message.watermarkFlag = reader.bool();

          break;
        case 7:
          message.buyPremium = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.sellDiscount = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
          message.rebalancingFlag = reader.bool();

          break;
        case 10:
          message.rebalancingFreq = reader.string();

          break;
        case 11:
          message.managementType = reader.string();

          break;
        case 12:
          message.primaryIndex = reader.string();

          break;
        case 13:
          message.focusType = reader.string();

          break;
        case 14:
          message.leveragedFlag = reader.bool();

          break;
        case 15:
          message.numShare = Quotation.decode(reader, reader.uint32());

          break;
        case 16:
          message.ucitsFlag = reader.bool();

          break;
        case 17:
          message.releasedDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 18:
          message.description = reader.string();

          break;
        case 19:
          message.primaryIndexDescription = reader.string();

          break;
        case 20:
          message.primaryIndexCompany = reader.string();

          break;
        case 21:
          message.indexRecoveryPeriod = Quotation.decode(
            reader,
            reader.uint32()
          );

          break;
        case 22:
          message.inavCode = reader.string();

          break;
        case 23:
          message.divYieldFlag = reader.bool();

          break;
        case 24:
          message.expenseCommission = Quotation.decode(reader, reader.uint32());

          break;
        case 25:
          message.primaryIndexTrackingError = Quotation.decode(
            reader,
            reader.uint32()
          );

          break;
        case 26:
          message.rebalancingPlan = reader.string();

          break;
        case 27:
          message.taxRate = reader.string();

          break;
        case 28:
          message.rebalancingDates.push(
            fromTimestamp(Timestamp.decode(reader, reader.uint32()))
          );

          break;
        case 29:
          message.issueKind = reader.string();

          break;
        case 30:
          message.nominal = Quotation.decode(reader, reader.uint32());

          break;
        case 31:
          message.nominalCurrency = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      totalExpense: isSet(object.totalExpense)
        ? Quotation.fromJSON(object.totalExpense)
        : undefined,
      hurdleRate: isSet(object.hurdleRate)
        ? Quotation.fromJSON(object.hurdleRate)
        : undefined,
      performanceFee: isSet(object.performanceFee)
        ? Quotation.fromJSON(object.performanceFee)
        : undefined,
      fixedCommission: isSet(object.fixedCommission)
        ? Quotation.fromJSON(object.fixedCommission)
        : undefined,
      paymentType: isSet(object.paymentType) ? String(object.paymentType) : '',
      watermarkFlag: isSet(object.watermarkFlag)
        ? Boolean(object.watermarkFlag)
        : false,
      buyPremium: isSet(object.buyPremium)
        ? Quotation.fromJSON(object.buyPremium)
        : undefined,
      sellDiscount: isSet(object.sellDiscount)
        ? Quotation.fromJSON(object.sellDiscount)
        : undefined,
      rebalancingFlag: isSet(object.rebalancingFlag)
        ? Boolean(object.rebalancingFlag)
        : false,
      rebalancingFreq: isSet(object.rebalancingFreq)
        ? String(object.rebalancingFreq)
        : '',
      managementType: isSet(object.managementType)
        ? String(object.managementType)
        : '',
      primaryIndex: isSet(object.primaryIndex)
        ? String(object.primaryIndex)
        : '',
      focusType: isSet(object.focusType) ? String(object.focusType) : '',
      leveragedFlag: isSet(object.leveragedFlag)
        ? Boolean(object.leveragedFlag)
        : false,
      numShare: isSet(object.numShare)
        ? Quotation.fromJSON(object.numShare)
        : undefined,
      ucitsFlag: isSet(object.ucitsFlag) ? Boolean(object.ucitsFlag) : false,
      releasedDate: isSet(object.releasedDate)
        ? fromJsonTimestamp(object.releasedDate)
        : undefined,
      description: isSet(object.description) ? String(object.description) : '',
      primaryIndexDescription: isSet(object.primaryIndexDescription)
        ? String(object.primaryIndexDescription)
        : '',
      primaryIndexCompany: isSet(object.primaryIndexCompany)
        ? String(object.primaryIndexCompany)
        : '',
      indexRecoveryPeriod: isSet(object.indexRecoveryPeriod)
        ? Quotation.fromJSON(object.indexRecoveryPeriod)
        : undefined,
      inavCode: isSet(object.inavCode) ? String(object.inavCode) : '',
      divYieldFlag: isSet(object.divYieldFlag)
        ? Boolean(object.divYieldFlag)
        : false,
      expenseCommission: isSet(object.expenseCommission)
        ? Quotation.fromJSON(object.expenseCommission)
        : undefined,
      primaryIndexTrackingError: isSet(object.primaryIndexTrackingError)
        ? Quotation.fromJSON(object.primaryIndexTrackingError)
        : undefined,
      rebalancingPlan: isSet(object.rebalancingPlan)
        ? String(object.rebalancingPlan)
        : '',
      taxRate: isSet(object.taxRate) ? String(object.taxRate) : '',
      rebalancingDates: Array.isArray(object?.rebalancingDates)
        ? object.rebalancingDates.map((e) => fromJsonTimestamp(e))
        : [],
      issueKind: isSet(object.issueKind) ? String(object.issueKind) : '',
      nominal: isSet(object.nominal)
        ? Quotation.fromJSON(object.nominal)
        : undefined,
      nominalCurrency: isSet(object.nominalCurrency)
        ? String(object.nominalCurrency)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.totalExpense !== undefined &&
      (obj.totalExpense = message.totalExpense
        ? Quotation.toJSON(message.totalExpense)
        : undefined);
    message.hurdleRate !== undefined &&
      (obj.hurdleRate = message.hurdleRate
        ? Quotation.toJSON(message.hurdleRate)
        : undefined);
    message.performanceFee !== undefined &&
      (obj.performanceFee = message.performanceFee
        ? Quotation.toJSON(message.performanceFee)
        : undefined);
    message.fixedCommission !== undefined &&
      (obj.fixedCommission = message.fixedCommission
        ? Quotation.toJSON(message.fixedCommission)
        : undefined);
    message.paymentType !== undefined &&
      (obj.paymentType = message.paymentType);
    message.watermarkFlag !== undefined &&
      (obj.watermarkFlag = message.watermarkFlag);
    message.buyPremium !== undefined &&
      (obj.buyPremium = message.buyPremium
        ? Quotation.toJSON(message.buyPremium)
        : undefined);
    message.sellDiscount !== undefined &&
      (obj.sellDiscount = message.sellDiscount
        ? Quotation.toJSON(message.sellDiscount)
        : undefined);
    message.rebalancingFlag !== undefined &&
      (obj.rebalancingFlag = message.rebalancingFlag);
    message.rebalancingFreq !== undefined &&
      (obj.rebalancingFreq = message.rebalancingFreq);
    message.managementType !== undefined &&
      (obj.managementType = message.managementType);
    message.primaryIndex !== undefined &&
      (obj.primaryIndex = message.primaryIndex);
    message.focusType !== undefined && (obj.focusType = message.focusType);
    message.leveragedFlag !== undefined &&
      (obj.leveragedFlag = message.leveragedFlag);
    message.numShare !== undefined &&
      (obj.numShare = message.numShare
        ? Quotation.toJSON(message.numShare)
        : undefined);
    message.ucitsFlag !== undefined && (obj.ucitsFlag = message.ucitsFlag);
    message.releasedDate !== undefined &&
      (obj.releasedDate = message.releasedDate.toISOString());
    message.description !== undefined &&
      (obj.description = message.description);
    message.primaryIndexDescription !== undefined &&
      (obj.primaryIndexDescription = message.primaryIndexDescription);
    message.primaryIndexCompany !== undefined &&
      (obj.primaryIndexCompany = message.primaryIndexCompany);
    message.indexRecoveryPeriod !== undefined &&
      (obj.indexRecoveryPeriod = message.indexRecoveryPeriod
        ? Quotation.toJSON(message.indexRecoveryPeriod)
        : undefined);
    message.inavCode !== undefined && (obj.inavCode = message.inavCode);
    message.divYieldFlag !== undefined &&
      (obj.divYieldFlag = message.divYieldFlag);
    message.expenseCommission !== undefined &&
      (obj.expenseCommission = message.expenseCommission
        ? Quotation.toJSON(message.expenseCommission)
        : undefined);
    message.primaryIndexTrackingError !== undefined &&
      (obj.primaryIndexTrackingError = message.primaryIndexTrackingError
        ? Quotation.toJSON(message.primaryIndexTrackingError)
        : undefined);
    message.rebalancingPlan !== undefined &&
      (obj.rebalancingPlan = message.rebalancingPlan);
    message.taxRate !== undefined && (obj.taxRate = message.taxRate);

    if (message.rebalancingDates) {
      obj.rebalancingDates = message.rebalancingDates.map((e) =>
        e.toISOString()
      );
    } else {
      obj.rebalancingDates = [];
    }

    message.issueKind !== undefined && (obj.issueKind = message.issueKind);
    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? Quotation.toJSON(message.nominal)
        : undefined);
    message.nominalCurrency !== undefined &&
      (obj.nominalCurrency = message.nominalCurrency);

    return obj;
  }
};

function createBaseAssetClearingCertificate() {
  return { nominal: undefined, nominalCurrency: '' };
}

export const AssetClearingCertificate = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.nominal !== undefined) {
      Quotation.encode(message.nominal, writer.uint32(10).fork()).ldelim();
    }

    if (message.nominalCurrency !== '') {
      writer.uint32(18).string(message.nominalCurrency);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetClearingCertificate();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.nominal = Quotation.decode(reader, reader.uint32());

          break;
        case 2:
          message.nominalCurrency = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      nominal: isSet(object.nominal)
        ? Quotation.fromJSON(object.nominal)
        : undefined,
      nominalCurrency: isSet(object.nominalCurrency)
        ? String(object.nominalCurrency)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.nominal !== undefined &&
      (obj.nominal = message.nominal
        ? Quotation.toJSON(message.nominal)
        : undefined);
    message.nominalCurrency !== undefined &&
      (obj.nominalCurrency = message.nominalCurrency);

    return obj;
  }
};

function createBaseBrand() {
  return {
    uid: '',
    name: '',
    description: '',
    info: '',
    company: '',
    sector: '',
    countryOfRisk: '',
    countryOfRiskName: ''
  };
}

export const Brand = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.uid !== '') {
      writer.uint32(10).string(message.uid);
    }

    if (message.name !== '') {
      writer.uint32(18).string(message.name);
    }

    if (message.description !== '') {
      writer.uint32(26).string(message.description);
    }

    if (message.info !== '') {
      writer.uint32(34).string(message.info);
    }

    if (message.company !== '') {
      writer.uint32(42).string(message.company);
    }

    if (message.sector !== '') {
      writer.uint32(50).string(message.sector);
    }

    if (message.countryOfRisk !== '') {
      writer.uint32(58).string(message.countryOfRisk);
    }

    if (message.countryOfRiskName !== '') {
      writer.uint32(66).string(message.countryOfRiskName);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrand();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.uid = reader.string();

          break;
        case 2:
          message.name = reader.string();

          break;
        case 3:
          message.description = reader.string();

          break;
        case 4:
          message.info = reader.string();

          break;
        case 5:
          message.company = reader.string();

          break;
        case 6:
          message.sector = reader.string();

          break;
        case 7:
          message.countryOfRisk = reader.string();

          break;
        case 8:
          message.countryOfRiskName = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      uid: isSet(object.uid) ? String(object.uid) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : '',
      info: isSet(object.info) ? String(object.info) : '',
      company: isSet(object.company) ? String(object.company) : '',
      sector: isSet(object.sector) ? String(object.sector) : '',
      countryOfRisk: isSet(object.countryOfRisk)
        ? String(object.countryOfRisk)
        : '',
      countryOfRiskName: isSet(object.countryOfRiskName)
        ? String(object.countryOfRiskName)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.uid !== undefined && (obj.uid = message.uid);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.info !== undefined && (obj.info = message.info);
    message.company !== undefined && (obj.company = message.company);
    message.sector !== undefined && (obj.sector = message.sector);
    message.countryOfRisk !== undefined &&
      (obj.countryOfRisk = message.countryOfRisk);
    message.countryOfRiskName !== undefined &&
      (obj.countryOfRiskName = message.countryOfRiskName);

    return obj;
  }
};

function createBaseAssetInstrument() {
  return {
    uid: '',
    figi: '',
    instrumentType: '',
    ticker: '',
    classCode: '',
    links: []
  };
}

export const AssetInstrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.uid !== '') {
      writer.uint32(10).string(message.uid);
    }

    if (message.figi !== '') {
      writer.uint32(18).string(message.figi);
    }

    if (message.instrumentType !== '') {
      writer.uint32(26).string(message.instrumentType);
    }

    if (message.ticker !== '') {
      writer.uint32(34).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(42).string(message.classCode);
    }

    for (const v of message.links) {
      InstrumentLink.encode(v, writer.uint32(50).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.uid = reader.string();

          break;
        case 2:
          message.figi = reader.string();

          break;
        case 3:
          message.instrumentType = reader.string();

          break;
        case 4:
          message.ticker = reader.string();

          break;
        case 5:
          message.classCode = reader.string();

          break;
        case 6:
          message.links.push(InstrumentLink.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      uid: isSet(object.uid) ? String(object.uid) : '',
      figi: isSet(object.figi) ? String(object.figi) : '',
      instrumentType: isSet(object.instrumentType)
        ? String(object.instrumentType)
        : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      links: Array.isArray(object?.links)
        ? object.links.map((e) => InstrumentLink.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.uid !== undefined && (obj.uid = message.uid);
    message.figi !== undefined && (obj.figi = message.figi);
    message.instrumentType !== undefined &&
      (obj.instrumentType = message.instrumentType);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);

    if (message.links) {
      obj.links = message.links.map((e) =>
        e ? InstrumentLink.toJSON(e) : undefined
      );
    } else {
      obj.links = [];
    }

    return obj;
  }
};

function createBaseInstrumentLink() {
  return { type: '', instrumentUid: '' };
}

export const InstrumentLink = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.type !== '') {
      writer.uint32(10).string(message.type);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(18).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrumentLink();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();

          break;
        case 2:
          message.instrumentUid = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      type: isSet(object.type) ? String(object.type) : '',
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.type !== undefined && (obj.type = message.type);
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseGetFavoritesRequest() {
  return {};
}

export const GetFavoritesRequest = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetFavoritesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};

    return obj;
  }
};

function createBaseGetFavoritesResponse() {
  return { favoriteInstruments: [] };
}

export const GetFavoritesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.favoriteInstruments) {
      FavoriteInstrument.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetFavoritesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.favoriteInstruments.push(
            FavoriteInstrument.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      favoriteInstruments: Array.isArray(object?.favoriteInstruments)
        ? object.favoriteInstruments.map((e) => FavoriteInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.favoriteInstruments) {
      obj.favoriteInstruments = message.favoriteInstruments.map((e) =>
        e ? FavoriteInstrument.toJSON(e) : undefined
      );
    } else {
      obj.favoriteInstruments = [];
    }

    return obj;
  }
};

function createBaseFavoriteInstrument() {
  return {
    figi: '',
    ticker: '',
    classCode: '',
    isin: '',
    instrumentType: '',
    otcFlag: false,
    apiTradeAvailableFlag: false
  };
}

export const FavoriteInstrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(26).string(message.classCode);
    }

    if (message.isin !== '') {
      writer.uint32(34).string(message.isin);
    }

    if (message.instrumentType !== '') {
      writer.uint32(90).string(message.instrumentType);
    }

    if (message.otcFlag === true) {
      writer.uint32(128).bool(message.otcFlag);
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(136).bool(message.apiTradeAvailableFlag);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFavoriteInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.ticker = reader.string();

          break;
        case 3:
          message.classCode = reader.string();

          break;
        case 4:
          message.isin = reader.string();

          break;
        case 11:
          message.instrumentType = reader.string();

          break;
        case 16:
          message.otcFlag = reader.bool();

          break;
        case 17:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      isin: isSet(object.isin) ? String(object.isin) : '',
      instrumentType: isSet(object.instrumentType)
        ? String(object.instrumentType)
        : '',
      otcFlag: isSet(object.otcFlag) ? Boolean(object.otcFlag) : false,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.isin !== undefined && (obj.isin = message.isin);
    message.instrumentType !== undefined &&
      (obj.instrumentType = message.instrumentType);
    message.otcFlag !== undefined && (obj.otcFlag = message.otcFlag);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);

    return obj;
  }
};

function createBaseEditFavoritesRequest() {
  return { instruments: [], actionType: 0 };
}

export const EditFavoritesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      EditFavoritesRequestInstrument.encode(
        v,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.actionType !== 0) {
      writer.uint32(48).int32(message.actionType);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEditFavoritesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(
            EditFavoritesRequestInstrument.decode(reader, reader.uint32())
          );

          break;
        case 6:
          message.actionType = reader.int32();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) =>
            EditFavoritesRequestInstrument.fromJSON(e)
          )
        : [],
      actionType: isSet(object.actionType)
        ? editFavoritesActionTypeFromJSON(object.actionType)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? EditFavoritesRequestInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    message.actionType !== undefined &&
      (obj.actionType = editFavoritesActionTypeToJSON(message.actionType));

    return obj;
  }
};

function createBaseEditFavoritesRequestInstrument() {
  return { figi: '' };
}

export const EditFavoritesRequestInstrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEditFavoritesRequestInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return { figi: isSet(object.figi) ? String(object.figi) : '' };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);

    return obj;
  }
};

function createBaseEditFavoritesResponse() {
  return { favoriteInstruments: [] };
}

export const EditFavoritesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.favoriteInstruments) {
      FavoriteInstrument.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEditFavoritesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.favoriteInstruments.push(
            FavoriteInstrument.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      favoriteInstruments: Array.isArray(object?.favoriteInstruments)
        ? object.favoriteInstruments.map((e) => FavoriteInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.favoriteInstruments) {
      obj.favoriteInstruments = message.favoriteInstruments.map((e) =>
        e ? FavoriteInstrument.toJSON(e) : undefined
      );
    } else {
      obj.favoriteInstruments = [];
    }

    return obj;
  }
};

function createBaseGetCountriesRequest() {
  return {};
}

export const GetCountriesRequest = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetCountriesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};

    return obj;
  }
};

function createBaseGetCountriesResponse() {
  return { countries: [] };
}

export const GetCountriesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.countries) {
      CountryResponse.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetCountriesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.countries.push(
            CountryResponse.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      countries: Array.isArray(object?.countries)
        ? object.countries.map((e) => CountryResponse.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.countries) {
      obj.countries = message.countries.map((e) =>
        e ? CountryResponse.toJSON(e) : undefined
      );
    } else {
      obj.countries = [];
    }

    return obj;
  }
};

function createBaseCountryResponse() {
  return { alfaTwo: '', alfaThree: '', name: '', nameBrief: '' };
}

export const CountryResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.alfaTwo !== '') {
      writer.uint32(10).string(message.alfaTwo);
    }

    if (message.alfaThree !== '') {
      writer.uint32(18).string(message.alfaThree);
    }

    if (message.name !== '') {
      writer.uint32(26).string(message.name);
    }

    if (message.nameBrief !== '') {
      writer.uint32(34).string(message.nameBrief);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCountryResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.alfaTwo = reader.string();

          break;
        case 2:
          message.alfaThree = reader.string();

          break;
        case 3:
          message.name = reader.string();

          break;
        case 4:
          message.nameBrief = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      alfaTwo: isSet(object.alfaTwo) ? String(object.alfaTwo) : '',
      alfaThree: isSet(object.alfaThree) ? String(object.alfaThree) : '',
      name: isSet(object.name) ? String(object.name) : '',
      nameBrief: isSet(object.nameBrief) ? String(object.nameBrief) : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.alfaTwo !== undefined && (obj.alfaTwo = message.alfaTwo);
    message.alfaThree !== undefined && (obj.alfaThree = message.alfaThree);
    message.name !== undefined && (obj.name = message.name);
    message.nameBrief !== undefined && (obj.nameBrief = message.nameBrief);

    return obj;
  }
};

function createBaseFindInstrumentRequest() {
  return { query: '' };
}

export const FindInstrumentRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.query !== '') {
      writer.uint32(10).string(message.query);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindInstrumentRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.query = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return { query: isSet(object.query) ? String(object.query) : '' };
  },
  toJSON(message) {
    const obj = {};

    message.query !== undefined && (obj.query = message.query);

    return obj;
  }
};

function createBaseFindInstrumentResponse() {
  return { instruments: [] };
}

export const FindInstrumentResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      InstrumentShort.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindInstrumentResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(
            InstrumentShort.decode(reader, reader.uint32())
          );

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => InstrumentShort.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? InstrumentShort.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseInstrumentShort() {
  return {
    isin: '',
    figi: '',
    ticker: '',
    classCode: '',
    instrumentType: '',
    name: '',
    uid: '',
    positionUid: '',
    apiTradeAvailableFlag: false,
    forIisFlag: false,
    first1minCandleDate: undefined,
    first1dayCandleDate: undefined,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false
  };
}

export const InstrumentShort = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.isin !== '') {
      writer.uint32(10).string(message.isin);
    }

    if (message.figi !== '') {
      writer.uint32(18).string(message.figi);
    }

    if (message.ticker !== '') {
      writer.uint32(26).string(message.ticker);
    }

    if (message.classCode !== '') {
      writer.uint32(34).string(message.classCode);
    }

    if (message.instrumentType !== '') {
      writer.uint32(42).string(message.instrumentType);
    }

    if (message.name !== '') {
      writer.uint32(50).string(message.name);
    }

    if (message.uid !== '') {
      writer.uint32(58).string(message.uid);
    }

    if (message.positionUid !== '') {
      writer.uint32(66).string(message.positionUid);
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(88).bool(message.apiTradeAvailableFlag);
    }

    if (message.forIisFlag === true) {
      writer.uint32(96).bool(message.forIisFlag);
    }

    if (message.first1minCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1minCandleDate),
        writer.uint32(210).fork()
      ).ldelim();
    }

    if (message.first1dayCandleDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.first1dayCandleDate),
        writer.uint32(218).fork()
      ).ldelim();
    }

    if (message.forQualInvestorFlag === true) {
      writer.uint32(224).bool(message.forQualInvestorFlag);
    }

    if (message.weekendFlag === true) {
      writer.uint32(232).bool(message.weekendFlag);
    }

    if (message.blockedTcaFlag === true) {
      writer.uint32(240).bool(message.blockedTcaFlag);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrumentShort();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.isin = reader.string();

          break;
        case 2:
          message.figi = reader.string();

          break;
        case 3:
          message.ticker = reader.string();

          break;
        case 4:
          message.classCode = reader.string();

          break;
        case 5:
          message.instrumentType = reader.string();

          break;
        case 6:
          message.name = reader.string();

          break;
        case 7:
          message.uid = reader.string();

          break;
        case 8:
          message.positionUid = reader.string();

          break;
        case 11:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 12:
          message.forIisFlag = reader.bool();

          break;
        case 26:
          message.first1minCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 27:
          message.first1dayCandleDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 28:
          message.forQualInvestorFlag = reader.bool();

          break;
        case 29:
          message.weekendFlag = reader.bool();

          break;
        case 30:
          message.blockedTcaFlag = reader.bool();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      isin: isSet(object.isin) ? String(object.isin) : '',
      figi: isSet(object.figi) ? String(object.figi) : '',
      ticker: isSet(object.ticker) ? String(object.ticker) : '',
      classCode: isSet(object.classCode) ? String(object.classCode) : '',
      instrumentType: isSet(object.instrumentType)
        ? String(object.instrumentType)
        : '',
      name: isSet(object.name) ? String(object.name) : '',
      uid: isSet(object.uid) ? String(object.uid) : '',
      positionUid: isSet(object.positionUid) ? String(object.positionUid) : '',
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      forIisFlag: isSet(object.forIisFlag) ? Boolean(object.forIisFlag) : false,
      first1minCandleDate: isSet(object.first1minCandleDate)
        ? fromJsonTimestamp(object.first1minCandleDate)
        : undefined,
      first1dayCandleDate: isSet(object.first1dayCandleDate)
        ? fromJsonTimestamp(object.first1dayCandleDate)
        : undefined,
      forQualInvestorFlag: isSet(object.forQualInvestorFlag)
        ? Boolean(object.forQualInvestorFlag)
        : false,
      weekendFlag: isSet(object.weekendFlag)
        ? Boolean(object.weekendFlag)
        : false,
      blockedTcaFlag: isSet(object.blockedTcaFlag)
        ? Boolean(object.blockedTcaFlag)
        : false
    };
  },
  toJSON(message) {
    const obj = {};

    message.isin !== undefined && (obj.isin = message.isin);
    message.figi !== undefined && (obj.figi = message.figi);
    message.ticker !== undefined && (obj.ticker = message.ticker);
    message.classCode !== undefined && (obj.classCode = message.classCode);
    message.instrumentType !== undefined &&
      (obj.instrumentType = message.instrumentType);
    message.name !== undefined && (obj.name = message.name);
    message.uid !== undefined && (obj.uid = message.uid);
    message.positionUid !== undefined &&
      (obj.positionUid = message.positionUid);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.forIisFlag !== undefined && (obj.forIisFlag = message.forIisFlag);
    message.first1minCandleDate !== undefined &&
      (obj.first1minCandleDate = message.first1minCandleDate.toISOString());
    message.first1dayCandleDate !== undefined &&
      (obj.first1dayCandleDate = message.first1dayCandleDate.toISOString());
    message.forQualInvestorFlag !== undefined &&
      (obj.forQualInvestorFlag = message.forQualInvestorFlag);
    message.weekendFlag !== undefined &&
      (obj.weekendFlag = message.weekendFlag);
    message.blockedTcaFlag !== undefined &&
      (obj.blockedTcaFlag = message.blockedTcaFlag);

    return obj;
  }
};

function createBaseGetBrandsRequest() {
  return {};
}

export const GetBrandsRequest = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetBrandsRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};

    return obj;
  }
};

function createBaseGetBrandRequest() {
  return { id: '' };
}

export const GetBrandRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetBrandRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return { id: isSet(object.id) ? String(object.id) : '' };
  },
  toJSON(message) {
    const obj = {};

    message.id !== undefined && (obj.id = message.id);

    return obj;
  }
};

function createBaseGetBrandsResponse() {
  return { brands: [] };
}

export const GetBrandsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.brands) {
      Brand.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetBrandsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.brands.push(Brand.decode(reader, reader.uint32()));

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      brands: Array.isArray(object?.brands)
        ? object.brands.map((e) => Brand.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.brands) {
      obj.brands = message.brands.map((e) => (e ? Brand.toJSON(e) : undefined));
    } else {
      obj.brands = [];
    }

    return obj;
  }
};
export const InstrumentsServiceDefinition = {
  name: 'InstrumentsService',
  fullName: 'tinkoff.public.invest.api.contract.v1.InstrumentsService',
  methods: {
    /** Метод получения расписания торгов торговых площадок. */
    tradingSchedules: {
      name: 'TradingSchedules',
      requestType: TradingSchedulesRequest,
      requestStream: false,
      responseType: TradingSchedulesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения облигации по её идентификатору. */
    bondBy: {
      name: 'BondBy',
      requestType: InstrumentRequest,
      requestStream: false,
      responseType: BondResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка облигаций. */
    bonds: {
      name: 'Bonds',
      requestType: InstrumentsRequest,
      requestStream: false,
      responseType: BondsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения графика выплат купонов по облигации. */
    getBondCoupons: {
      name: 'GetBondCoupons',
      requestType: GetBondCouponsRequest,
      requestStream: false,
      responseType: GetBondCouponsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения валюты по её идентификатору. */
    currencyBy: {
      name: 'CurrencyBy',
      requestType: InstrumentRequest,
      requestStream: false,
      responseType: CurrencyResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка валют. */
    currencies: {
      name: 'Currencies',
      requestType: InstrumentsRequest,
      requestStream: false,
      responseType: CurrenciesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения инвестиционного фонда по его идентификатору. */
    etfBy: {
      name: 'EtfBy',
      requestType: InstrumentRequest,
      requestStream: false,
      responseType: EtfResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка инвестиционных фондов. */
    etfs: {
      name: 'Etfs',
      requestType: InstrumentsRequest,
      requestStream: false,
      responseType: EtfsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения фьючерса по его идентификатору. */
    futureBy: {
      name: 'FutureBy',
      requestType: InstrumentRequest,
      requestStream: false,
      responseType: FutureResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка фьючерсов. */
    futures: {
      name: 'Futures',
      requestType: InstrumentsRequest,
      requestStream: false,
      responseType: FuturesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения опциона по его идентификатору. */
    optionBy: {
      name: 'OptionBy',
      requestType: InstrumentRequest,
      requestStream: false,
      responseType: OptionResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка опционов. */
    options: {
      name: 'Options',
      requestType: InstrumentsRequest,
      requestStream: false,
      responseType: OptionsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения акции по её идентификатору. */
    shareBy: {
      name: 'ShareBy',
      requestType: InstrumentRequest,
      requestStream: false,
      responseType: ShareResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка акций. */
    shares: {
      name: 'Shares',
      requestType: InstrumentsRequest,
      requestStream: false,
      responseType: SharesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения накопленного купонного дохода по облигации. */
    getAccruedInterests: {
      name: 'GetAccruedInterests',
      requestType: GetAccruedInterestsRequest,
      requestStream: false,
      responseType: GetAccruedInterestsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения размера гарантийного обеспечения по фьючерсам. */
    getFuturesMargin: {
      name: 'GetFuturesMargin',
      requestType: GetFuturesMarginRequest,
      requestStream: false,
      responseType: GetFuturesMarginResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения основной информации об инструменте. */
    getInstrumentBy: {
      name: 'GetInstrumentBy',
      requestType: InstrumentRequest,
      requestStream: false,
      responseType: InstrumentResponse,
      responseStream: false,
      options: {}
    },
    /** Метод для получения событий выплаты дивидендов по инструменту. */
    getDividends: {
      name: 'GetDividends',
      requestType: GetDividendsRequest,
      requestStream: false,
      responseType: GetDividendsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения актива по его идентификатору. */
    getAssetBy: {
      name: 'GetAssetBy',
      requestType: AssetRequest,
      requestStream: false,
      responseType: AssetResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка активов. */
    getAssets: {
      name: 'GetAssets',
      requestType: AssetsRequest,
      requestStream: false,
      responseType: AssetsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка избранных инструментов. */
    getFavorites: {
      name: 'GetFavorites',
      requestType: GetFavoritesRequest,
      requestStream: false,
      responseType: GetFavoritesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод редактирования списка избранных инструментов. */
    editFavorites: {
      name: 'EditFavorites',
      requestType: EditFavoritesRequest,
      requestStream: false,
      responseType: EditFavoritesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка стран. */
    getCountries: {
      name: 'GetCountries',
      requestType: GetCountriesRequest,
      requestStream: false,
      responseType: GetCountriesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод поиска инструмента. */
    findInstrument: {
      name: 'FindInstrument',
      requestType: FindInstrumentRequest,
      requestStream: false,
      responseType: FindInstrumentResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения списка брендов. */
    getBrands: {
      name: 'GetBrands',
      requestType: GetBrandsRequest,
      requestStream: false,
      responseType: GetBrandsResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения бренда по его идентификатору. */
    getBrandBy: {
      name: 'GetBrandBy',
      requestType: GetBrandRequest,
      requestStream: false,
      responseType: Brand,
      responseStream: false,
      options: {}
    }
  }
};

function toTimestamp(date) {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;

  return { seconds, nanos };
}

function fromTimestamp(t) {
  let millis = t.seconds * 1_000;

  millis += t.nanos / 1_000_000;

  return new Date(millis);
}

function fromJsonTimestamp(o) {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === 'string') {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function longToNumber(long) {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }

  return long.toNumber();
}

if (protobuf.util.Long !== Long) {
  protobuf.util.Long = Long;
  protobuf.configure();
}

function isSet(value) {
  return value !== null && value !== undefined;
}
