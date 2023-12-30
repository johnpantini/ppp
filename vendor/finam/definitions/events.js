import Long from '../../long.min.js';
import protobuf from '../../protobuf/minimal.js';
import { Timestamp } from '../../tinkoff/definitions/google/protobuf/timestamp.js';
import {
  buySellFromJSON,
  buySellToJSON,
  OrderValidBefore,
  ResponseEvent
} from './common.js';
import {
  OrderCondition,
  orderStatusFromJSON,
  orderStatusToJSON
} from './orders.js';
import {
  CurrencyRow,
  MoneyRow,
  PortfolioContent,
  PositionRow
} from './portfolios.js';

export const protobufPackage = 'proto.tradeapi.v1';
export var TimeFrame_Unit;

(function (TimeFrame_Unit) {
  /**
   * UNIT_UNSPECIFIED - Value is not specified. Do not use.
   * Значение не указано. Не использовать.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_UNSPECIFIED'] = 0)] = 'UNIT_UNSPECIFIED';
  /**
   * UNIT_MINUTE - Munute.
   * Минута.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_MINUTE'] = 1)] = 'UNIT_MINUTE';
  /**
   * UNIT_HOUR - Hour.
   * Час.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_HOUR'] = 2)] = 'UNIT_HOUR';
  /**
   * UNIT_DAY - Day.
   * День.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_DAY'] = 3)] = 'UNIT_DAY';
  /**
   * UNIT_WEEK - Week.
   * Неделя.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_WEEK'] = 4)] = 'UNIT_WEEK';
  /**
   * UNIT_MONTH - Month.
   * Месяц.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_MONTH'] = 5)] = 'UNIT_MONTH';
  /**
   * UNIT_QUARTER - Quarter.
   * Квартал.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_QUARTER'] = 6)] = 'UNIT_QUARTER';
  /**
   * UNIT_YEAR - Year.
   * Год.
   */
  TimeFrame_Unit[(TimeFrame_Unit['UNIT_YEAR'] = 7)] = 'UNIT_YEAR';
  TimeFrame_Unit[(TimeFrame_Unit['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(TimeFrame_Unit || (TimeFrame_Unit = {}));

export function timeFrame_UnitFromJSON(object) {
  switch (object) {
    case 0:
    case 'UNIT_UNSPECIFIED':
      return TimeFrame_Unit.UNIT_UNSPECIFIED;
    case 1:
    case 'UNIT_MINUTE':
      return TimeFrame_Unit.UNIT_MINUTE;
    case 2:
    case 'UNIT_HOUR':
      return TimeFrame_Unit.UNIT_HOUR;
    case 3:
    case 'UNIT_DAY':
      return TimeFrame_Unit.UNIT_DAY;
    case 4:
    case 'UNIT_WEEK':
      return TimeFrame_Unit.UNIT_WEEK;
    case 5:
    case 'UNIT_MONTH':
      return TimeFrame_Unit.UNIT_MONTH;
    case 6:
    case 'UNIT_QUARTER':
      return TimeFrame_Unit.UNIT_QUARTER;
    case 7:
    case 'UNIT_YEAR':
      return TimeFrame_Unit.UNIT_YEAR;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return TimeFrame_Unit.UNRECOGNIZED;
  }
}

export function timeFrame_UnitToJSON(object) {
  switch (object) {
    case TimeFrame_Unit.UNIT_UNSPECIFIED:
      return 'UNIT_UNSPECIFIED';
    case TimeFrame_Unit.UNIT_MINUTE:
      return 'UNIT_MINUTE';
    case TimeFrame_Unit.UNIT_HOUR:
      return 'UNIT_HOUR';
    case TimeFrame_Unit.UNIT_DAY:
      return 'UNIT_DAY';
    case TimeFrame_Unit.UNIT_WEEK:
      return 'UNIT_WEEK';
    case TimeFrame_Unit.UNIT_MONTH:
      return 'UNIT_MONTH';
    case TimeFrame_Unit.UNIT_QUARTER:
      return 'UNIT_QUARTER';
    case TimeFrame_Unit.UNIT_YEAR:
      return 'UNIT_YEAR';
    case TimeFrame_Unit.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

function createBaseTimeFrame() {
  return { timeUnit: 0 };
}

export const TimeFrame = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.timeUnit !== 0) {
      writer.uint32(8).int32(message.timeUnit);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimeFrame();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.timeUnit = reader.int32();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      timeUnit: isSet(object.timeUnit)
        ? timeFrame_UnitFromJSON(object.timeUnit)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.timeUnit !== 0) {
      obj.timeUnit = timeFrame_UnitToJSON(message.timeUnit);
    }

    return obj;
  },
  create(base) {
    return TimeFrame.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseTimeFrame();

    message.timeUnit = object.timeUnit ?? 0;

    return message;
  }
};

function createBaseSubscriptionRequest() {
  return {
    orderBookSubscribeRequest: undefined,
    orderBookUnsubscribeRequest: undefined,
    orderTradeSubscribeRequest: undefined,
    orderTradeUnsubscribeRequest: undefined,
    keepAliveRequest: undefined
  };
}

export const SubscriptionRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.orderBookSubscribeRequest !== undefined) {
      OrderBookSubscribeRequest.encode(
        message.orderBookSubscribeRequest,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.orderBookUnsubscribeRequest !== undefined) {
      OrderBookUnsubscribeRequest.encode(
        message.orderBookUnsubscribeRequest,
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.orderTradeSubscribeRequest !== undefined) {
      OrderTradeSubscribeRequest.encode(
        message.orderTradeSubscribeRequest,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.orderTradeUnsubscribeRequest !== undefined) {
      OrderTradeUnsubscribeRequest.encode(
        message.orderTradeUnsubscribeRequest,
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.keepAliveRequest !== undefined) {
      KeepAliveRequest.encode(
        message.keepAliveRequest,
        writer.uint32(42).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubscriptionRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.orderBookSubscribeRequest = OrderBookSubscribeRequest.decode(
            reader,
            reader.uint32()
          );
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.orderBookUnsubscribeRequest =
            OrderBookUnsubscribeRequest.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.orderTradeSubscribeRequest =
            OrderTradeSubscribeRequest.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.orderTradeUnsubscribeRequest =
            OrderTradeUnsubscribeRequest.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.keepAliveRequest = KeepAliveRequest.decode(
            reader,
            reader.uint32()
          );
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      orderBookSubscribeRequest: isSet(object.orderBookSubscribeRequest)
        ? OrderBookSubscribeRequest.fromJSON(object.orderBookSubscribeRequest)
        : undefined,
      orderBookUnsubscribeRequest: isSet(object.orderBookUnsubscribeRequest)
        ? OrderBookUnsubscribeRequest.fromJSON(
            object.orderBookUnsubscribeRequest
          )
        : undefined,
      orderTradeSubscribeRequest: isSet(object.orderTradeSubscribeRequest)
        ? OrderTradeSubscribeRequest.fromJSON(object.orderTradeSubscribeRequest)
        : undefined,
      orderTradeUnsubscribeRequest: isSet(object.orderTradeUnsubscribeRequest)
        ? OrderTradeUnsubscribeRequest.fromJSON(
            object.orderTradeUnsubscribeRequest
          )
        : undefined,
      keepAliveRequest: isSet(object.keepAliveRequest)
        ? KeepAliveRequest.fromJSON(object.keepAliveRequest)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.orderBookSubscribeRequest !== undefined) {
      obj.orderBookSubscribeRequest = OrderBookSubscribeRequest.toJSON(
        message.orderBookSubscribeRequest
      );
    }

    if (message.orderBookUnsubscribeRequest !== undefined) {
      obj.orderBookUnsubscribeRequest = OrderBookUnsubscribeRequest.toJSON(
        message.orderBookUnsubscribeRequest
      );
    }

    if (message.orderTradeSubscribeRequest !== undefined) {
      obj.orderTradeSubscribeRequest = OrderTradeSubscribeRequest.toJSON(
        message.orderTradeSubscribeRequest
      );
    }

    if (message.orderTradeUnsubscribeRequest !== undefined) {
      obj.orderTradeUnsubscribeRequest = OrderTradeUnsubscribeRequest.toJSON(
        message.orderTradeUnsubscribeRequest
      );
    }

    if (message.keepAliveRequest !== undefined) {
      obj.keepAliveRequest = KeepAliveRequest.toJSON(message.keepAliveRequest);
    }

    return obj;
  },
  create(base) {
    return SubscriptionRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSubscriptionRequest();

    message.orderBookSubscribeRequest =
      object.orderBookSubscribeRequest !== undefined &&
      object.orderBookSubscribeRequest !== null
        ? OrderBookSubscribeRequest.fromPartial(
            object.orderBookSubscribeRequest
          )
        : undefined;
    message.orderBookUnsubscribeRequest =
      object.orderBookUnsubscribeRequest !== undefined &&
      object.orderBookUnsubscribeRequest !== null
        ? OrderBookUnsubscribeRequest.fromPartial(
            object.orderBookUnsubscribeRequest
          )
        : undefined;
    message.orderTradeSubscribeRequest =
      object.orderTradeSubscribeRequest !== undefined &&
      object.orderTradeSubscribeRequest !== null
        ? OrderTradeSubscribeRequest.fromPartial(
            object.orderTradeSubscribeRequest
          )
        : undefined;
    message.orderTradeUnsubscribeRequest =
      object.orderTradeUnsubscribeRequest !== undefined &&
      object.orderTradeUnsubscribeRequest !== null
        ? OrderTradeUnsubscribeRequest.fromPartial(
            object.orderTradeUnsubscribeRequest
          )
        : undefined;
    message.keepAliveRequest =
      object.keepAliveRequest !== undefined && object.keepAliveRequest !== null
        ? KeepAliveRequest.fromPartial(object.keepAliveRequest)
        : undefined;

    return message;
  }
};

function createBaseEvent() {
  return {
    order: undefined,
    trade: undefined,
    orderBook: undefined,
    portfolio: undefined,
    response: undefined
  };
}

export const Event = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.order !== undefined) {
      OrderEvent.encode(message.order, writer.uint32(10).fork()).ldelim();
    }

    if (message.trade !== undefined) {
      TradeEvent.encode(message.trade, writer.uint32(18).fork()).ldelim();
    }

    if (message.orderBook !== undefined) {
      OrderBookEvent.encode(
        message.orderBook,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.portfolio !== undefined) {
      PortfolioEvent.encode(
        message.portfolio,
        writer.uint32(42).fork()
      ).ldelim();
    }

    if (message.response !== undefined) {
      ResponseEvent.encode(message.response, writer.uint32(82).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.order = OrderEvent.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.trade = TradeEvent.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.orderBook = OrderBookEvent.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.portfolio = PortfolioEvent.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.response = ResponseEvent.decode(reader, reader.uint32());
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      order: isSet(object.order)
        ? OrderEvent.fromJSON(object.order)
        : undefined,
      trade: isSet(object.trade)
        ? TradeEvent.fromJSON(object.trade)
        : undefined,
      orderBook: isSet(object.orderBook)
        ? OrderBookEvent.fromJSON(object.orderBook)
        : undefined,
      portfolio: isSet(object.portfolio)
        ? PortfolioEvent.fromJSON(object.portfolio)
        : undefined,
      response: isSet(object.response)
        ? ResponseEvent.fromJSON(object.response)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.order !== undefined) {
      obj.order = OrderEvent.toJSON(message.order);
    }

    if (message.trade !== undefined) {
      obj.trade = TradeEvent.toJSON(message.trade);
    }

    if (message.orderBook !== undefined) {
      obj.orderBook = OrderBookEvent.toJSON(message.orderBook);
    }

    if (message.portfolio !== undefined) {
      obj.portfolio = PortfolioEvent.toJSON(message.portfolio);
    }

    if (message.response !== undefined) {
      obj.response = ResponseEvent.toJSON(message.response);
    }

    return obj;
  },
  create(base) {
    return Event.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEvent();

    message.order =
      object.order !== undefined && object.order !== null
        ? OrderEvent.fromPartial(object.order)
        : undefined;
    message.trade =
      object.trade !== undefined && object.trade !== null
        ? TradeEvent.fromPartial(object.trade)
        : undefined;
    message.orderBook =
      object.orderBook !== undefined && object.orderBook !== null
        ? OrderBookEvent.fromPartial(object.orderBook)
        : undefined;
    message.portfolio =
      object.portfolio !== undefined && object.portfolio !== null
        ? PortfolioEvent.fromPartial(object.portfolio)
        : undefined;
    message.response =
      object.response !== undefined && object.response !== null
        ? ResponseEvent.fromPartial(object.response)
        : undefined;

    return message;
  }
};

function createBaseOrderBookSubscribeRequest() {
  return { requestId: '', securityCode: '', securityBoard: '' };
}

export const OrderBookSubscribeRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.requestId !== '') {
      writer.uint32(10).string(message.requestId);
    }

    if (message.securityCode !== '') {
      writer.uint32(18).string(message.securityCode);
    }

    if (message.securityBoard !== '') {
      writer.uint32(26).string(message.securityBoard);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBookSubscribeRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requestId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.securityCode = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.securityBoard = reader.string();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      requestId: isSet(object.requestId)
        ? globalThis.String(object.requestId)
        : '',
      securityCode: isSet(object.securityCode)
        ? globalThis.String(object.securityCode)
        : '',
      securityBoard: isSet(object.securityBoard)
        ? globalThis.String(object.securityBoard)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.requestId !== '') {
      obj.requestId = message.requestId;
    }

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    if (message.securityBoard !== '') {
      obj.securityBoard = message.securityBoard;
    }

    return obj;
  },
  create(base) {
    return OrderBookSubscribeRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderBookSubscribeRequest();

    message.requestId = object.requestId ?? '';
    message.securityCode = object.securityCode ?? '';
    message.securityBoard = object.securityBoard ?? '';

    return message;
  }
};

function createBaseOrderBookUnsubscribeRequest() {
  return { requestId: '', securityCode: '', securityBoard: '' };
}

export const OrderBookUnsubscribeRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.requestId !== '') {
      writer.uint32(10).string(message.requestId);
    }

    if (message.securityCode !== '') {
      writer.uint32(18).string(message.securityCode);
    }

    if (message.securityBoard !== '') {
      writer.uint32(26).string(message.securityBoard);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBookUnsubscribeRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requestId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.securityCode = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.securityBoard = reader.string();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      requestId: isSet(object.requestId)
        ? globalThis.String(object.requestId)
        : '',
      securityCode: isSet(object.securityCode)
        ? globalThis.String(object.securityCode)
        : '',
      securityBoard: isSet(object.securityBoard)
        ? globalThis.String(object.securityBoard)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.requestId !== '') {
      obj.requestId = message.requestId;
    }

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    if (message.securityBoard !== '') {
      obj.securityBoard = message.securityBoard;
    }

    return obj;
  },
  create(base) {
    return OrderBookUnsubscribeRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderBookUnsubscribeRequest();

    message.requestId = object.requestId ?? '';
    message.securityCode = object.securityCode ?? '';
    message.securityBoard = object.securityBoard ?? '';

    return message;
  }
};

function createBaseOrderTradeSubscribeRequest() {
  return {
    requestId: '',
    includeTrades: false,
    includeOrders: false,
    clientIds: []
  };
}

export const OrderTradeSubscribeRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.requestId !== '') {
      writer.uint32(10).string(message.requestId);
    }

    if (message.includeTrades === true) {
      writer.uint32(16).bool(message.includeTrades);
    }

    if (message.includeOrders === true) {
      writer.uint32(24).bool(message.includeOrders);
    }

    for (const v of message.clientIds) {
      writer.uint32(34).string(v);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderTradeSubscribeRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requestId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.includeTrades = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.includeOrders = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.clientIds.push(reader.string());
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      requestId: isSet(object.requestId)
        ? globalThis.String(object.requestId)
        : '',
      includeTrades: isSet(object.includeTrades)
        ? globalThis.Boolean(object.includeTrades)
        : false,
      includeOrders: isSet(object.includeOrders)
        ? globalThis.Boolean(object.includeOrders)
        : false,
      clientIds: globalThis.Array.isArray(object?.clientIds)
        ? object.clientIds.map((e) => globalThis.String(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.requestId !== '') {
      obj.requestId = message.requestId;
    }

    if (message.includeTrades === true) {
      obj.includeTrades = message.includeTrades;
    }

    if (message.includeOrders === true) {
      obj.includeOrders = message.includeOrders;
    }

    if (message.clientIds?.length) {
      obj.clientIds = message.clientIds;
    }

    return obj;
  },
  create(base) {
    return OrderTradeSubscribeRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderTradeSubscribeRequest();

    message.requestId = object.requestId ?? '';
    message.includeTrades = object.includeTrades ?? false;
    message.includeOrders = object.includeOrders ?? false;
    message.clientIds = object.clientIds?.map((e) => e) || [];

    return message;
  }
};

function createBaseOrderTradeUnsubscribeRequest() {
  return { requestId: '' };
}

export const OrderTradeUnsubscribeRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.requestId !== '') {
      writer.uint32(10).string(message.requestId);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderTradeUnsubscribeRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requestId = reader.string();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      requestId: isSet(object.requestId)
        ? globalThis.String(object.requestId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.requestId !== '') {
      obj.requestId = message.requestId;
    }

    return obj;
  },
  create(base) {
    return OrderTradeUnsubscribeRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderTradeUnsubscribeRequest();

    message.requestId = object.requestId ?? '';

    return message;
  }
};

function createBasePortfolioSubscription() {
  return { clientId: '', content: undefined };
}

export const PortfolioSubscription = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    if (message.content !== undefined) {
      PortfolioContent.encode(
        message.content,
        writer.uint32(18).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePortfolioSubscription();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.clientId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.content = PortfolioContent.decode(reader, reader.uint32());
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      clientId: isSet(object.clientId)
        ? globalThis.String(object.clientId)
        : '',
      content: isSet(object.content)
        ? PortfolioContent.fromJSON(object.content)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.content !== undefined) {
      obj.content = PortfolioContent.toJSON(message.content);
    }

    return obj;
  },
  create(base) {
    return PortfolioSubscription.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBasePortfolioSubscription();

    message.clientId = object.clientId ?? '';
    message.content =
      object.content !== undefined && object.content !== null
        ? PortfolioContent.fromPartial(object.content)
        : undefined;

    return message;
  }
};

function createBaseOrderEvent() {
  return {
    orderNo: 0,
    transactionId: 0,
    securityCode: '',
    clientId: '',
    status: 0,
    buySell: 0,
    createdAt: undefined,
    price: 0,
    quantity: 0,
    balance: 0,
    message: '',
    currency: '',
    condition: undefined,
    validBefore: undefined,
    acceptedAt: undefined
  };
}

export const OrderEvent = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.orderNo !== 0) {
      writer.uint32(8).int64(message.orderNo);
    }

    if (message.transactionId !== 0) {
      writer.uint32(16).int32(message.transactionId);
    }

    if (message.securityCode !== '') {
      writer.uint32(26).string(message.securityCode);
    }

    if (message.clientId !== '') {
      writer.uint32(34).string(message.clientId);
    }

    if (message.status !== 0) {
      writer.uint32(40).int32(message.status);
    }

    if (message.buySell !== 0) {
      writer.uint32(48).int32(message.buySell);
    }

    if (message.createdAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.createdAt),
        writer.uint32(58).fork()
      ).ldelim();
    }

    if (message.price !== 0) {
      writer.uint32(65).double(message.price);
    }

    if (message.quantity !== 0) {
      writer.uint32(72).int32(message.quantity);
    }

    if (message.balance !== 0) {
      writer.uint32(80).int32(message.balance);
    }

    if (message.message !== '') {
      writer.uint32(90).string(message.message);
    }

    if (message.currency !== '') {
      writer.uint32(98).string(message.currency);
    }

    if (message.condition !== undefined) {
      OrderCondition.encode(
        message.condition,
        writer.uint32(106).fork()
      ).ldelim();
    }

    if (message.validBefore !== undefined) {
      OrderValidBefore.encode(
        message.validBefore,
        writer.uint32(114).fork()
      ).ldelim();
    }

    if (message.acceptedAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.acceptedAt),
        writer.uint32(122).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.orderNo = longToNumber(reader.int64());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.transactionId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.securityCode = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.clientId = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.status = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.buySell = reader.int32();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.createdAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          continue;
        case 8:
          if (tag !== 65) {
            break;
          }

          message.price = reader.double();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.quantity = reader.int32();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.balance = reader.int32();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.message = reader.string();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.currency = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.condition = OrderCondition.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.validBefore = OrderValidBefore.decode(
            reader,
            reader.uint32()
          );
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.acceptedAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      orderNo: isSet(object.orderNo) ? globalThis.Number(object.orderNo) : 0,
      transactionId: isSet(object.transactionId)
        ? globalThis.Number(object.transactionId)
        : 0,
      securityCode: isSet(object.securityCode)
        ? globalThis.String(object.securityCode)
        : '',
      clientId: isSet(object.clientId)
        ? globalThis.String(object.clientId)
        : '',
      status: isSet(object.status) ? orderStatusFromJSON(object.status) : 0,
      buySell: isSet(object.buySell) ? buySellFromJSON(object.buySell) : 0,
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
      price: isSet(object.price) ? globalThis.Number(object.price) : 0,
      quantity: isSet(object.quantity) ? globalThis.Number(object.quantity) : 0,
      balance: isSet(object.balance) ? globalThis.Number(object.balance) : 0,
      message: isSet(object.message) ? globalThis.String(object.message) : '',
      currency: isSet(object.currency)
        ? globalThis.String(object.currency)
        : '',
      condition: isSet(object.condition)
        ? OrderCondition.fromJSON(object.condition)
        : undefined,
      validBefore: isSet(object.validBefore)
        ? OrderValidBefore.fromJSON(object.validBefore)
        : undefined,
      acceptedAt: isSet(object.acceptedAt)
        ? fromJsonTimestamp(object.acceptedAt)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.orderNo !== 0) {
      obj.orderNo = Math.round(message.orderNo);
    }

    if (message.transactionId !== 0) {
      obj.transactionId = Math.round(message.transactionId);
    }

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.status !== 0) {
      obj.status = orderStatusToJSON(message.status);
    }

    if (message.buySell !== 0) {
      obj.buySell = buySellToJSON(message.buySell);
    }

    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }

    if (message.price !== 0) {
      obj.price = message.price;
    }

    if (message.quantity !== 0) {
      obj.quantity = Math.round(message.quantity);
    }

    if (message.balance !== 0) {
      obj.balance = Math.round(message.balance);
    }

    if (message.message !== '') {
      obj.message = message.message;
    }

    if (message.currency !== '') {
      obj.currency = message.currency;
    }

    if (message.condition !== undefined) {
      obj.condition = OrderCondition.toJSON(message.condition);
    }

    if (message.validBefore !== undefined) {
      obj.validBefore = OrderValidBefore.toJSON(message.validBefore);
    }

    if (message.acceptedAt !== undefined) {
      obj.acceptedAt = message.acceptedAt.toISOString();
    }

    return obj;
  },
  create(base) {
    return OrderEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderEvent();

    message.orderNo = object.orderNo ?? 0;
    message.transactionId = object.transactionId ?? 0;
    message.securityCode = object.securityCode ?? '';
    message.clientId = object.clientId ?? '';
    message.status = object.status ?? 0;
    message.buySell = object.buySell ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.price = object.price ?? 0;
    message.quantity = object.quantity ?? 0;
    message.balance = object.balance ?? 0;
    message.message = object.message ?? '';
    message.currency = object.currency ?? '';
    message.condition =
      object.condition !== undefined && object.condition !== null
        ? OrderCondition.fromPartial(object.condition)
        : undefined;
    message.validBefore =
      object.validBefore !== undefined && object.validBefore !== null
        ? OrderValidBefore.fromPartial(object.validBefore)
        : undefined;
    message.acceptedAt = object.acceptedAt ?? undefined;

    return message;
  }
};

function createBaseTradeEvent() {
  return {
    securityCode: '',
    tradeNo: 0,
    orderNo: 0,
    clientId: '',
    createdAt: undefined,
    quantity: 0,
    price: 0,
    value: 0,
    buySell: 0,
    commission: 0,
    currency: '',
    accruedInterest: 0
  };
}

export const TradeEvent = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.securityCode !== '') {
      writer.uint32(10).string(message.securityCode);
    }

    if (message.tradeNo !== 0) {
      writer.uint32(16).int64(message.tradeNo);
    }

    if (message.orderNo !== 0) {
      writer.uint32(24).int64(message.orderNo);
    }

    if (message.clientId !== '') {
      writer.uint32(34).string(message.clientId);
    }

    if (message.createdAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.createdAt),
        writer.uint32(42).fork()
      ).ldelim();
    }

    if (message.quantity !== 0) {
      writer.uint32(48).int64(message.quantity);
    }

    if (message.price !== 0) {
      writer.uint32(57).double(message.price);
    }

    if (message.value !== 0) {
      writer.uint32(65).double(message.value);
    }

    if (message.buySell !== 0) {
      writer.uint32(72).int32(message.buySell);
    }

    if (message.commission !== 0) {
      writer.uint32(81).double(message.commission);
    }

    if (message.currency !== '') {
      writer.uint32(90).string(message.currency);
    }

    if (message.accruedInterest !== 0) {
      writer.uint32(97).double(message.accruedInterest);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradeEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.securityCode = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.tradeNo = longToNumber(reader.int64());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.orderNo = longToNumber(reader.int64());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.clientId = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.createdAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.quantity = longToNumber(reader.int64());
          continue;
        case 7:
          if (tag !== 57) {
            break;
          }

          message.price = reader.double();
          continue;
        case 8:
          if (tag !== 65) {
            break;
          }

          message.value = reader.double();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.buySell = reader.int32();
          continue;
        case 10:
          if (tag !== 81) {
            break;
          }

          message.commission = reader.double();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.currency = reader.string();
          continue;
        case 12:
          if (tag !== 97) {
            break;
          }

          message.accruedInterest = reader.double();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      securityCode: isSet(object.securityCode)
        ? globalThis.String(object.securityCode)
        : '',
      tradeNo: isSet(object.tradeNo) ? globalThis.Number(object.tradeNo) : 0,
      orderNo: isSet(object.orderNo) ? globalThis.Number(object.orderNo) : 0,
      clientId: isSet(object.clientId)
        ? globalThis.String(object.clientId)
        : '',
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
      quantity: isSet(object.quantity) ? globalThis.Number(object.quantity) : 0,
      price: isSet(object.price) ? globalThis.Number(object.price) : 0,
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
      buySell: isSet(object.buySell) ? buySellFromJSON(object.buySell) : 0,
      commission: isSet(object.commission)
        ? globalThis.Number(object.commission)
        : 0,
      currency: isSet(object.currency)
        ? globalThis.String(object.currency)
        : '',
      accruedInterest: isSet(object.accruedInterest)
        ? globalThis.Number(object.accruedInterest)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    if (message.tradeNo !== 0) {
      obj.tradeNo = Math.round(message.tradeNo);
    }

    if (message.orderNo !== 0) {
      obj.orderNo = Math.round(message.orderNo);
    }

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }

    if (message.quantity !== 0) {
      obj.quantity = Math.round(message.quantity);
    }

    if (message.price !== 0) {
      obj.price = message.price;
    }

    if (message.value !== 0) {
      obj.value = message.value;
    }

    if (message.buySell !== 0) {
      obj.buySell = buySellToJSON(message.buySell);
    }

    if (message.commission !== 0) {
      obj.commission = message.commission;
    }

    if (message.currency !== '') {
      obj.currency = message.currency;
    }

    if (message.accruedInterest !== 0) {
      obj.accruedInterest = message.accruedInterest;
    }

    return obj;
  },
  create(base) {
    return TradeEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseTradeEvent();

    message.securityCode = object.securityCode ?? '';
    message.tradeNo = object.tradeNo ?? 0;
    message.orderNo = object.orderNo ?? 0;
    message.clientId = object.clientId ?? '';
    message.createdAt = object.createdAt ?? undefined;
    message.quantity = object.quantity ?? 0;
    message.price = object.price ?? 0;
    message.value = object.value ?? 0;
    message.buySell = object.buySell ?? 0;
    message.commission = object.commission ?? 0;
    message.currency = object.currency ?? '';
    message.accruedInterest = object.accruedInterest ?? 0;

    return message;
  }
};

function createBaseOrderBookRow() {
  return { price: 0, quantity: 0 };
}

export const OrderBookRow = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.price !== 0) {
      writer.uint32(9).double(message.price);
    }

    if (message.quantity !== 0) {
      writer.uint32(16).int64(message.quantity);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBookRow();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 9) {
            break;
          }

          message.price = reader.double();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.quantity = longToNumber(reader.int64());
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      price: isSet(object.p) ? globalThis.Number(object.p) : 0,
      quantity: isSet(object.q) ? globalThis.Number(object.q) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.price !== 0) {
      obj.p = message.price;
    }

    if (message.quantity !== 0) {
      obj.q = Math.round(message.quantity);
    }

    return obj;
  },
  create(base) {
    return OrderBookRow.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderBookRow();

    message.price = object.price ?? 0;
    message.quantity = object.quantity ?? 0;

    return message;
  }
};

function createBaseOrderBookEvent() {
  return { securityCode: '', securityBoard: '', asks: [], bids: [] };
}

export const OrderBookEvent = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.securityCode !== '') {
      writer.uint32(10).string(message.securityCode);
    }

    if (message.securityBoard !== '') {
      writer.uint32(18).string(message.securityBoard);
    }

    for (const v of message.asks) {
      OrderBookRow.encode(v, writer.uint32(26).fork()).ldelim();
    }

    for (const v of message.bids) {
      OrderBookRow.encode(v, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBookEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.securityCode = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.securityBoard = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.asks.push(OrderBookRow.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.bids.push(OrderBookRow.decode(reader, reader.uint32()));
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      securityCode: isSet(object.securityCode)
        ? globalThis.String(object.securityCode)
        : '',
      securityBoard: isSet(object.securityBoard)
        ? globalThis.String(object.securityBoard)
        : '',
      asks: globalThis.Array.isArray(object?.asks)
        ? object.asks.map((e) => OrderBookRow.fromJSON(e))
        : [],
      bids: globalThis.Array.isArray(object?.bids)
        ? object.bids.map((e) => OrderBookRow.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    if (message.securityBoard !== '') {
      obj.securityBoard = message.securityBoard;
    }

    if (message.asks?.length) {
      obj.asks = message.asks.map((e) => OrderBookRow.toJSON(e));
    }

    if (message.bids?.length) {
      obj.bids = message.bids.map((e) => OrderBookRow.toJSON(e));
    }

    return obj;
  },
  create(base) {
    return OrderBookEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderBookEvent();

    message.securityCode = object.securityCode ?? '';
    message.securityBoard = object.securityBoard ?? '';
    message.asks = object.asks?.map((e) => OrderBookRow.fromPartial(e)) || [];
    message.bids = object.bids?.map((e) => OrderBookRow.fromPartial(e)) || [];

    return message;
  }
};

function createBasePortfolioEvent() {
  return {
    clientId: '',
    content: undefined,
    equity: 0,
    balance: 0,
    positions: [],
    currencies: [],
    money: []
  };
}

export const PortfolioEvent = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    if (message.content !== undefined) {
      PortfolioContent.encode(
        message.content,
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.equity !== 0) {
      writer.uint32(25).double(message.equity);
    }

    if (message.balance !== 0) {
      writer.uint32(33).double(message.balance);
    }

    for (const v of message.positions) {
      PositionRow.encode(v, writer.uint32(42).fork()).ldelim();
    }

    for (const v of message.currencies) {
      CurrencyRow.encode(v, writer.uint32(50).fork()).ldelim();
    }

    for (const v of message.money) {
      MoneyRow.encode(v, writer.uint32(58).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePortfolioEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.clientId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.content = PortfolioContent.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.equity = reader.double();
          continue;
        case 4:
          if (tag !== 33) {
            break;
          }

          message.balance = reader.double();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.positions.push(PositionRow.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.currencies.push(CurrencyRow.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.money.push(MoneyRow.decode(reader, reader.uint32()));
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      clientId: isSet(object.clientId)
        ? globalThis.String(object.clientId)
        : '',
      content: isSet(object.content)
        ? PortfolioContent.fromJSON(object.content)
        : undefined,
      equity: isSet(object.equity) ? globalThis.Number(object.equity) : 0,
      balance: isSet(object.balance) ? globalThis.Number(object.balance) : 0,
      positions: globalThis.Array.isArray(object?.positions)
        ? object.positions.map((e) => PositionRow.fromJSON(e))
        : [],
      currencies: globalThis.Array.isArray(object?.currencies)
        ? object.currencies.map((e) => CurrencyRow.fromJSON(e))
        : [],
      money: globalThis.Array.isArray(object?.money)
        ? object.money.map((e) => MoneyRow.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.content !== undefined) {
      obj.content = PortfolioContent.toJSON(message.content);
    }

    if (message.equity !== 0) {
      obj.equity = message.equity;
    }

    if (message.balance !== 0) {
      obj.balance = message.balance;
    }

    if (message.positions?.length) {
      obj.positions = message.positions.map((e) => PositionRow.toJSON(e));
    }

    if (message.currencies?.length) {
      obj.currencies = message.currencies.map((e) => CurrencyRow.toJSON(e));
    }

    if (message.money?.length) {
      obj.money = message.money.map((e) => MoneyRow.toJSON(e));
    }

    return obj;
  },
  create(base) {
    return PortfolioEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBasePortfolioEvent();

    message.clientId = object.clientId ?? '';
    message.content =
      object.content !== undefined && object.content !== null
        ? PortfolioContent.fromPartial(object.content)
        : undefined;
    message.equity = object.equity ?? 0;
    message.balance = object.balance ?? 0;
    message.positions =
      object.positions?.map((e) => PositionRow.fromPartial(e)) || [];
    message.currencies =
      object.currencies?.map((e) => CurrencyRow.fromPartial(e)) || [];
    message.money = object.money?.map((e) => MoneyRow.fromPartial(e)) || [];

    return message;
  }
};

function createBaseKeepAliveRequest() {
  return { requestId: '' };
}

export const KeepAliveRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.requestId !== '') {
      writer.uint32(10).string(message.requestId);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseKeepAliveRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requestId = reader.string();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      requestId: isSet(object.requestId)
        ? globalThis.String(object.requestId)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.requestId !== '') {
      obj.requestId = message.requestId;
    }

    return obj;
  },
  create(base) {
    return KeepAliveRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseKeepAliveRequest();

    message.requestId = object.requestId ?? '';

    return message;
  }
};

function toTimestamp(date) {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;

  return { seconds, nanos };
}

function fromTimestamp(t) {
  let millis = (t.seconds || 0) * 1_000;

  millis += (t.nanos || 0) / 1_000_000;

  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o) {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === 'string') {
    return new globalThis.Date(o);
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

export const EventsDefinition = {
  name: 'Events',
  fullName: 'grpc.tradeapi.v1.Events',
  methods: {
    GetEvents: {
      name: 'GetEvents',
      requestType: SubscriptionRequest,
      requestStream: false,
      responseType: Event,
      responseStream: true,
      options: {}
    }
  }
};
