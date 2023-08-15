import Long from '../../../salt/states/ppp/lib/vendor/long.min.js';
import protobuf from '../../protobuf/minimal.js';
import { Timestamp } from './google/protobuf/timestamp.js';

export const protobufPackage = 'tinkoff.public.invest.api.contract.v1';
/** Режим торгов инструмента */
export var SecurityTradingStatus;
(function (SecurityTradingStatus) {
  /** SECURITY_TRADING_STATUS_UNSPECIFIED - Торговый статус не определён */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_UNSPECIFIED'] = 0)
  ] = 'SECURITY_TRADING_STATUS_UNSPECIFIED';
  /** SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING - Недоступен для торгов */
  SecurityTradingStatus[
    (SecurityTradingStatus[
      'SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING'
    ] = 1)
  ] = 'SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING';
  /** SECURITY_TRADING_STATUS_OPENING_PERIOD - Период открытия торгов */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_OPENING_PERIOD'] = 2)
  ] = 'SECURITY_TRADING_STATUS_OPENING_PERIOD';
  /** SECURITY_TRADING_STATUS_CLOSING_PERIOD - Период закрытия торгов */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_CLOSING_PERIOD'] = 3)
  ] = 'SECURITY_TRADING_STATUS_CLOSING_PERIOD';
  /** SECURITY_TRADING_STATUS_BREAK_IN_TRADING - Перерыв в торговле */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_BREAK_IN_TRADING'] = 4)
  ] = 'SECURITY_TRADING_STATUS_BREAK_IN_TRADING';
  /** SECURITY_TRADING_STATUS_NORMAL_TRADING - Нормальная торговля */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_NORMAL_TRADING'] = 5)
  ] = 'SECURITY_TRADING_STATUS_NORMAL_TRADING';
  /** SECURITY_TRADING_STATUS_CLOSING_AUCTION - Аукцион закрытия */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_CLOSING_AUCTION'] = 6)
  ] = 'SECURITY_TRADING_STATUS_CLOSING_AUCTION';
  /** SECURITY_TRADING_STATUS_DARK_POOL_AUCTION - Аукцион крупных пакетов */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_DARK_POOL_AUCTION'] = 7)
  ] = 'SECURITY_TRADING_STATUS_DARK_POOL_AUCTION';
  /** SECURITY_TRADING_STATUS_DISCRETE_AUCTION - Дискретный аукцион */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_DISCRETE_AUCTION'] = 8)
  ] = 'SECURITY_TRADING_STATUS_DISCRETE_AUCTION';
  /** SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD - Аукцион открытия */
  SecurityTradingStatus[
    (SecurityTradingStatus[
      'SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD'
    ] = 9)
  ] = 'SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD';
  /** SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE - Период торгов по цене аукциона закрытия */
  SecurityTradingStatus[
    (SecurityTradingStatus[
      'SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE'
    ] = 10)
  ] = 'SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE';
  /** SECURITY_TRADING_STATUS_SESSION_ASSIGNED - Сессия назначена */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_SESSION_ASSIGNED'] = 11)
  ] = 'SECURITY_TRADING_STATUS_SESSION_ASSIGNED';
  /** SECURITY_TRADING_STATUS_SESSION_CLOSE - Сессия закрыта */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_SESSION_CLOSE'] = 12)
  ] = 'SECURITY_TRADING_STATUS_SESSION_CLOSE';
  /** SECURITY_TRADING_STATUS_SESSION_OPEN - Сессия открыта */
  SecurityTradingStatus[
    (SecurityTradingStatus['SECURITY_TRADING_STATUS_SESSION_OPEN'] = 13)
  ] = 'SECURITY_TRADING_STATUS_SESSION_OPEN';
  /** SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING - Доступна торговля в режиме внутренней ликвидности брокера */
  SecurityTradingStatus[
    (SecurityTradingStatus[
      'SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING'
    ] = 14)
  ] = 'SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING';
  /** SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING - Перерыв торговли в режиме внутренней ликвидности брокера */
  SecurityTradingStatus[
    (SecurityTradingStatus[
      'SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING'
    ] = 15)
  ] = 'SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING';
  /** SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING - Недоступна торговля в режиме внутренней ликвидности брокера */
  SecurityTradingStatus[
    (SecurityTradingStatus[
      'SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING'
    ] = 16)
  ] = 'SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING';
  SecurityTradingStatus[(SecurityTradingStatus['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(SecurityTradingStatus || (SecurityTradingStatus = {}));

export function securityTradingStatusFromJSON(object) {
  switch (object) {
    case 0:
    case 'SECURITY_TRADING_STATUS_UNSPECIFIED':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_UNSPECIFIED;
    case 1:
    case 'SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING;
    case 2:
    case 'SECURITY_TRADING_STATUS_OPENING_PERIOD':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_OPENING_PERIOD;
    case 3:
    case 'SECURITY_TRADING_STATUS_CLOSING_PERIOD':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_CLOSING_PERIOD;
    case 4:
    case 'SECURITY_TRADING_STATUS_BREAK_IN_TRADING':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_BREAK_IN_TRADING;
    case 5:
    case 'SECURITY_TRADING_STATUS_NORMAL_TRADING':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING;
    case 6:
    case 'SECURITY_TRADING_STATUS_CLOSING_AUCTION':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_CLOSING_AUCTION;
    case 7:
    case 'SECURITY_TRADING_STATUS_DARK_POOL_AUCTION':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_DARK_POOL_AUCTION;
    case 8:
    case 'SECURITY_TRADING_STATUS_DISCRETE_AUCTION':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_DISCRETE_AUCTION;
    case 9:
    case 'SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD;
    case 10:
    case 'SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE;
    case 11:
    case 'SECURITY_TRADING_STATUS_SESSION_ASSIGNED':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_ASSIGNED;
    case 12:
    case 'SECURITY_TRADING_STATUS_SESSION_CLOSE':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_CLOSE;
    case 13:
    case 'SECURITY_TRADING_STATUS_SESSION_OPEN':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_OPEN;
    case 14:
    case 'SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING;
    case 15:
    case 'SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING;
    case 16:
    case 'SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING':
      return SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return SecurityTradingStatus.UNRECOGNIZED;
  }
}

export function securityTradingStatusToJSON(object) {
  switch (object) {
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_UNSPECIFIED:
      return 'SECURITY_TRADING_STATUS_UNSPECIFIED';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING:
      return 'SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_OPENING_PERIOD:
      return 'SECURITY_TRADING_STATUS_OPENING_PERIOD';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_CLOSING_PERIOD:
      return 'SECURITY_TRADING_STATUS_CLOSING_PERIOD';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_BREAK_IN_TRADING:
      return 'SECURITY_TRADING_STATUS_BREAK_IN_TRADING';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING:
      return 'SECURITY_TRADING_STATUS_NORMAL_TRADING';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_CLOSING_AUCTION:
      return 'SECURITY_TRADING_STATUS_CLOSING_AUCTION';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_DARK_POOL_AUCTION:
      return 'SECURITY_TRADING_STATUS_DARK_POOL_AUCTION';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_DISCRETE_AUCTION:
      return 'SECURITY_TRADING_STATUS_DISCRETE_AUCTION';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD:
      return 'SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE:
      return 'SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_ASSIGNED:
      return 'SECURITY_TRADING_STATUS_SESSION_ASSIGNED';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_CLOSE:
      return 'SECURITY_TRADING_STATUS_SESSION_CLOSE';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_OPEN:
      return 'SECURITY_TRADING_STATUS_SESSION_OPEN';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING:
      return 'SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING:
      return 'SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING';
    case SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING:
      return 'SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING';
    case SecurityTradingStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

function createBaseMoneyValue() {
  return { currency: '', units: 0, nano: 0 };
}

export const MoneyValue = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.currency !== '') {
      writer.uint32(10).string(message.currency);
    }

    if (message.units !== 0) {
      writer.uint32(16).int64(message.units);
    }

    if (message.nano !== 0) {
      writer.uint32(24).int32(message.nano);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoneyValue();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.currency = reader.string();

          break;
        case 2:
          message.units = longToNumber(reader.int64());

          break;
        case 3:
          message.nano = reader.int32();

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
      currency: isSet(object.currency) ? String(object.currency) : '',
      units: isSet(object.units) ? Number(object.units) : 0,
      nano: isSet(object.nano) ? Number(object.nano) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    message.currency !== undefined && (obj.currency = message.currency);
    message.units !== undefined && (obj.units = Math.round(message.units));
    message.nano !== undefined && (obj.nano = Math.round(message.nano));

    return obj;
  }
};

function createBaseQuotation() {
  return { units: 0, nano: 0 };
}

export const Quotation = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.units !== 0) {
      writer.uint32(8).int64(message.units);
    }

    if (message.nano !== 0) {
      writer.uint32(16).int32(message.nano);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuotation();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.units = longToNumber(reader.int64());

          break;
        case 2:
          message.nano = reader.int32();

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
      units: isSet(object.units) ? Number(object.units) : 0,
      nano: isSet(object.nano) ? Number(object.nano) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    message.units !== undefined && (obj.units = Math.round(message.units));
    message.nano !== undefined && (obj.nano = Math.round(message.nano));

    return obj;
  }
};

function createBasePing() {
  return { time: undefined };
}

export const Ping = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(10).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePing();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
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
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.time !== undefined && (obj.time = message.time.toISOString());

    return obj;
  }
};

function toTimestamp(date) {
  const seconds = date.getTime() / 1000;
  const nanos = (date.getTime() % 1000) * 1000000;

  return { seconds, nanos };
}

function fromTimestamp(t) {
  let millis = t.seconds * 1000;

  millis += t.nanos / 1000000;

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
