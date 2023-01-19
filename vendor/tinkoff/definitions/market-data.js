import Long from '../../long.js';
import protobuf from '../../protobuf/minimal.js';
import {
  Quotation,
  Ping,
  securityTradingStatusFromJSON,
  securityTradingStatusToJSON
} from './common.js';
import { Timestamp } from './google/protobuf/timestamp.js';

export const protobufPackage = 'tinkoff.public.invest.api.contract.v1';
/** Тип операции со списком подписок. */
export var SubscriptionAction;
(function (SubscriptionAction) {
  /** SUBSCRIPTION_ACTION_UNSPECIFIED - Статус подписки не определён. */
  SubscriptionAction[
    (SubscriptionAction['SUBSCRIPTION_ACTION_UNSPECIFIED'] = 0)
  ] = 'SUBSCRIPTION_ACTION_UNSPECIFIED';
  /** SUBSCRIPTION_ACTION_SUBSCRIBE - Подписаться. */
  SubscriptionAction[
    (SubscriptionAction['SUBSCRIPTION_ACTION_SUBSCRIBE'] = 1)
  ] = 'SUBSCRIPTION_ACTION_SUBSCRIBE';
  /** SUBSCRIPTION_ACTION_UNSUBSCRIBE - Отписаться. */
  SubscriptionAction[
    (SubscriptionAction['SUBSCRIPTION_ACTION_UNSUBSCRIBE'] = 2)
  ] = 'SUBSCRIPTION_ACTION_UNSUBSCRIBE';
  SubscriptionAction[(SubscriptionAction['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(SubscriptionAction || (SubscriptionAction = {}));

export function subscriptionActionFromJSON(object) {
  switch (object) {
    case 0:
    case 'SUBSCRIPTION_ACTION_UNSPECIFIED':
      return SubscriptionAction.SUBSCRIPTION_ACTION_UNSPECIFIED;
    case 1:
    case 'SUBSCRIPTION_ACTION_SUBSCRIBE':
      return SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE;
    case 2:
    case 'SUBSCRIPTION_ACTION_UNSUBSCRIBE':
      return SubscriptionAction.SUBSCRIPTION_ACTION_UNSUBSCRIBE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return SubscriptionAction.UNRECOGNIZED;
  }
}

export function subscriptionActionToJSON(object) {
  switch (object) {
    case SubscriptionAction.SUBSCRIPTION_ACTION_UNSPECIFIED:
      return 'SUBSCRIPTION_ACTION_UNSPECIFIED';
    case SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE:
      return 'SUBSCRIPTION_ACTION_SUBSCRIBE';
    case SubscriptionAction.SUBSCRIPTION_ACTION_UNSUBSCRIBE:
      return 'SUBSCRIPTION_ACTION_UNSUBSCRIBE';
    case SubscriptionAction.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Интервал свечи. */
export var SubscriptionInterval;
(function (SubscriptionInterval) {
  /** SUBSCRIPTION_INTERVAL_UNSPECIFIED - Интервал свечи не определён. */
  SubscriptionInterval[
    (SubscriptionInterval['SUBSCRIPTION_INTERVAL_UNSPECIFIED'] = 0)
  ] = 'SUBSCRIPTION_INTERVAL_UNSPECIFIED';
  /** SUBSCRIPTION_INTERVAL_ONE_MINUTE - Минутные свечи. */
  SubscriptionInterval[
    (SubscriptionInterval['SUBSCRIPTION_INTERVAL_ONE_MINUTE'] = 1)
  ] = 'SUBSCRIPTION_INTERVAL_ONE_MINUTE';
  /** SUBSCRIPTION_INTERVAL_FIVE_MINUTES - Пятиминутные свечи. */
  SubscriptionInterval[
    (SubscriptionInterval['SUBSCRIPTION_INTERVAL_FIVE_MINUTES'] = 2)
  ] = 'SUBSCRIPTION_INTERVAL_FIVE_MINUTES';
  SubscriptionInterval[(SubscriptionInterval['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(SubscriptionInterval || (SubscriptionInterval = {}));

export function subscriptionIntervalFromJSON(object) {
  switch (object) {
    case 0:
    case 'SUBSCRIPTION_INTERVAL_UNSPECIFIED':
      return SubscriptionInterval.SUBSCRIPTION_INTERVAL_UNSPECIFIED;
    case 1:
    case 'SUBSCRIPTION_INTERVAL_ONE_MINUTE':
      return SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE;
    case 2:
    case 'SUBSCRIPTION_INTERVAL_FIVE_MINUTES':
      return SubscriptionInterval.SUBSCRIPTION_INTERVAL_FIVE_MINUTES;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return SubscriptionInterval.UNRECOGNIZED;
  }
}

export function subscriptionIntervalToJSON(object) {
  switch (object) {
    case SubscriptionInterval.SUBSCRIPTION_INTERVAL_UNSPECIFIED:
      return 'SUBSCRIPTION_INTERVAL_UNSPECIFIED';
    case SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE:
      return 'SUBSCRIPTION_INTERVAL_ONE_MINUTE';
    case SubscriptionInterval.SUBSCRIPTION_INTERVAL_FIVE_MINUTES:
      return 'SUBSCRIPTION_INTERVAL_FIVE_MINUTES';
    case SubscriptionInterval.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Результат подписки. */
export var SubscriptionStatus;
(function (SubscriptionStatus) {
  /** SUBSCRIPTION_STATUS_UNSPECIFIED - Статус подписки не определён. */
  SubscriptionStatus[
    (SubscriptionStatus['SUBSCRIPTION_STATUS_UNSPECIFIED'] = 0)
  ] = 'SUBSCRIPTION_STATUS_UNSPECIFIED';
  /** SUBSCRIPTION_STATUS_SUCCESS - Успешно. */
  SubscriptionStatus[(SubscriptionStatus['SUBSCRIPTION_STATUS_SUCCESS'] = 1)] =
    'SUBSCRIPTION_STATUS_SUCCESS';
  /** SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND - Инструмент не найден. */
  SubscriptionStatus[
    (SubscriptionStatus['SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND'] = 2)
  ] = 'SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND';
  /** SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID - Некорректный статус подписки, список возможных значений: [SubscriptionAction](https://tinkoff.github.io/investAPI/marketdata#subscriptionaction). */
  SubscriptionStatus[
    (SubscriptionStatus[
      'SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID'
    ] = 3)
  ] = 'SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID';
  /** SUBSCRIPTION_STATUS_DEPTH_IS_INVALID - Некорректная глубина стакана, доступные значения: 1, 10, 20, 30, 40, 50. */
  SubscriptionStatus[
    (SubscriptionStatus['SUBSCRIPTION_STATUS_DEPTH_IS_INVALID'] = 4)
  ] = 'SUBSCRIPTION_STATUS_DEPTH_IS_INVALID';
  /** SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID - Некорректный интервал свечей, список возможных значений: [SubscriptionInterval](https://tinkoff.github.io/investAPI/marketdata#subscriptioninterval). */
  SubscriptionStatus[
    (SubscriptionStatus['SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID'] = 5)
  ] = 'SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID';
  /** SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED - Превышен лимит на общее количество подписок в рамках стрима, подробнее: [Лимитная политика](https://tinkoff.github.io/investAPI/limits/). */
  SubscriptionStatus[
    (SubscriptionStatus['SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED'] = 6)
  ] = 'SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED';
  /** SUBSCRIPTION_STATUS_INTERNAL_ERROR - Внутренняя ошибка сервиса. */
  SubscriptionStatus[
    (SubscriptionStatus['SUBSCRIPTION_STATUS_INTERNAL_ERROR'] = 7)
  ] = 'SUBSCRIPTION_STATUS_INTERNAL_ERROR';
  /** SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS - Превышен лимит на количество запросов на подписки в течение установленного отрезка времени */
  SubscriptionStatus[
    (SubscriptionStatus['SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS'] = 8)
  ] = 'SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS';
  SubscriptionStatus[(SubscriptionStatus['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(SubscriptionStatus || (SubscriptionStatus = {}));

export function subscriptionStatusFromJSON(object) {
  switch (object) {
    case 0:
    case 'SUBSCRIPTION_STATUS_UNSPECIFIED':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_UNSPECIFIED;
    case 1:
    case 'SUBSCRIPTION_STATUS_SUCCESS':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_SUCCESS;
    case 2:
    case 'SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND;
    case 3:
    case 'SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID;
    case 4:
    case 'SUBSCRIPTION_STATUS_DEPTH_IS_INVALID':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_DEPTH_IS_INVALID;
    case 5:
    case 'SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID;
    case 6:
    case 'SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED;
    case 7:
    case 'SUBSCRIPTION_STATUS_INTERNAL_ERROR':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_INTERNAL_ERROR;
    case 8:
    case 'SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS':
      return SubscriptionStatus.SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return SubscriptionStatus.UNRECOGNIZED;
  }
}

export function subscriptionStatusToJSON(object) {
  switch (object) {
    case SubscriptionStatus.SUBSCRIPTION_STATUS_UNSPECIFIED:
      return 'SUBSCRIPTION_STATUS_UNSPECIFIED';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_SUCCESS:
      return 'SUBSCRIPTION_STATUS_SUCCESS';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND:
      return 'SUBSCRIPTION_STATUS_INSTRUMENT_NOT_FOUND';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID:
      return 'SUBSCRIPTION_STATUS_SUBSCRIPTION_ACTION_IS_INVALID';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_DEPTH_IS_INVALID:
      return 'SUBSCRIPTION_STATUS_DEPTH_IS_INVALID';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID:
      return 'SUBSCRIPTION_STATUS_INTERVAL_IS_INVALID';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED:
      return 'SUBSCRIPTION_STATUS_LIMIT_IS_EXCEEDED';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_INTERNAL_ERROR:
      return 'SUBSCRIPTION_STATUS_INTERNAL_ERROR';
    case SubscriptionStatus.SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS:
      return 'SUBSCRIPTION_STATUS_TOO_MANY_REQUESTS';
    case SubscriptionStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Направление сделки. */
export var TradeDirection;
(function (TradeDirection) {
  /** TRADE_DIRECTION_UNSPECIFIED - Направление сделки не определено. */
  TradeDirection[(TradeDirection['TRADE_DIRECTION_UNSPECIFIED'] = 0)] =
    'TRADE_DIRECTION_UNSPECIFIED';
  /** TRADE_DIRECTION_BUY - Покупка. */
  TradeDirection[(TradeDirection['TRADE_DIRECTION_BUY'] = 1)] =
    'TRADE_DIRECTION_BUY';
  /** TRADE_DIRECTION_SELL - Продажа. */
  TradeDirection[(TradeDirection['TRADE_DIRECTION_SELL'] = 2)] =
    'TRADE_DIRECTION_SELL';
  TradeDirection[(TradeDirection['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(TradeDirection || (TradeDirection = {}));

export function tradeDirectionFromJSON(object) {
  switch (object) {
    case 0:
    case 'TRADE_DIRECTION_UNSPECIFIED':
      return TradeDirection.TRADE_DIRECTION_UNSPECIFIED;
    case 1:
    case 'TRADE_DIRECTION_BUY':
      return TradeDirection.TRADE_DIRECTION_BUY;
    case 2:
    case 'TRADE_DIRECTION_SELL':
      return TradeDirection.TRADE_DIRECTION_SELL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return TradeDirection.UNRECOGNIZED;
  }
}

export function tradeDirectionToJSON(object) {
  switch (object) {
    case TradeDirection.TRADE_DIRECTION_UNSPECIFIED:
      return 'TRADE_DIRECTION_UNSPECIFIED';
    case TradeDirection.TRADE_DIRECTION_BUY:
      return 'TRADE_DIRECTION_BUY';
    case TradeDirection.TRADE_DIRECTION_SELL:
      return 'TRADE_DIRECTION_SELL';
    case TradeDirection.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Интервал свечей. */
export var CandleInterval;
(function (CandleInterval) {
  /** CANDLE_INTERVAL_UNSPECIFIED - Интервал не определён. */
  CandleInterval[(CandleInterval['CANDLE_INTERVAL_UNSPECIFIED'] = 0)] =
    'CANDLE_INTERVAL_UNSPECIFIED';
  /** CANDLE_INTERVAL_1_MIN - 1 минута. */
  CandleInterval[(CandleInterval['CANDLE_INTERVAL_1_MIN'] = 1)] =
    'CANDLE_INTERVAL_1_MIN';
  /** CANDLE_INTERVAL_5_MIN - 5 минут. */
  CandleInterval[(CandleInterval['CANDLE_INTERVAL_5_MIN'] = 2)] =
    'CANDLE_INTERVAL_5_MIN';
  /** CANDLE_INTERVAL_15_MIN - 15 минут. */
  CandleInterval[(CandleInterval['CANDLE_INTERVAL_15_MIN'] = 3)] =
    'CANDLE_INTERVAL_15_MIN';
  /** CANDLE_INTERVAL_HOUR - 1 час. */
  CandleInterval[(CandleInterval['CANDLE_INTERVAL_HOUR'] = 4)] =
    'CANDLE_INTERVAL_HOUR';
  /** CANDLE_INTERVAL_DAY - 1 день. */
  CandleInterval[(CandleInterval['CANDLE_INTERVAL_DAY'] = 5)] =
    'CANDLE_INTERVAL_DAY';
  CandleInterval[(CandleInterval['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(CandleInterval || (CandleInterval = {}));

export function candleIntervalFromJSON(object) {
  switch (object) {
    case 0:
    case 'CANDLE_INTERVAL_UNSPECIFIED':
      return CandleInterval.CANDLE_INTERVAL_UNSPECIFIED;
    case 1:
    case 'CANDLE_INTERVAL_1_MIN':
      return CandleInterval.CANDLE_INTERVAL_1_MIN;
    case 2:
    case 'CANDLE_INTERVAL_5_MIN':
      return CandleInterval.CANDLE_INTERVAL_5_MIN;
    case 3:
    case 'CANDLE_INTERVAL_15_MIN':
      return CandleInterval.CANDLE_INTERVAL_15_MIN;
    case 4:
    case 'CANDLE_INTERVAL_HOUR':
      return CandleInterval.CANDLE_INTERVAL_HOUR;
    case 5:
    case 'CANDLE_INTERVAL_DAY':
      return CandleInterval.CANDLE_INTERVAL_DAY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return CandleInterval.UNRECOGNIZED;
  }
}

export function candleIntervalToJSON(object) {
  switch (object) {
    case CandleInterval.CANDLE_INTERVAL_UNSPECIFIED:
      return 'CANDLE_INTERVAL_UNSPECIFIED';
    case CandleInterval.CANDLE_INTERVAL_1_MIN:
      return 'CANDLE_INTERVAL_1_MIN';
    case CandleInterval.CANDLE_INTERVAL_5_MIN:
      return 'CANDLE_INTERVAL_5_MIN';
    case CandleInterval.CANDLE_INTERVAL_15_MIN:
      return 'CANDLE_INTERVAL_15_MIN';
    case CandleInterval.CANDLE_INTERVAL_HOUR:
      return 'CANDLE_INTERVAL_HOUR';
    case CandleInterval.CANDLE_INTERVAL_DAY:
      return 'CANDLE_INTERVAL_DAY';
    case CandleInterval.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

function createBaseMarketDataRequest() {
  return {
    subscribeCandlesRequest: undefined,
    subscribeOrderBookRequest: undefined,
    subscribeTradesRequest: undefined,
    subscribeInfoRequest: undefined,
    subscribeLastPriceRequest: undefined,
    getMySubscriptions: undefined
  };
}

export const MarketDataRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscribeCandlesRequest !== undefined) {
      SubscribeCandlesRequest.encode(
        message.subscribeCandlesRequest,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.subscribeOrderBookRequest !== undefined) {
      SubscribeOrderBookRequest.encode(
        message.subscribeOrderBookRequest,
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.subscribeTradesRequest !== undefined) {
      SubscribeTradesRequest.encode(
        message.subscribeTradesRequest,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.subscribeInfoRequest !== undefined) {
      SubscribeInfoRequest.encode(
        message.subscribeInfoRequest,
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.subscribeLastPriceRequest !== undefined) {
      SubscribeLastPriceRequest.encode(
        message.subscribeLastPriceRequest,
        writer.uint32(42).fork()
      ).ldelim();
    }

    if (message.getMySubscriptions !== undefined) {
      GetMySubscriptions.encode(
        message.getMySubscriptions,
        writer.uint32(50).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMarketDataRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscribeCandlesRequest = SubscribeCandlesRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 2:
          message.subscribeOrderBookRequest = SubscribeOrderBookRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 3:
          message.subscribeTradesRequest = SubscribeTradesRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 4:
          message.subscribeInfoRequest = SubscribeInfoRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 5:
          message.subscribeLastPriceRequest = SubscribeLastPriceRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 6:
          message.getMySubscriptions = GetMySubscriptions.decode(
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
      subscribeCandlesRequest: isSet(object.subscribeCandlesRequest)
        ? SubscribeCandlesRequest.fromJSON(object.subscribeCandlesRequest)
        : undefined,
      subscribeOrderBookRequest: isSet(object.subscribeOrderBookRequest)
        ? SubscribeOrderBookRequest.fromJSON(object.subscribeOrderBookRequest)
        : undefined,
      subscribeTradesRequest: isSet(object.subscribeTradesRequest)
        ? SubscribeTradesRequest.fromJSON(object.subscribeTradesRequest)
        : undefined,
      subscribeInfoRequest: isSet(object.subscribeInfoRequest)
        ? SubscribeInfoRequest.fromJSON(object.subscribeInfoRequest)
        : undefined,
      subscribeLastPriceRequest: isSet(object.subscribeLastPriceRequest)
        ? SubscribeLastPriceRequest.fromJSON(object.subscribeLastPriceRequest)
        : undefined,
      getMySubscriptions: isSet(object.getMySubscriptions)
        ? GetMySubscriptions.fromJSON(object.getMySubscriptions)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscribeCandlesRequest !== undefined &&
      (obj.subscribeCandlesRequest = message.subscribeCandlesRequest
        ? SubscribeCandlesRequest.toJSON(message.subscribeCandlesRequest)
        : undefined);
    message.subscribeOrderBookRequest !== undefined &&
      (obj.subscribeOrderBookRequest = message.subscribeOrderBookRequest
        ? SubscribeOrderBookRequest.toJSON(message.subscribeOrderBookRequest)
        : undefined);
    message.subscribeTradesRequest !== undefined &&
      (obj.subscribeTradesRequest = message.subscribeTradesRequest
        ? SubscribeTradesRequest.toJSON(message.subscribeTradesRequest)
        : undefined);
    message.subscribeInfoRequest !== undefined &&
      (obj.subscribeInfoRequest = message.subscribeInfoRequest
        ? SubscribeInfoRequest.toJSON(message.subscribeInfoRequest)
        : undefined);
    message.subscribeLastPriceRequest !== undefined &&
      (obj.subscribeLastPriceRequest = message.subscribeLastPriceRequest
        ? SubscribeLastPriceRequest.toJSON(message.subscribeLastPriceRequest)
        : undefined);
    message.getMySubscriptions !== undefined &&
      (obj.getMySubscriptions = message.getMySubscriptions
        ? GetMySubscriptions.toJSON(message.getMySubscriptions)
        : undefined);

    return obj;
  }
};

function createBaseMarketDataServerSideStreamRequest() {
  return {
    subscribeCandlesRequest: undefined,
    subscribeOrderBookRequest: undefined,
    subscribeTradesRequest: undefined,
    subscribeInfoRequest: undefined,
    subscribeLastPriceRequest: undefined
  };
}

export const MarketDataServerSideStreamRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscribeCandlesRequest !== undefined) {
      SubscribeCandlesRequest.encode(
        message.subscribeCandlesRequest,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.subscribeOrderBookRequest !== undefined) {
      SubscribeOrderBookRequest.encode(
        message.subscribeOrderBookRequest,
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.subscribeTradesRequest !== undefined) {
      SubscribeTradesRequest.encode(
        message.subscribeTradesRequest,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.subscribeInfoRequest !== undefined) {
      SubscribeInfoRequest.encode(
        message.subscribeInfoRequest,
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.subscribeLastPriceRequest !== undefined) {
      SubscribeLastPriceRequest.encode(
        message.subscribeLastPriceRequest,
        writer.uint32(42).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMarketDataServerSideStreamRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscribeCandlesRequest = SubscribeCandlesRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 2:
          message.subscribeOrderBookRequest = SubscribeOrderBookRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 3:
          message.subscribeTradesRequest = SubscribeTradesRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 4:
          message.subscribeInfoRequest = SubscribeInfoRequest.decode(
            reader,
            reader.uint32()
          );

          break;
        case 5:
          message.subscribeLastPriceRequest = SubscribeLastPriceRequest.decode(
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
      subscribeCandlesRequest: isSet(object.subscribeCandlesRequest)
        ? SubscribeCandlesRequest.fromJSON(object.subscribeCandlesRequest)
        : undefined,
      subscribeOrderBookRequest: isSet(object.subscribeOrderBookRequest)
        ? SubscribeOrderBookRequest.fromJSON(object.subscribeOrderBookRequest)
        : undefined,
      subscribeTradesRequest: isSet(object.subscribeTradesRequest)
        ? SubscribeTradesRequest.fromJSON(object.subscribeTradesRequest)
        : undefined,
      subscribeInfoRequest: isSet(object.subscribeInfoRequest)
        ? SubscribeInfoRequest.fromJSON(object.subscribeInfoRequest)
        : undefined,
      subscribeLastPriceRequest: isSet(object.subscribeLastPriceRequest)
        ? SubscribeLastPriceRequest.fromJSON(object.subscribeLastPriceRequest)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscribeCandlesRequest !== undefined &&
      (obj.subscribeCandlesRequest = message.subscribeCandlesRequest
        ? SubscribeCandlesRequest.toJSON(message.subscribeCandlesRequest)
        : undefined);
    message.subscribeOrderBookRequest !== undefined &&
      (obj.subscribeOrderBookRequest = message.subscribeOrderBookRequest
        ? SubscribeOrderBookRequest.toJSON(message.subscribeOrderBookRequest)
        : undefined);
    message.subscribeTradesRequest !== undefined &&
      (obj.subscribeTradesRequest = message.subscribeTradesRequest
        ? SubscribeTradesRequest.toJSON(message.subscribeTradesRequest)
        : undefined);
    message.subscribeInfoRequest !== undefined &&
      (obj.subscribeInfoRequest = message.subscribeInfoRequest
        ? SubscribeInfoRequest.toJSON(message.subscribeInfoRequest)
        : undefined);
    message.subscribeLastPriceRequest !== undefined &&
      (obj.subscribeLastPriceRequest = message.subscribeLastPriceRequest
        ? SubscribeLastPriceRequest.toJSON(message.subscribeLastPriceRequest)
        : undefined);

    return obj;
  }
};

function createBaseMarketDataResponse() {
  return {
    subscribeCandlesResponse: undefined,
    subscribeOrderBookResponse: undefined,
    subscribeTradesResponse: undefined,
    subscribeInfoResponse: undefined,
    candle: undefined,
    trade: undefined,
    orderbook: undefined,
    tradingStatus: undefined,
    ping: undefined,
    subscribeLastPriceResponse: undefined,
    lastPrice: undefined
  };
}

export const MarketDataResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscribeCandlesResponse !== undefined) {
      SubscribeCandlesResponse.encode(
        message.subscribeCandlesResponse,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.subscribeOrderBookResponse !== undefined) {
      SubscribeOrderBookResponse.encode(
        message.subscribeOrderBookResponse,
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.subscribeTradesResponse !== undefined) {
      SubscribeTradesResponse.encode(
        message.subscribeTradesResponse,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.subscribeInfoResponse !== undefined) {
      SubscribeInfoResponse.encode(
        message.subscribeInfoResponse,
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.candle !== undefined) {
      Candle.encode(message.candle, writer.uint32(42).fork()).ldelim();
    }

    if (message.trade !== undefined) {
      Trade.encode(message.trade, writer.uint32(50).fork()).ldelim();
    }

    if (message.orderbook !== undefined) {
      OrderBook.encode(message.orderbook, writer.uint32(58).fork()).ldelim();
    }

    if (message.tradingStatus !== undefined) {
      TradingStatus.encode(
        message.tradingStatus,
        writer.uint32(66).fork()
      ).ldelim();
    }

    if (message.ping !== undefined) {
      Ping.encode(message.ping, writer.uint32(74).fork()).ldelim();
    }

    if (message.subscribeLastPriceResponse !== undefined) {
      SubscribeLastPriceResponse.encode(
        message.subscribeLastPriceResponse,
        writer.uint32(82).fork()
      ).ldelim();
    }

    if (message.lastPrice !== undefined) {
      LastPrice.encode(message.lastPrice, writer.uint32(90).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMarketDataResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscribeCandlesResponse = SubscribeCandlesResponse.decode(
            reader,
            reader.uint32()
          );

          break;
        case 2:
          message.subscribeOrderBookResponse =
            SubscribeOrderBookResponse.decode(reader, reader.uint32());

          break;
        case 3:
          message.subscribeTradesResponse = SubscribeTradesResponse.decode(
            reader,
            reader.uint32()
          );

          break;
        case 4:
          message.subscribeInfoResponse = SubscribeInfoResponse.decode(
            reader,
            reader.uint32()
          );

          break;
        case 5:
          message.candle = Candle.decode(reader, reader.uint32());

          break;
        case 6:
          message.trade = Trade.decode(reader, reader.uint32());

          break;
        case 7:
          message.orderbook = OrderBook.decode(reader, reader.uint32());

          break;
        case 8:
          message.tradingStatus = TradingStatus.decode(reader, reader.uint32());

          break;
        case 9:
          message.ping = Ping.decode(reader, reader.uint32());

          break;
        case 10:
          message.subscribeLastPriceResponse =
            SubscribeLastPriceResponse.decode(reader, reader.uint32());

          break;
        case 11:
          message.lastPrice = LastPrice.decode(reader, reader.uint32());

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
      subscribeCandlesResponse: isSet(object.subscribeCandlesResponse)
        ? SubscribeCandlesResponse.fromJSON(object.subscribeCandlesResponse)
        : undefined,
      subscribeOrderBookResponse: isSet(object.subscribeOrderBookResponse)
        ? SubscribeOrderBookResponse.fromJSON(object.subscribeOrderBookResponse)
        : undefined,
      subscribeTradesResponse: isSet(object.subscribeTradesResponse)
        ? SubscribeTradesResponse.fromJSON(object.subscribeTradesResponse)
        : undefined,
      subscribeInfoResponse: isSet(object.subscribeInfoResponse)
        ? SubscribeInfoResponse.fromJSON(object.subscribeInfoResponse)
        : undefined,
      candle: isSet(object.candle) ? Candle.fromJSON(object.candle) : undefined,
      trade: isSet(object.trade) ? Trade.fromJSON(object.trade) : undefined,
      orderbook: isSet(object.orderbook)
        ? OrderBook.fromJSON(object.orderbook)
        : undefined,
      tradingStatus: isSet(object.tradingStatus)
        ? TradingStatus.fromJSON(object.tradingStatus)
        : undefined,
      ping: isSet(object.ping) ? Ping.fromJSON(object.ping) : undefined,
      subscribeLastPriceResponse: isSet(object.subscribeLastPriceResponse)
        ? SubscribeLastPriceResponse.fromJSON(object.subscribeLastPriceResponse)
        : undefined,
      lastPrice: isSet(object.lastPrice)
        ? LastPrice.fromJSON(object.lastPrice)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscribeCandlesResponse !== undefined &&
      (obj.subscribeCandlesResponse = message.subscribeCandlesResponse
        ? SubscribeCandlesResponse.toJSON(message.subscribeCandlesResponse)
        : undefined);
    message.subscribeOrderBookResponse !== undefined &&
      (obj.subscribeOrderBookResponse = message.subscribeOrderBookResponse
        ? SubscribeOrderBookResponse.toJSON(message.subscribeOrderBookResponse)
        : undefined);
    message.subscribeTradesResponse !== undefined &&
      (obj.subscribeTradesResponse = message.subscribeTradesResponse
        ? SubscribeTradesResponse.toJSON(message.subscribeTradesResponse)
        : undefined);
    message.subscribeInfoResponse !== undefined &&
      (obj.subscribeInfoResponse = message.subscribeInfoResponse
        ? SubscribeInfoResponse.toJSON(message.subscribeInfoResponse)
        : undefined);
    message.candle !== undefined &&
      (obj.candle = message.candle ? Candle.toJSON(message.candle) : undefined);
    message.trade !== undefined &&
      (obj.trade = message.trade ? Trade.toJSON(message.trade) : undefined);
    message.orderbook !== undefined &&
      (obj.orderbook = message.orderbook
        ? OrderBook.toJSON(message.orderbook)
        : undefined);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = message.tradingStatus
        ? TradingStatus.toJSON(message.tradingStatus)
        : undefined);
    message.ping !== undefined &&
      (obj.ping = message.ping ? Ping.toJSON(message.ping) : undefined);
    message.subscribeLastPriceResponse !== undefined &&
      (obj.subscribeLastPriceResponse = message.subscribeLastPriceResponse
        ? SubscribeLastPriceResponse.toJSON(message.subscribeLastPriceResponse)
        : undefined);
    message.lastPrice !== undefined &&
      (obj.lastPrice = message.lastPrice
        ? LastPrice.toJSON(message.lastPrice)
        : undefined);

    return obj;
  }
};

function createBaseSubscribeCandlesRequest() {
  return { subscriptionAction: 0, instruments: [], waitingClose: false };
}

export const SubscribeCandlesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscriptionAction !== 0) {
      writer.uint32(8).int32(message.subscriptionAction);
    }

    for (const v of message.instruments) {
      CandleInstrument.encode(v, writer.uint32(18).fork()).ldelim();
    }

    if (message.waitingClose === true) {
      writer.uint32(24).bool(message.waitingClose);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeCandlesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscriptionAction = reader.int32();

          break;
        case 2:
          message.instruments.push(
            CandleInstrument.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.waitingClose = reader.bool();

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
      subscriptionAction: isSet(object.subscriptionAction)
        ? subscriptionActionFromJSON(object.subscriptionAction)
        : 0,
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => CandleInstrument.fromJSON(e))
        : [],
      waitingClose: isSet(object.waitingClose)
        ? Boolean(object.waitingClose)
        : false
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscriptionAction !== undefined &&
      (obj.subscriptionAction = subscriptionActionToJSON(
        message.subscriptionAction
      ));

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? CandleInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    message.waitingClose !== undefined &&
      (obj.waitingClose = message.waitingClose);

    return obj;
  }
};

function createBaseCandleInstrument() {
  return { interval: 0, instrumentId: '' };
}

export const CandleInstrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.interval !== 0) {
      writer.uint32(16).int32(message.interval);
    }

    if (message.instrumentId !== '') {
      writer.uint32(26).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCandleInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.interval = reader.int32();

          break;
        case 3:
          message.instrumentId = reader.string();

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
      interval: isSet(object.interval)
        ? subscriptionIntervalFromJSON(object.interval)
        : 0,
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.interval !== undefined &&
      (obj.interval = subscriptionIntervalToJSON(message.interval));
    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseSubscribeCandlesResponse() {
  return { trackingId: '', candlesSubscriptions: [] };
}

export const SubscribeCandlesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.trackingId !== '') {
      writer.uint32(10).string(message.trackingId);
    }

    for (const v of message.candlesSubscriptions) {
      CandleSubscription.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeCandlesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.trackingId = reader.string();

          break;
        case 2:
          message.candlesSubscriptions.push(
            CandleSubscription.decode(reader, reader.uint32())
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
      trackingId: isSet(object.trackingId) ? String(object.trackingId) : '',
      candlesSubscriptions: Array.isArray(object?.candlesSubscriptions)
        ? object.candlesSubscriptions.map((e) => CandleSubscription.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.trackingId !== undefined && (obj.trackingId = message.trackingId);

    if (message.candlesSubscriptions) {
      obj.candlesSubscriptions = message.candlesSubscriptions.map((e) =>
        e ? CandleSubscription.toJSON(e) : undefined
      );
    } else {
      obj.candlesSubscriptions = [];
    }

    return obj;
  }
};

function createBaseCandleSubscription() {
  return { figi: '', interval: 0, subscriptionStatus: 0, instrumentUid: '' };
}

export const CandleSubscription = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.interval !== 0) {
      writer.uint32(16).int32(message.interval);
    }

    if (message.subscriptionStatus !== 0) {
      writer.uint32(24).int32(message.subscriptionStatus);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(34).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCandleSubscription();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.interval = reader.int32();

          break;
        case 3:
          message.subscriptionStatus = reader.int32();

          break;
        case 4:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      interval: isSet(object.interval)
        ? subscriptionIntervalFromJSON(object.interval)
        : 0,
      subscriptionStatus: isSet(object.subscriptionStatus)
        ? subscriptionStatusFromJSON(object.subscriptionStatus)
        : 0,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.interval !== undefined &&
      (obj.interval = subscriptionIntervalToJSON(message.interval));
    message.subscriptionStatus !== undefined &&
      (obj.subscriptionStatus = subscriptionStatusToJSON(
        message.subscriptionStatus
      ));
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseSubscribeOrderBookRequest() {
  return { subscriptionAction: 0, instruments: [] };
}

export const SubscribeOrderBookRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscriptionAction !== 0) {
      writer.uint32(8).int32(message.subscriptionAction);
    }

    for (const v of message.instruments) {
      OrderBookInstrument.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeOrderBookRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscriptionAction = reader.int32();

          break;
        case 2:
          message.instruments.push(
            OrderBookInstrument.decode(reader, reader.uint32())
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
      subscriptionAction: isSet(object.subscriptionAction)
        ? subscriptionActionFromJSON(object.subscriptionAction)
        : 0,
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => OrderBookInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscriptionAction !== undefined &&
      (obj.subscriptionAction = subscriptionActionToJSON(
        message.subscriptionAction
      ));

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? OrderBookInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseOrderBookInstrument() {
  return { depth: 0, instrumentId: '' };
}

export const OrderBookInstrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.depth !== 0) {
      writer.uint32(16).int32(message.depth);
    }

    if (message.instrumentId !== '') {
      writer.uint32(26).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBookInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.depth = reader.int32();

          break;
        case 3:
          message.instrumentId = reader.string();

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
      depth: isSet(object.depth) ? Number(object.depth) : 0,
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.depth !== undefined && (obj.depth = Math.round(message.depth));
    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseSubscribeOrderBookResponse() {
  return { trackingId: '', orderBookSubscriptions: [] };
}

export const SubscribeOrderBookResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.trackingId !== '') {
      writer.uint32(10).string(message.trackingId);
    }

    for (const v of message.orderBookSubscriptions) {
      OrderBookSubscription.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeOrderBookResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.trackingId = reader.string();

          break;
        case 2:
          message.orderBookSubscriptions.push(
            OrderBookSubscription.decode(reader, reader.uint32())
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
      trackingId: isSet(object.trackingId) ? String(object.trackingId) : '',
      orderBookSubscriptions: Array.isArray(object?.orderBookSubscriptions)
        ? object.orderBookSubscriptions.map((e) =>
            OrderBookSubscription.fromJSON(e)
          )
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.trackingId !== undefined && (obj.trackingId = message.trackingId);

    if (message.orderBookSubscriptions) {
      obj.orderBookSubscriptions = message.orderBookSubscriptions.map((e) =>
        e ? OrderBookSubscription.toJSON(e) : undefined
      );
    } else {
      obj.orderBookSubscriptions = [];
    }

    return obj;
  }
};

function createBaseOrderBookSubscription() {
  return { figi: '', depth: 0, subscriptionStatus: 0, instrumentUid: '' };
}

export const OrderBookSubscription = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.depth !== 0) {
      writer.uint32(16).int32(message.depth);
    }

    if (message.subscriptionStatus !== 0) {
      writer.uint32(24).int32(message.subscriptionStatus);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(34).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBookSubscription();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.depth = reader.int32();

          break;
        case 3:
          message.subscriptionStatus = reader.int32();

          break;
        case 4:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      depth: isSet(object.depth) ? Number(object.depth) : 0,
      subscriptionStatus: isSet(object.subscriptionStatus)
        ? subscriptionStatusFromJSON(object.subscriptionStatus)
        : 0,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.depth !== undefined && (obj.depth = Math.round(message.depth));
    message.subscriptionStatus !== undefined &&
      (obj.subscriptionStatus = subscriptionStatusToJSON(
        message.subscriptionStatus
      ));
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseSubscribeTradesRequest() {
  return { subscriptionAction: 0, instruments: [] };
}

export const SubscribeTradesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscriptionAction !== 0) {
      writer.uint32(8).int32(message.subscriptionAction);
    }

    for (const v of message.instruments) {
      TradeInstrument.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeTradesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscriptionAction = reader.int32();

          break;
        case 2:
          message.instruments.push(
            TradeInstrument.decode(reader, reader.uint32())
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
      subscriptionAction: isSet(object.subscriptionAction)
        ? subscriptionActionFromJSON(object.subscriptionAction)
        : 0,
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => TradeInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscriptionAction !== undefined &&
      (obj.subscriptionAction = subscriptionActionToJSON(
        message.subscriptionAction
      ));

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? TradeInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseTradeInstrument() {
  return { instrumentId: '' };
}

export const TradeInstrument = {
  encode(message, writer = protobuf.Writer.create()) {

    if (message.instrumentId !== '') {
      writer.uint32(18).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradeInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.instrumentId = reader.string();

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
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseSubscribeTradesResponse() {
  return { trackingId: '', tradeSubscriptions: [] };
}

export const SubscribeTradesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.trackingId !== '') {
      writer.uint32(10).string(message.trackingId);
    }

    for (const v of message.tradeSubscriptions) {
      TradeSubscription.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeTradesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.trackingId = reader.string();

          break;
        case 2:
          message.tradeSubscriptions.push(
            TradeSubscription.decode(reader, reader.uint32())
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
      trackingId: isSet(object.trackingId) ? String(object.trackingId) : '',
      tradeSubscriptions: Array.isArray(object?.tradeSubscriptions)
        ? object.tradeSubscriptions.map((e) => TradeSubscription.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.trackingId !== undefined && (obj.trackingId = message.trackingId);

    if (message.tradeSubscriptions) {
      obj.tradeSubscriptions = message.tradeSubscriptions.map((e) =>
        e ? TradeSubscription.toJSON(e) : undefined
      );
    } else {
      obj.tradeSubscriptions = [];
    }

    return obj;
  }
};

function createBaseTradeSubscription() {
  return { figi: '', subscriptionStatus: 0, instrumentUid: '' };
}

export const TradeSubscription = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.subscriptionStatus !== 0) {
      writer.uint32(16).int32(message.subscriptionStatus);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(26).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradeSubscription();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.subscriptionStatus = reader.int32();

          break;
        case 3:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      subscriptionStatus: isSet(object.subscriptionStatus)
        ? subscriptionStatusFromJSON(object.subscriptionStatus)
        : 0,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.subscriptionStatus !== undefined &&
      (obj.subscriptionStatus = subscriptionStatusToJSON(
        message.subscriptionStatus
      ));
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseSubscribeInfoRequest() {
  return { subscriptionAction: 0, instruments: [] };
}

export const SubscribeInfoRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscriptionAction !== 0) {
      writer.uint32(8).int32(message.subscriptionAction);
    }

    for (const v of message.instruments) {
      InfoInstrument.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeInfoRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscriptionAction = reader.int32();

          break;
        case 2:
          message.instruments.push(
            InfoInstrument.decode(reader, reader.uint32())
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
      subscriptionAction: isSet(object.subscriptionAction)
        ? subscriptionActionFromJSON(object.subscriptionAction)
        : 0,
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => InfoInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscriptionAction !== undefined &&
      (obj.subscriptionAction = subscriptionActionToJSON(
        message.subscriptionAction
      ));

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? InfoInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseInfoInstrument() {
  return { instrumentId: '' };
}

export const InfoInstrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrumentId !== '') {
      writer.uint32(18).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInfoInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.instrumentId = reader.string();

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
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseSubscribeInfoResponse() {
  return { trackingId: '', infoSubscriptions: [] };
}

export const SubscribeInfoResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.trackingId !== '') {
      writer.uint32(10).string(message.trackingId);
    }

    for (const v of message.infoSubscriptions) {
      InfoSubscription.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeInfoResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.trackingId = reader.string();

          break;
        case 2:
          message.infoSubscriptions.push(
            InfoSubscription.decode(reader, reader.uint32())
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
      trackingId: isSet(object.trackingId) ? String(object.trackingId) : '',
      infoSubscriptions: Array.isArray(object?.infoSubscriptions)
        ? object.infoSubscriptions.map((e) => InfoSubscription.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.trackingId !== undefined && (obj.trackingId = message.trackingId);

    if (message.infoSubscriptions) {
      obj.infoSubscriptions = message.infoSubscriptions.map((e) =>
        e ? InfoSubscription.toJSON(e) : undefined
      );
    } else {
      obj.infoSubscriptions = [];
    }

    return obj;
  }
};

function createBaseInfoSubscription() {
  return { figi: '', subscriptionStatus: 0, instrumentUid: '' };
}

export const InfoSubscription = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.subscriptionStatus !== 0) {
      writer.uint32(16).int32(message.subscriptionStatus);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(26).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInfoSubscription();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.subscriptionStatus = reader.int32();

          break;
        case 3:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      subscriptionStatus: isSet(object.subscriptionStatus)
        ? subscriptionStatusFromJSON(object.subscriptionStatus)
        : 0,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.subscriptionStatus !== undefined &&
      (obj.subscriptionStatus = subscriptionStatusToJSON(
        message.subscriptionStatus
      ));
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseSubscribeLastPriceRequest() {
  return { subscriptionAction: 0, instruments: [] };
}

export const SubscribeLastPriceRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.subscriptionAction !== 0) {
      writer.uint32(8).int32(message.subscriptionAction);
    }

    for (const v of message.instruments) {
      LastPriceInstrument.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeLastPriceRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subscriptionAction = reader.int32();

          break;
        case 2:
          message.instruments.push(
            LastPriceInstrument.decode(reader, reader.uint32())
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
      subscriptionAction: isSet(object.subscriptionAction)
        ? subscriptionActionFromJSON(object.subscriptionAction)
        : 0,
      instruments: Array.isArray(object?.instruments)
        ? object.instruments.map((e) => LastPriceInstrument.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.subscriptionAction !== undefined &&
      (obj.subscriptionAction = subscriptionActionToJSON(
        message.subscriptionAction
      ));

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? LastPriceInstrument.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseLastPriceInstrument() {
  return { instrumentId: '' };
}

export const LastPriceInstrument = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrumentId !== '') {
      writer.uint32(18).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLastPriceInstrument();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.instrumentId = reader.string();

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
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseSubscribeLastPriceResponse() {
  return { trackingId: '', lastPriceSubscriptions: [] };
}

export const SubscribeLastPriceResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.trackingId !== '') {
      writer.uint32(10).string(message.trackingId);
    }

    for (const v of message.lastPriceSubscriptions) {
      LastPriceSubscription.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscribeLastPriceResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.trackingId = reader.string();

          break;
        case 2:
          message.lastPriceSubscriptions.push(
            LastPriceSubscription.decode(reader, reader.uint32())
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
      trackingId: isSet(object.trackingId) ? String(object.trackingId) : '',
      lastPriceSubscriptions: Array.isArray(object?.lastPriceSubscriptions)
        ? object.lastPriceSubscriptions.map((e) =>
            LastPriceSubscription.fromJSON(e)
          )
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.trackingId !== undefined && (obj.trackingId = message.trackingId);

    if (message.lastPriceSubscriptions) {
      obj.lastPriceSubscriptions = message.lastPriceSubscriptions.map((e) =>
        e ? LastPriceSubscription.toJSON(e) : undefined
      );
    } else {
      obj.lastPriceSubscriptions = [];
    }

    return obj;
  }
};

function createBaseLastPriceSubscription() {
  return { figi: '', subscriptionStatus: 0, instrumentUid: '' };
}

export const LastPriceSubscription = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.subscriptionStatus !== 0) {
      writer.uint32(16).int32(message.subscriptionStatus);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(26).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLastPriceSubscription();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.subscriptionStatus = reader.int32();

          break;
        case 3:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      subscriptionStatus: isSet(object.subscriptionStatus)
        ? subscriptionStatusFromJSON(object.subscriptionStatus)
        : 0,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.subscriptionStatus !== undefined &&
      (obj.subscriptionStatus = subscriptionStatusToJSON(
        message.subscriptionStatus
      ));
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseCandle() {
  return {
    figi: '',
    interval: 0,
    open: undefined,
    high: undefined,
    low: undefined,
    close: undefined,
    volume: 0,
    time: undefined,
    lastTradeTs: undefined,
    instrumentUid: ''
  };
}

export const Candle = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.interval !== 0) {
      writer.uint32(16).int32(message.interval);
    }

    if (message.open !== undefined) {
      Quotation.encode(message.open, writer.uint32(26).fork()).ldelim();
    }

    if (message.high !== undefined) {
      Quotation.encode(message.high, writer.uint32(34).fork()).ldelim();
    }

    if (message.low !== undefined) {
      Quotation.encode(message.low, writer.uint32(42).fork()).ldelim();
    }

    if (message.close !== undefined) {
      Quotation.encode(message.close, writer.uint32(50).fork()).ldelim();
    }

    if (message.volume !== 0) {
      writer.uint32(56).int64(message.volume);
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(66).fork()
      ).ldelim();
    }

    if (message.lastTradeTs !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastTradeTs),
        writer.uint32(74).fork()
      ).ldelim();
    }

    if (message.instrumentUid !== '') {
      writer.uint32(82).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCandle();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.interval = reader.int32();

          break;
        case 3:
          message.open = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.high = Quotation.decode(reader, reader.uint32());

          break;
        case 5:
          message.low = Quotation.decode(reader, reader.uint32());

          break;
        case 6:
          message.close = Quotation.decode(reader, reader.uint32());

          break;
        case 7:
          message.volume = longToNumber(reader.int64());

          break;
        case 8:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 9:
          message.lastTradeTs = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 10:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      interval: isSet(object.interval)
        ? subscriptionIntervalFromJSON(object.interval)
        : 0,
      open: isSet(object.open) ? Quotation.fromJSON(object.open) : undefined,
      high: isSet(object.high) ? Quotation.fromJSON(object.high) : undefined,
      low: isSet(object.low) ? Quotation.fromJSON(object.low) : undefined,
      close: isSet(object.close) ? Quotation.fromJSON(object.close) : undefined,
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      lastTradeTs: isSet(object.lastTradeTs)
        ? fromJsonTimestamp(object.lastTradeTs)
        : undefined,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.interval !== undefined &&
      (obj.interval = subscriptionIntervalToJSON(message.interval));
    message.open !== undefined &&
      (obj.open = message.open ? Quotation.toJSON(message.open) : undefined);
    message.high !== undefined &&
      (obj.high = message.high ? Quotation.toJSON(message.high) : undefined);
    message.low !== undefined &&
      (obj.low = message.low ? Quotation.toJSON(message.low) : undefined);
    message.close !== undefined &&
      (obj.close = message.close ? Quotation.toJSON(message.close) : undefined);
    message.volume !== undefined && (obj.volume = Math.round(message.volume));
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.lastTradeTs !== undefined &&
      (obj.lastTradeTs = message.lastTradeTs.toISOString());
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseOrderBook() {
  return {
    figi: '',
    depth: 0,
    isConsistent: false,
    bids: [],
    asks: [],
    time: undefined,
    limitUp: undefined,
    limitDown: undefined,
    instrumentUid: ''
  };
}

export const OrderBook = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.depth !== 0) {
      writer.uint32(16).int32(message.depth);
    }

    if (message.isConsistent === true) {
      writer.uint32(24).bool(message.isConsistent);
    }

    for (const v of message.bids) {
      Order.encode(v, writer.uint32(34).fork()).ldelim();
    }

    for (const v of message.asks) {
      Order.encode(v, writer.uint32(42).fork()).ldelim();
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(50).fork()
      ).ldelim();
    }

    if (message.limitUp !== undefined) {
      Quotation.encode(message.limitUp, writer.uint32(58).fork()).ldelim();
    }

    if (message.limitDown !== undefined) {
      Quotation.encode(message.limitDown, writer.uint32(66).fork()).ldelim();
    }

    if (message.instrumentUid !== '') {
      writer.uint32(74).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBook();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.depth = reader.int32();

          break;
        case 3:
          message.isConsistent = reader.bool();

          break;
        case 4:
          message.bids.push(Order.decode(reader, reader.uint32()));

          break;
        case 5:
          message.asks.push(Order.decode(reader, reader.uint32()));

          break;
        case 6:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 7:
          message.limitUp = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.limitDown = Quotation.decode(reader, reader.uint32());

          break;
        case 9:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      depth: isSet(object.depth) ? Number(object.depth) : 0,
      isConsistent: isSet(object.isConsistent)
        ? Boolean(object.isConsistent)
        : false,
      bids: Array.isArray(object?.bids)
        ? object.bids.map((e) => Order.fromJSON(e))
        : [],
      asks: Array.isArray(object?.asks)
        ? object.asks.map((e) => Order.fromJSON(e))
        : [],
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      limitUp: isSet(object.limitUp)
        ? Quotation.fromJSON(object.limitUp)
        : undefined,
      limitDown: isSet(object.limitDown)
        ? Quotation.fromJSON(object.limitDown)
        : undefined,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.depth !== undefined && (obj.depth = Math.round(message.depth));
    message.isConsistent !== undefined &&
      (obj.isConsistent = message.isConsistent);

    if (message.bids) {
      obj.bids = message.bids.map((e) => (e ? Order.toJSON(e) : undefined));
    } else {
      obj.bids = [];
    }

    if (message.asks) {
      obj.asks = message.asks.map((e) => (e ? Order.toJSON(e) : undefined));
    } else {
      obj.asks = [];
    }

    message.time !== undefined && (obj.time = message.time.toISOString());
    message.limitUp !== undefined &&
      (obj.limitUp = message.limitUp
        ? Quotation.toJSON(message.limitUp)
        : undefined);
    message.limitDown !== undefined &&
      (obj.limitDown = message.limitDown
        ? Quotation.toJSON(message.limitDown)
        : undefined);
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseOrder() {
  return { price: undefined, quantity: 0 };
}

export const Order = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.price !== undefined) {
      Quotation.encode(message.price, writer.uint32(10).fork()).ldelim();
    }

    if (message.quantity !== 0) {
      writer.uint32(16).int64(message.quantity);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrder();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.price = Quotation.decode(reader, reader.uint32());

          break;
        case 2:
          message.quantity = longToNumber(reader.int64());

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
      price: isSet(object.price) ? Quotation.fromJSON(object.price) : undefined,
      quantity: isSet(object.quantity) ? Number(object.quantity) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    message.price !== undefined &&
      (obj.price = message.price ? Quotation.toJSON(message.price) : undefined);
    message.quantity !== undefined &&
      (obj.quantity = Math.round(message.quantity));

    return obj;
  }
};

function createBaseTrade() {
  return {
    figi: '',
    direction: 0,
    price: undefined,
    quantity: 0,
    time: undefined,
    instrumentUid: ''
  };
}

export const Trade = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.direction !== 0) {
      writer.uint32(16).int32(message.direction);
    }

    if (message.price !== undefined) {
      Quotation.encode(message.price, writer.uint32(26).fork()).ldelim();
    }

    if (message.quantity !== 0) {
      writer.uint32(32).int64(message.quantity);
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(42).fork()
      ).ldelim();
    }

    if (message.instrumentUid !== '') {
      writer.uint32(50).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrade();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.direction = reader.int32();

          break;
        case 3:
          message.price = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.quantity = longToNumber(reader.int64());

          break;
        case 5:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 6:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      direction: isSet(object.direction)
        ? tradeDirectionFromJSON(object.direction)
        : 0,
      price: isSet(object.price) ? Quotation.fromJSON(object.price) : undefined,
      quantity: isSet(object.quantity) ? Number(object.quantity) : 0,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.direction !== undefined &&
      (obj.direction = tradeDirectionToJSON(message.direction));
    message.price !== undefined &&
      (obj.price = message.price ? Quotation.toJSON(message.price) : undefined);
    message.quantity !== undefined &&
      (obj.quantity = Math.round(message.quantity));
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseTradingStatus() {
  return {
    figi: '',
    tradingStatus: 0,
    time: undefined,
    limitOrderAvailableFlag: false,
    marketOrderAvailableFlag: false,
    instrumentUid: ''
  };
}

export const TradingStatus = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(16).int32(message.tradingStatus);
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.limitOrderAvailableFlag === true) {
      writer.uint32(32).bool(message.limitOrderAvailableFlag);
    }

    if (message.marketOrderAvailableFlag === true) {
      writer.uint32(40).bool(message.marketOrderAvailableFlag);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(50).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradingStatus();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.tradingStatus = reader.int32();

          break;
        case 3:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 4:
          message.limitOrderAvailableFlag = reader.bool();

          break;
        case 5:
          message.marketOrderAvailableFlag = reader.bool();

          break;
        case 6:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      limitOrderAvailableFlag: isSet(object.limitOrderAvailableFlag)
        ? Boolean(object.limitOrderAvailableFlag)
        : false,
      marketOrderAvailableFlag: isSet(object.marketOrderAvailableFlag)
        ? Boolean(object.marketOrderAvailableFlag)
        : false,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.limitOrderAvailableFlag !== undefined &&
      (obj.limitOrderAvailableFlag = message.limitOrderAvailableFlag);
    message.marketOrderAvailableFlag !== undefined &&
      (obj.marketOrderAvailableFlag = message.marketOrderAvailableFlag);
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseGetCandlesRequest() {
  return {
    from: undefined,
    to: undefined,
    interval: 0,
    instrumentId: ''
  };
}

export const GetCandlesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
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

    if (message.interval !== 0) {
      writer.uint32(32).int32(message.interval);
    }

    if (message.instrumentId !== '') {
      writer.uint32(42).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetCandlesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.from = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.to = fromTimestamp(Timestamp.decode(reader, reader.uint32()));

          break;
        case 4:
          message.interval = reader.int32();

          break;
        case 5:
          message.instrumentId = reader.string();

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
      from: isSet(object.from) ? fromJsonTimestamp(object.from) : undefined,
      to: isSet(object.to) ? fromJsonTimestamp(object.to) : undefined,
      interval: isSet(object.interval)
        ? candleIntervalFromJSON(object.interval)
        : 0,
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.from !== undefined && (obj.from = message.from.toISOString());
    message.to !== undefined && (obj.to = message.to.toISOString());
    message.interval !== undefined &&
      (obj.interval = candleIntervalToJSON(message.interval));
    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseGetCandlesResponse() {
  return { candles: [] };
}

export const GetCandlesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.candles) {
      HistoricCandle.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetCandlesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.candles.push(HistoricCandle.decode(reader, reader.uint32()));

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
      candles: Array.isArray(object?.candles)
        ? object.candles.map((e) => HistoricCandle.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.candles) {
      obj.candles = message.candles.map((e) =>
        e ? HistoricCandle.toJSON(e) : undefined
      );
    } else {
      obj.candles = [];
    }

    return obj;
  }
};

function createBaseHistoricCandle() {
  return {
    open: undefined,
    high: undefined,
    low: undefined,
    close: undefined,
    volume: 0,
    time: undefined,
    isComplete: false
  };
}

export const HistoricCandle = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.open !== undefined) {
      Quotation.encode(message.open, writer.uint32(10).fork()).ldelim();
    }

    if (message.high !== undefined) {
      Quotation.encode(message.high, writer.uint32(18).fork()).ldelim();
    }

    if (message.low !== undefined) {
      Quotation.encode(message.low, writer.uint32(26).fork()).ldelim();
    }

    if (message.close !== undefined) {
      Quotation.encode(message.close, writer.uint32(34).fork()).ldelim();
    }

    if (message.volume !== 0) {
      writer.uint32(40).int64(message.volume);
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(50).fork()
      ).ldelim();
    }

    if (message.isComplete === true) {
      writer.uint32(56).bool(message.isComplete);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHistoricCandle();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.open = Quotation.decode(reader, reader.uint32());

          break;
        case 2:
          message.high = Quotation.decode(reader, reader.uint32());

          break;
        case 3:
          message.low = Quotation.decode(reader, reader.uint32());

          break;
        case 4:
          message.close = Quotation.decode(reader, reader.uint32());

          break;
        case 5:
          message.volume = longToNumber(reader.int64());

          break;
        case 6:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 7:
          message.isComplete = reader.bool();

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
      open: isSet(object.open) ? Quotation.fromJSON(object.open) : undefined,
      high: isSet(object.high) ? Quotation.fromJSON(object.high) : undefined,
      low: isSet(object.low) ? Quotation.fromJSON(object.low) : undefined,
      close: isSet(object.close) ? Quotation.fromJSON(object.close) : undefined,
      volume: isSet(object.volume) ? Number(object.volume) : 0,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      isComplete: isSet(object.isComplete) ? Boolean(object.isComplete) : false
    };
  },
  toJSON(message) {
    const obj = {};

    message.open !== undefined &&
      (obj.open = message.open ? Quotation.toJSON(message.open) : undefined);
    message.high !== undefined &&
      (obj.high = message.high ? Quotation.toJSON(message.high) : undefined);
    message.low !== undefined &&
      (obj.low = message.low ? Quotation.toJSON(message.low) : undefined);
    message.close !== undefined &&
      (obj.close = message.close ? Quotation.toJSON(message.close) : undefined);
    message.volume !== undefined && (obj.volume = Math.round(message.volume));
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.isComplete !== undefined && (obj.isComplete = message.isComplete);

    return obj;
  }
};

function createBaseGetLastPricesRequest() {
  return { instrumentId: [] };
}

export const GetLastPricesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instrumentId) {
      writer.uint32(18).string(v);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLastPricesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.instrumentId.push(reader.string());

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
      instrumentId: Array.isArray(object?.instrumentId)
        ? object.instrumentId.map((e) => String(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instrumentId) {
      obj.instrumentId = message.instrumentId.map((e) => e);
    } else {
      obj.instrumentId = [];
    }

    return obj;
  }
};

function createBaseGetLastPricesResponse() {
  return { lastPrices: [] };
}

export const GetLastPricesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.lastPrices) {
      LastPrice.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLastPricesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.lastPrices.push(LastPrice.decode(reader, reader.uint32()));

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
      lastPrices: Array.isArray(object?.lastPrices)
        ? object.lastPrices.map((e) => LastPrice.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.lastPrices) {
      obj.lastPrices = message.lastPrices.map((e) =>
        e ? LastPrice.toJSON(e) : undefined
      );
    } else {
      obj.lastPrices = [];
    }

    return obj;
  }
};

function createBaseLastPrice() {
  return { figi: '', price: undefined, time: undefined, instrumentUid: '' };
}

export const LastPrice = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.price !== undefined) {
      Quotation.encode(message.price, writer.uint32(18).fork()).ldelim();
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.instrumentUid !== '') {
      writer.uint32(90).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLastPrice();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.price = Quotation.decode(reader, reader.uint32());

          break;
        case 3:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 11:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      price: isSet(object.price) ? Quotation.fromJSON(object.price) : undefined,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.price !== undefined &&
      (obj.price = message.price ? Quotation.toJSON(message.price) : undefined);
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseGetOrderBookRequest() {
  return {depth: 0, instrumentId: '' };
}

export const GetOrderBookRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.depth !== 0) {
      writer.uint32(16).int32(message.depth);
    }

    if (message.instrumentId !== '') {
      writer.uint32(26).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetOrderBookRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.depth = reader.int32();

          break;
        case 3:
          message.instrumentId = reader.string();

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
      depth: isSet(object.depth) ? Number(object.depth) : 0,
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.depth !== undefined && (obj.depth = Math.round(message.depth));
    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseGetOrderBookResponse() {
  return {
    figi: '',
    depth: 0,
    bids: [],
    asks: [],
    lastPrice: undefined,
    closePrice: undefined,
    limitUp: undefined,
    limitDown: undefined,
    lastPriceTs: undefined,
    closePriceTs: undefined,
    orderbookTs: undefined,
    instrumentUid: ''
  };
}

export const GetOrderBookResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.depth !== 0) {
      writer.uint32(16).int32(message.depth);
    }

    for (const v of message.bids) {
      Order.encode(v, writer.uint32(26).fork()).ldelim();
    }

    for (const v of message.asks) {
      Order.encode(v, writer.uint32(34).fork()).ldelim();
    }

    if (message.lastPrice !== undefined) {
      Quotation.encode(message.lastPrice, writer.uint32(42).fork()).ldelim();
    }

    if (message.closePrice !== undefined) {
      Quotation.encode(message.closePrice, writer.uint32(50).fork()).ldelim();
    }

    if (message.limitUp !== undefined) {
      Quotation.encode(message.limitUp, writer.uint32(58).fork()).ldelim();
    }

    if (message.limitDown !== undefined) {
      Quotation.encode(message.limitDown, writer.uint32(66).fork()).ldelim();
    }

    if (message.lastPriceTs !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastPriceTs),
        writer.uint32(170).fork()
      ).ldelim();
    }

    if (message.closePriceTs !== undefined) {
      Timestamp.encode(
        toTimestamp(message.closePriceTs),
        writer.uint32(178).fork()
      ).ldelim();
    }

    if (message.orderbookTs !== undefined) {
      Timestamp.encode(
        toTimestamp(message.orderbookTs),
        writer.uint32(186).fork()
      ).ldelim();
    }

    if (message.instrumentUid !== '') {
      writer.uint32(74).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetOrderBookResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.depth = reader.int32();

          break;
        case 3:
          message.bids.push(Order.decode(reader, reader.uint32()));

          break;
        case 4:
          message.asks.push(Order.decode(reader, reader.uint32()));

          break;
        case 5:
          message.lastPrice = Quotation.decode(reader, reader.uint32());

          break;
        case 6:
          message.closePrice = Quotation.decode(reader, reader.uint32());

          break;
        case 7:
          message.limitUp = Quotation.decode(reader, reader.uint32());

          break;
        case 8:
          message.limitDown = Quotation.decode(reader, reader.uint32());

          break;
        case 21:
          message.lastPriceTs = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 22:
          message.closePriceTs = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 23:
          message.orderbookTs = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 9:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      depth: isSet(object.depth) ? Number(object.depth) : 0,
      bids: Array.isArray(object?.bids)
        ? object.bids.map((e) => Order.fromJSON(e))
        : [],
      asks: Array.isArray(object?.asks)
        ? object.asks.map((e) => Order.fromJSON(e))
        : [],
      lastPrice: isSet(object.lastPrice)
        ? Quotation.fromJSON(object.lastPrice)
        : undefined,
      closePrice: isSet(object.closePrice)
        ? Quotation.fromJSON(object.closePrice)
        : undefined,
      limitUp: isSet(object.limitUp)
        ? Quotation.fromJSON(object.limitUp)
        : undefined,
      limitDown: isSet(object.limitDown)
        ? Quotation.fromJSON(object.limitDown)
        : undefined,
      lastPriceTs: isSet(object.lastPriceTs)
        ? fromJsonTimestamp(object.lastPriceTs)
        : undefined,
      closePriceTs: isSet(object.closePriceTs)
        ? fromJsonTimestamp(object.closePriceTs)
        : undefined,
      orderbookTs: isSet(object.orderbookTs)
        ? fromJsonTimestamp(object.orderbookTs)
        : undefined,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.depth !== undefined && (obj.depth = Math.round(message.depth));

    if (message.bids) {
      obj.bids = message.bids.map((e) => (e ? Order.toJSON(e) : undefined));
    } else {
      obj.bids = [];
    }

    if (message.asks) {
      obj.asks = message.asks.map((e) => (e ? Order.toJSON(e) : undefined));
    } else {
      obj.asks = [];
    }

    message.lastPrice !== undefined &&
      (obj.lastPrice = message.lastPrice
        ? Quotation.toJSON(message.lastPrice)
        : undefined);
    message.closePrice !== undefined &&
      (obj.closePrice = message.closePrice
        ? Quotation.toJSON(message.closePrice)
        : undefined);
    message.limitUp !== undefined &&
      (obj.limitUp = message.limitUp
        ? Quotation.toJSON(message.limitUp)
        : undefined);
    message.limitDown !== undefined &&
      (obj.limitDown = message.limitDown
        ? Quotation.toJSON(message.limitDown)
        : undefined);
    message.lastPriceTs !== undefined &&
      (obj.lastPriceTs = message.lastPriceTs.toISOString());
    message.closePriceTs !== undefined &&
      (obj.closePriceTs = message.closePriceTs.toISOString());
    message.orderbookTs !== undefined &&
      (obj.orderbookTs = message.orderbookTs.toISOString());
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseGetTradingStatusRequest() {
  return { instrumentId: '' };
}

export const GetTradingStatusRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrumentId !== '') {
      writer.uint32(18).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTradingStatusRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.instrumentId = reader.string();

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
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseGetTradingStatusResponse() {
  return {
    figi: '',
    tradingStatus: 0,
    limitOrderAvailableFlag: false,
    marketOrderAvailableFlag: false,
    apiTradeAvailableFlag: false,
    instrumentUid: ''
  };
}

export const GetTradingStatusResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.tradingStatus !== 0) {
      writer.uint32(16).int32(message.tradingStatus);
    }

    if (message.limitOrderAvailableFlag === true) {
      writer.uint32(24).bool(message.limitOrderAvailableFlag);
    }

    if (message.marketOrderAvailableFlag === true) {
      writer.uint32(32).bool(message.marketOrderAvailableFlag);
    }

    if (message.apiTradeAvailableFlag === true) {
      writer.uint32(40).bool(message.apiTradeAvailableFlag);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(50).string(message.instrumentUid);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTradingStatusResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.tradingStatus = reader.int32();

          break;
        case 3:
          message.limitOrderAvailableFlag = reader.bool();

          break;
        case 4:
          message.marketOrderAvailableFlag = reader.bool();

          break;
        case 5:
          message.apiTradeAvailableFlag = reader.bool();

          break;
        case 6:
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
      figi: isSet(object.figi) ? String(object.figi) : '',
      tradingStatus: isSet(object.tradingStatus)
        ? securityTradingStatusFromJSON(object.tradingStatus)
        : 0,
      limitOrderAvailableFlag: isSet(object.limitOrderAvailableFlag)
        ? Boolean(object.limitOrderAvailableFlag)
        : false,
      marketOrderAvailableFlag: isSet(object.marketOrderAvailableFlag)
        ? Boolean(object.marketOrderAvailableFlag)
        : false,
      apiTradeAvailableFlag: isSet(object.apiTradeAvailableFlag)
        ? Boolean(object.apiTradeAvailableFlag)
        : false,
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.tradingStatus !== undefined &&
      (obj.tradingStatus = securityTradingStatusToJSON(message.tradingStatus));
    message.limitOrderAvailableFlag !== undefined &&
      (obj.limitOrderAvailableFlag = message.limitOrderAvailableFlag);
    message.marketOrderAvailableFlag !== undefined &&
      (obj.marketOrderAvailableFlag = message.marketOrderAvailableFlag);
    message.apiTradeAvailableFlag !== undefined &&
      (obj.apiTradeAvailableFlag = message.apiTradeAvailableFlag);
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);

    return obj;
  }
};

function createBaseGetLastTradesRequest() {
  return { from: undefined, to: undefined, instrumentId: '' };
}

export const GetLastTradesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
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

    if (message.instrumentId !== '') {
      writer.uint32(34).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLastTradesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.from = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 3:
          message.to = fromTimestamp(Timestamp.decode(reader, reader.uint32()));

          break;
        case 4:
          message.instrumentId = reader.string();

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
      from: isSet(object.from) ? fromJsonTimestamp(object.from) : undefined,
      to: isSet(object.to) ? fromJsonTimestamp(object.to) : undefined,
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.from !== undefined && (obj.from = message.from.toISOString());
    message.to !== undefined && (obj.to = message.to.toISOString());
    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseGetLastTradesResponse() {
  return { trades: [] };
}

export const GetLastTradesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.trades) {
      Trade.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLastTradesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.trades.push(Trade.decode(reader, reader.uint32()));

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
      trades: Array.isArray(object?.trades)
        ? object.trades.map((e) => Trade.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.trades) {
      obj.trades = message.trades.map((e) => (e ? Trade.toJSON(e) : undefined));
    } else {
      obj.trades = [];
    }

    return obj;
  }
};

function createBaseGetMySubscriptions() {
  return {};
}

export const GetMySubscriptions = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMySubscriptions();

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

function createBaseGetClosePricesRequest() {
  return { instruments: [] };
}

export const GetClosePricesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.instruments) {
      InstrumentClosePriceRequest.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetClosePricesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instruments.push(
            InstrumentClosePriceRequest.decode(reader, reader.uint32())
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
        ? object.instruments.map((e) => InstrumentClosePriceRequest.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.instruments) {
      obj.instruments = message.instruments.map((e) =>
        e ? InstrumentClosePriceRequest.toJSON(e) : undefined
      );
    } else {
      obj.instruments = [];
    }

    return obj;
  }
};

function createBaseInstrumentClosePriceRequest() {
  return { instrumentId: '' };
}

export const InstrumentClosePriceRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.instrumentId !== '') {
      writer.uint32(10).string(message.instrumentId);
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrumentClosePriceRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.instrumentId = reader.string();

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
      instrumentId: isSet(object.instrumentId)
        ? String(object.instrumentId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.instrumentId !== undefined &&
      (obj.instrumentId = message.instrumentId);

    return obj;
  }
};

function createBaseGetClosePricesResponse() {
  return { closePrices: [] };
}

export const GetClosePricesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.closePrices) {
      InstrumentClosePriceResponse.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetClosePricesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.closePrices.push(
            InstrumentClosePriceResponse.decode(reader, reader.uint32())
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
      closePrices: Array.isArray(object?.closePrices)
        ? object.closePrices.map((e) =>
            InstrumentClosePriceResponse.fromJSON(e)
          )
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.closePrices) {
      obj.closePrices = message.closePrices.map((e) =>
        e ? InstrumentClosePriceResponse.toJSON(e) : undefined
      );
    } else {
      obj.closePrices = [];
    }

    return obj;
  }
};

function createBaseInstrumentClosePriceResponse() {
  return { figi: '', instrumentUid: '', price: undefined, time: undefined };
}

export const InstrumentClosePriceResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.figi !== '') {
      writer.uint32(10).string(message.figi);
    }

    if (message.instrumentUid !== '') {
      writer.uint32(18).string(message.instrumentUid);
    }

    if (message.price !== undefined) {
      Quotation.encode(message.price, writer.uint32(90).fork()).ldelim();
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(170).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader = input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstrumentClosePriceResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.figi = reader.string();

          break;
        case 2:
          message.instrumentUid = reader.string();

          break;
        case 11:
          message.price = Quotation.decode(reader, reader.uint32());

          break;
        case 21:
          message.time = fromTimestamp(
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
      instrumentUid: isSet(object.instrumentUid)
        ? String(object.instrumentUid)
        : '',
      price: isSet(object.price) ? Quotation.fromJSON(object.price) : undefined,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.figi !== undefined && (obj.figi = message.figi);
    message.instrumentUid !== undefined &&
      (obj.instrumentUid = message.instrumentUid);
    message.price !== undefined &&
      (obj.price = message.price ? Quotation.toJSON(message.price) : undefined);
    message.time !== undefined && (obj.time = message.time.toISOString());

    return obj;
  }
};
export const MarketDataServiceDefinition = {
  name: 'MarketDataService',
  fullName: 'tinkoff.public.invest.api.contract.v1.MarketDataService',
  methods: {
    /** Метод запроса исторических свечей по инструменту. */
    getCandles: {
      name: 'GetCandles',
      requestType: GetCandlesRequest,
      requestStream: false,
      responseType: GetCandlesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод запроса цен последних сделок по инструментам. */
    getLastPrices: {
      name: 'GetLastPrices',
      requestType: GetLastPricesRequest,
      requestStream: false,
      responseType: GetLastPricesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения стакана по инструменту. */
    getOrderBook: {
      name: 'GetOrderBook',
      requestType: GetOrderBookRequest,
      requestStream: false,
      responseType: GetOrderBookResponse,
      responseStream: false,
      options: {}
    },
    /** Метод запроса статуса торгов по инструментам. */
    getTradingStatus: {
      name: 'GetTradingStatus',
      requestType: GetTradingStatusRequest,
      requestStream: false,
      responseType: GetTradingStatusResponse,
      responseStream: false,
      options: {}
    },
    /** Метод запроса обезличенных сделок за последний час. */
    getLastTrades: {
      name: 'GetLastTrades',
      requestType: GetLastTradesRequest,
      requestStream: false,
      responseType: GetLastTradesResponse,
      responseStream: false,
      options: {}
    },
    /** Метод запроса цен закрытия торговой сессии по инструментам. */
    getClosePrices: {
      name: 'GetClosePrices',
      requestType: GetClosePricesRequest,
      requestStream: false,
      responseType: GetClosePricesResponse,
      responseStream: false,
      options: {}
    }
  }
};
export const MarketDataStreamServiceDefinition = {
  name: 'MarketDataStreamService',
  fullName: 'tinkoff.public.invest.api.contract.v1.MarketDataStreamService',
  methods: {
    /** Bi-directional стрим предоставления биржевой информации. */
    marketDataStream: {
      name: 'MarketDataStream',
      requestType: MarketDataRequest,
      requestStream: true,
      responseType: MarketDataResponse,
      responseStream: true,
      options: {}
    },
    /** Server-side стрим предоставления биржевой информации. */
    marketDataServerSideStream: {
      name: 'MarketDataServerSideStream',
      requestType: MarketDataServerSideStreamRequest,
      requestStream: false,
      responseType: MarketDataResponse,
      responseStream: true,
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
