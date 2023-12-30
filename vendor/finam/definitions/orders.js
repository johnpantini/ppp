import Long from '../../long.min.js';
import protobuf from '../../protobuf/minimal.js';
import { Timestamp } from '../../tinkoff/definitions/google/protobuf/timestamp.js';
import { DoubleValue } from '../../tinkoff/definitions/google/protobuf/wrappers.js';
import {
  buySellFromJSON,
  buySellToJSON,
  marketFromJSON,
  marketToJSON,
  OrderValidBefore
} from './common.js';

export const protobufPackage = 'proto.tradeapi.v1';

/**
 * Order placement properties.
 * Поведение заявки при выставлении в стакан.
 */
export var OrderProperty;
(function (OrderProperty) {
  /**
   * ORDER_PROPERTY_UNSPECIFIED - Value is not specified. Do not use.
   * Значение не указано. Не использовать.
   */
  OrderProperty[(OrderProperty['ORDER_PROPERTY_UNSPECIFIED'] = 0)] =
    'ORDER_PROPERTY_UNSPECIFIED';
  /**
   * ORDER_PROPERTY_PUT_IN_QUEUE - The residual of partially matched order is to stay in OrderBook.
   * Неисполненная часть заявки помещается в очередь заявок биржи.
   */
  OrderProperty[(OrderProperty['ORDER_PROPERTY_PUT_IN_QUEUE'] = 1)] =
    'ORDER_PROPERTY_PUT_IN_QUEUE';
  /**
   * ORDER_PROPERTY_CANCEL_BALANCE - The residual of partially matched order is to be cancelled.
   * Неисполненная часть заявки снимается с торгов.
   */
  OrderProperty[(OrderProperty['ORDER_PROPERTY_CANCEL_BALANCE'] = 2)] =
    'ORDER_PROPERTY_CANCEL_BALANCE';
  /**
   * ORDER_PROPERTY_IMM_OR_CANCEL - Filling the order only in case the posibility of immediate and full execution.
   * Сделки совершаются только в том случае, если заявка может быть удовлетворена полностью и сразу при выставлении.
   */
  OrderProperty[(OrderProperty['ORDER_PROPERTY_IMM_OR_CANCEL'] = 3)] =
    'ORDER_PROPERTY_IMM_OR_CANCEL';
  OrderProperty[(OrderProperty['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(OrderProperty || (OrderProperty = {}));
export function orderPropertyFromJSON(object) {
  switch (object) {
    case 0:
    case 'ORDER_PROPERTY_UNSPECIFIED':
      return OrderProperty.ORDER_PROPERTY_UNSPECIFIED;
    case 1:
    case 'ORDER_PROPERTY_PUT_IN_QUEUE':
      return OrderProperty.ORDER_PROPERTY_PUT_IN_QUEUE;
    case 2:
    case 'ORDER_PROPERTY_CANCEL_BALANCE':
      return OrderProperty.ORDER_PROPERTY_CANCEL_BALANCE;
    case 3:
    case 'ORDER_PROPERTY_IMM_OR_CANCEL':
      return OrderProperty.ORDER_PROPERTY_IMM_OR_CANCEL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OrderProperty.UNRECOGNIZED;
  }
}
export function orderPropertyToJSON(object) {
  switch (object) {
    case OrderProperty.ORDER_PROPERTY_UNSPECIFIED:
      return 'ORDER_PROPERTY_UNSPECIFIED';
    case OrderProperty.ORDER_PROPERTY_PUT_IN_QUEUE:
      return 'ORDER_PROPERTY_PUT_IN_QUEUE';
    case OrderProperty.ORDER_PROPERTY_CANCEL_BALANCE:
      return 'ORDER_PROPERTY_CANCEL_BALANCE';
    case OrderProperty.ORDER_PROPERTY_IMM_OR_CANCEL:
      return 'ORDER_PROPERTY_IMM_OR_CANCEL';
    case OrderProperty.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * Conditional order types.
 * Типы условных ордеров.
 */
export var OrderConditionType;
(function (OrderConditionType) {
  /**
   * ORDER_CONDITION_TYPE_UNSPECIFIED - Value is not specified. Do not use.
   * Значение не указано. Не использовать.
   */
  OrderConditionType[
    (OrderConditionType['ORDER_CONDITION_TYPE_UNSPECIFIED'] = 0)
  ] = 'ORDER_CONDITION_TYPE_UNSPECIFIED';
  /**
   * ORDER_CONDITION_TYPE_BID - Best Bid.
   * Лучшая цена покупки.
   */
  OrderConditionType[(OrderConditionType['ORDER_CONDITION_TYPE_BID'] = 1)] =
    'ORDER_CONDITION_TYPE_BID';
  /**
   * ORDER_CONDITION_TYPE_BID_OR_LAST - Best Bid or Last trade price and higher.
   * Лучшая цена покупки или сделка по заданной цене и выше.
   */
  OrderConditionType[
    (OrderConditionType['ORDER_CONDITION_TYPE_BID_OR_LAST'] = 2)
  ] = 'ORDER_CONDITION_TYPE_BID_OR_LAST';
  /**
   * ORDER_CONDITION_TYPE_ASK - Best Ask.
   * Лучшая цена продажи.
   */
  OrderConditionType[(OrderConditionType['ORDER_CONDITION_TYPE_ASK'] = 3)] =
    'ORDER_CONDITION_TYPE_ASK';
  /**
   * ORDER_CONDITION_TYPE_ASK_OR_LAST - Best Ask or Last trade price and lower.
   * Лучшая цена продажи или сделка по заданной цене и ниже.
   */
  OrderConditionType[
    (OrderConditionType['ORDER_CONDITION_TYPE_ASK_OR_LAST'] = 4)
  ] = 'ORDER_CONDITION_TYPE_ASK_OR_LAST';
  /**
   * ORDER_CONDITION_TYPE_TIME - Placement time. Parameter OrderCondition.time must be set.
   * Время выставления заявки на Биржу. Параметр OrderCondition.time должен быть установлен.
   */
  OrderConditionType[(OrderConditionType['ORDER_CONDITION_TYPE_TIME'] = 5)] =
    'ORDER_CONDITION_TYPE_TIME';
  /**
   * ORDER_CONDITION_TYPE_COV_DOWN - Coverage below specified.
   * Обеспеченность ниже заданной.
   */
  OrderConditionType[
    (OrderConditionType['ORDER_CONDITION_TYPE_COV_DOWN'] = 6)
  ] = 'ORDER_CONDITION_TYPE_COV_DOWN';
  /**
   * ORDER_CONDITION_TYPE_COV_UP - Coverage above specified.
   * Обеспеченность выше заданной.
   */
  OrderConditionType[(OrderConditionType['ORDER_CONDITION_TYPE_COV_UP'] = 7)] =
    'ORDER_CONDITION_TYPE_COV_UP';
  /**
   * ORDER_CONDITION_TYPE_LAST_UP - Last trade price and higher.
   * Сделка на рынке по заданной цене или выше.
   */
  OrderConditionType[(OrderConditionType['ORDER_CONDITION_TYPE_LAST_UP'] = 8)] =
    'ORDER_CONDITION_TYPE_LAST_UP';
  /**
   * ORDER_CONDITION_TYPE_LAST_DOWN - Last trade price and lower.
   * Сделка на рынке по заданной цене или ниже.
   */
  OrderConditionType[
    (OrderConditionType['ORDER_CONDITION_TYPE_LAST_DOWN'] = 9)
  ] = 'ORDER_CONDITION_TYPE_LAST_DOWN';
  OrderConditionType[(OrderConditionType['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(OrderConditionType || (OrderConditionType = {}));
export function orderConditionTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'ORDER_CONDITION_TYPE_UNSPECIFIED':
      return OrderConditionType.ORDER_CONDITION_TYPE_UNSPECIFIED;
    case 1:
    case 'ORDER_CONDITION_TYPE_BID':
      return OrderConditionType.ORDER_CONDITION_TYPE_BID;
    case 2:
    case 'ORDER_CONDITION_TYPE_BID_OR_LAST':
      return OrderConditionType.ORDER_CONDITION_TYPE_BID_OR_LAST;
    case 3:
    case 'ORDER_CONDITION_TYPE_ASK':
      return OrderConditionType.ORDER_CONDITION_TYPE_ASK;
    case 4:
    case 'ORDER_CONDITION_TYPE_ASK_OR_LAST':
      return OrderConditionType.ORDER_CONDITION_TYPE_ASK_OR_LAST;
    case 5:
    case 'ORDER_CONDITION_TYPE_TIME':
      return OrderConditionType.ORDER_CONDITION_TYPE_TIME;
    case 6:
    case 'ORDER_CONDITION_TYPE_COV_DOWN':
      return OrderConditionType.ORDER_CONDITION_TYPE_COV_DOWN;
    case 7:
    case 'ORDER_CONDITION_TYPE_COV_UP':
      return OrderConditionType.ORDER_CONDITION_TYPE_COV_UP;
    case 8:
    case 'ORDER_CONDITION_TYPE_LAST_UP':
      return OrderConditionType.ORDER_CONDITION_TYPE_LAST_UP;
    case 9:
    case 'ORDER_CONDITION_TYPE_LAST_DOWN':
      return OrderConditionType.ORDER_CONDITION_TYPE_LAST_DOWN;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OrderConditionType.UNRECOGNIZED;
  }
}
export function orderConditionTypeToJSON(object) {
  switch (object) {
    case OrderConditionType.ORDER_CONDITION_TYPE_UNSPECIFIED:
      return 'ORDER_CONDITION_TYPE_UNSPECIFIED';
    case OrderConditionType.ORDER_CONDITION_TYPE_BID:
      return 'ORDER_CONDITION_TYPE_BID';
    case OrderConditionType.ORDER_CONDITION_TYPE_BID_OR_LAST:
      return 'ORDER_CONDITION_TYPE_BID_OR_LAST';
    case OrderConditionType.ORDER_CONDITION_TYPE_ASK:
      return 'ORDER_CONDITION_TYPE_ASK';
    case OrderConditionType.ORDER_CONDITION_TYPE_ASK_OR_LAST:
      return 'ORDER_CONDITION_TYPE_ASK_OR_LAST';
    case OrderConditionType.ORDER_CONDITION_TYPE_TIME:
      return 'ORDER_CONDITION_TYPE_TIME';
    case OrderConditionType.ORDER_CONDITION_TYPE_COV_DOWN:
      return 'ORDER_CONDITION_TYPE_COV_DOWN';
    case OrderConditionType.ORDER_CONDITION_TYPE_COV_UP:
      return 'ORDER_CONDITION_TYPE_COV_UP';
    case OrderConditionType.ORDER_CONDITION_TYPE_LAST_UP:
      return 'ORDER_CONDITION_TYPE_LAST_UP';
    case OrderConditionType.ORDER_CONDITION_TYPE_LAST_DOWN:
      return 'ORDER_CONDITION_TYPE_LAST_DOWN';
    case OrderConditionType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * Order status.
 * Состояние заявки.
 */
export var OrderStatus;
(function (OrderStatus) {
  /**
   * ORDER_STATUS_UNSPECIFIED - Value is not specified. Do not use.
   * Значение не указано. Не использовать.
   */
  OrderStatus[(OrderStatus['ORDER_STATUS_UNSPECIFIED'] = 0)] =
    'ORDER_STATUS_UNSPECIFIED';
  /**
   * ORDER_STATUS_NONE - Order is not in OrderBook.
   * Заявка не выставлена.
   */
  OrderStatus[(OrderStatus['ORDER_STATUS_NONE'] = 1)] = 'ORDER_STATUS_NONE';
  /**
   * ORDER_STATUS_ACTIVE - Order is in OrderBook.
   * Заявка выставлена.
   */
  OrderStatus[(OrderStatus['ORDER_STATUS_ACTIVE'] = 2)] = 'ORDER_STATUS_ACTIVE';
  /**
   * ORDER_STATUS_CANCELLED - Order is canceled.
   * Заявка отменена.
   */
  OrderStatus[(OrderStatus['ORDER_STATUS_CANCELLED'] = 3)] =
    'ORDER_STATUS_CANCELLED';
  /**
   * ORDER_STATUS_MATCHED - Order is matched.
   * Заявка исполнена.
   */
  OrderStatus[(OrderStatus['ORDER_STATUS_MATCHED'] = 4)] =
    'ORDER_STATUS_MATCHED';
  OrderStatus[(OrderStatus['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(OrderStatus || (OrderStatus = {}));
export function orderStatusFromJSON(object) {
  switch (object) {
    case 0:
    case 'ORDER_STATUS_UNSPECIFIED':
      return OrderStatus.ORDER_STATUS_UNSPECIFIED;
    case 1:
    case 'ORDER_STATUS_NONE':
      return OrderStatus.ORDER_STATUS_NONE;
    case 2:
    case 'ORDER_STATUS_ACTIVE':
      return OrderStatus.ORDER_STATUS_ACTIVE;
    case 3:
    case 'ORDER_STATUS_CANCELLED':
      return OrderStatus.ORDER_STATUS_CANCELLED;
    case 4:
    case 'ORDER_STATUS_MATCHED':
      return OrderStatus.ORDER_STATUS_MATCHED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OrderStatus.UNRECOGNIZED;
  }
}
export function orderStatusToJSON(object) {
  switch (object) {
    case OrderStatus.ORDER_STATUS_UNSPECIFIED:
      return 'ORDER_STATUS_UNSPECIFIED';
    case OrderStatus.ORDER_STATUS_NONE:
      return 'ORDER_STATUS_NONE';
    case OrderStatus.ORDER_STATUS_ACTIVE:
      return 'ORDER_STATUS_ACTIVE';
    case OrderStatus.ORDER_STATUS_CANCELLED:
      return 'ORDER_STATUS_CANCELLED';
    case OrderStatus.ORDER_STATUS_MATCHED:
      return 'ORDER_STATUS_MATCHED';
    case OrderStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

function createBaseOrderCondition() {
  return { type: 0, price: 0, time: undefined };
}

export const OrderCondition = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }

    if (message.price !== 0) {
      writer.uint32(17).double(message.price);
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(26).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderCondition();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.price = reader.double();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.time = fromTimestamp(
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
      type: isSet(object.type) ? orderConditionTypeFromJSON(object.type) : 0,
      price: isSet(object.price) ? globalThis.Number(object.price) : 0,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.type !== 0) {
      obj.type = orderConditionTypeToJSON(message.type);
    }

    if (message.price !== 0) {
      obj.price = message.price;
    }

    if (message.time !== undefined) {
      obj.time = message.time.toISOString();
    }

    return obj;
  },
  create(base) {
    return OrderCondition.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderCondition();

    message.type = object.type ?? 0;
    message.price = object.price ?? 0;
    message.time = object.time ?? undefined;

    return message;
  }
};

function createBaseNewOrderRequest() {
  return {
    clientId: '',
    securityBoard: '',
    securityCode: '',
    buySell: 0,
    quantity: 0,
    useCredit: false,
    price: undefined,
    property: 0,
    condition: undefined,
    validBefore: undefined
  };
}

export const NewOrderRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    if (message.securityBoard !== '') {
      writer.uint32(18).string(message.securityBoard);
    }

    if (message.securityCode !== '') {
      writer.uint32(26).string(message.securityCode);
    }

    if (message.buySell !== 0) {
      writer.uint32(32).int32(message.buySell);
    }

    if (message.quantity !== 0) {
      writer.uint32(40).int32(message.quantity);
    }

    if (message.useCredit === true) {
      writer.uint32(48).bool(message.useCredit);
    }

    if (message.price !== undefined) {
      DoubleValue.encode(
        { value: message.price },
        writer.uint32(58).fork()
      ).ldelim();
    }

    if (message.property !== 0) {
      writer.uint32(64).int32(message.property);
    }

    if (message.condition !== undefined) {
      OrderCondition.encode(
        message.condition,
        writer.uint32(74).fork()
      ).ldelim();
    }

    if (message.validBefore !== undefined) {
      OrderValidBefore.encode(
        message.validBefore,
        writer.uint32(82).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewOrderRequest();

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

          message.securityBoard = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.securityCode = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.buySell = reader.int32();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.quantity = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.useCredit = reader.bool();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.price = DoubleValue.decode(reader, reader.uint32()).value;
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.property = reader.int32();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.condition = OrderCondition.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.validBefore = OrderValidBefore.decode(
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
      clientId: isSet(object.clientId)
        ? globalThis.String(object.clientId)
        : '',
      securityBoard: isSet(object.securityBoard)
        ? globalThis.String(object.securityBoard)
        : '',
      securityCode: isSet(object.securityCode)
        ? globalThis.String(object.securityCode)
        : '',
      buySell: isSet(object.buySell) ? buySellFromJSON(object.buySell) : 0,
      quantity: isSet(object.quantity) ? globalThis.Number(object.quantity) : 0,
      useCredit: isSet(object.useCredit)
        ? globalThis.Boolean(object.useCredit)
        : false,
      price: isSet(object.price) ? Number(object.price) : undefined,
      property: isSet(object.property)
        ? orderPropertyFromJSON(object.property)
        : 0,
      condition: isSet(object.condition)
        ? OrderCondition.fromJSON(object.condition)
        : undefined,
      validBefore: isSet(object.validBefore)
        ? OrderValidBefore.fromJSON(object.validBefore)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.securityBoard !== '') {
      obj.securityBoard = message.securityBoard;
    }

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    if (message.buySell !== 0) {
      obj.buySell = buySellToJSON(message.buySell);
    }

    if (message.quantity !== 0) {
      obj.quantity = Math.round(message.quantity);
    }

    if (message.useCredit === true) {
      obj.useCredit = message.useCredit;
    }

    if (message.price !== undefined) {
      obj.price = message.price;
    }

    if (message.property !== 0) {
      obj.property = orderPropertyToJSON(message.property);
    }

    if (message.condition !== undefined) {
      obj.condition = OrderCondition.toJSON(message.condition);
    }

    if (message.validBefore !== undefined) {
      obj.validBefore = OrderValidBefore.toJSON(message.validBefore);
    }

    return obj;
  },
  create(base) {
    return NewOrderRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseNewOrderRequest();

    message.clientId = object.clientId ?? '';
    message.securityBoard = object.securityBoard ?? '';
    message.securityCode = object.securityCode ?? '';
    message.buySell = object.buySell ?? 0;
    message.quantity = object.quantity ?? 0;
    message.useCredit = object.useCredit ?? false;
    message.price = object.price ?? undefined;
    message.property = object.property ?? 0;
    message.condition =
      object.condition !== undefined && object.condition !== null
        ? OrderCondition.fromPartial(object.condition)
        : undefined;
    message.validBefore =
      object.validBefore !== undefined && object.validBefore !== null
        ? OrderValidBefore.fromPartial(object.validBefore)
        : undefined;

    return message;
  }
};

function createBaseNewOrderResult() {
  return { clientId: '', transactionId: 0, securityCode: '' };
}

export const NewOrderResult = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    if (message.transactionId !== 0) {
      writer.uint32(16).int32(message.transactionId);
    }

    if (message.securityCode !== '') {
      writer.uint32(26).string(message.securityCode);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewOrderResult();

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
      transactionId: isSet(object.transactionId)
        ? globalThis.Number(object.transactionId)
        : 0,
      securityCode: isSet(object.securityCode)
        ? globalThis.String(object.securityCode)
        : ''
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.transactionId !== 0) {
      obj.transactionId = Math.round(message.transactionId);
    }

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    return obj;
  },
  create(base) {
    return NewOrderResult.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseNewOrderResult();

    message.clientId = object.clientId ?? '';
    message.transactionId = object.transactionId ?? 0;
    message.securityCode = object.securityCode ?? '';

    return message;
  }
};

function createBaseCancelOrderRequest() {
  return { clientId: '', transactionId: 0 };
}

export const CancelOrderRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    if (message.transactionId !== 0) {
      writer.uint32(16).int32(message.transactionId);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCancelOrderRequest();

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
          if (tag !== 16) {
            break;
          }

          message.transactionId = reader.int32();
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
      transactionId: isSet(object.transactionId)
        ? globalThis.Number(object.transactionId)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.transactionId !== 0) {
      obj.transactionId = Math.round(message.transactionId);
    }

    return obj;
  },
  create(base) {
    return CancelOrderRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCancelOrderRequest();

    message.clientId = object.clientId ?? '';
    message.transactionId = object.transactionId ?? 0;

    return message;
  }
};

function createBaseCancelOrderResult() {
  return { clientId: '', transactionId: 0 };
}

export const CancelOrderResult = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    if (message.transactionId !== 0) {
      writer.uint32(16).int32(message.transactionId);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCancelOrderResult();

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
          if (tag !== 16) {
            break;
          }

          message.transactionId = reader.int32();
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
      transactionId: isSet(object.transactionId)
        ? globalThis.Number(object.transactionId)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.transactionId !== 0) {
      obj.transactionId = Math.round(message.transactionId);
    }

    return obj;
  },
  create(base) {
    return CancelOrderResult.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCancelOrderResult();

    message.clientId = object.clientId ?? '';
    message.transactionId = object.transactionId ?? 0;

    return message;
  }
};

function createBaseGetOrdersRequest() {
  return {
    clientId: '',
    includeMatched: false,
    includeCanceled: false,
    includeActive: false
  };
}

export const GetOrdersRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    if (message.includeMatched === true) {
      writer.uint32(16).bool(message.includeMatched);
    }

    if (message.includeCanceled === true) {
      writer.uint32(24).bool(message.includeCanceled);
    }

    if (message.includeActive === true) {
      writer.uint32(32).bool(message.includeActive);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetOrdersRequest();

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
          if (tag !== 16) {
            break;
          }

          message.includeMatched = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.includeCanceled = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.includeActive = reader.bool();
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
      includeMatched: isSet(object.includeMatched)
        ? globalThis.Boolean(object.includeMatched)
        : false,
      includeCanceled: isSet(object.includeCanceled)
        ? globalThis.Boolean(object.includeCanceled)
        : false,
      includeActive: isSet(object.includeActive)
        ? globalThis.Boolean(object.includeActive)
        : false
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.includeMatched === true) {
      obj.includeMatched = message.includeMatched;
    }

    if (message.includeCanceled === true) {
      obj.includeCanceled = message.includeCanceled;
    }

    if (message.includeActive === true) {
      obj.includeActive = message.includeActive;
    }

    return obj;
  },
  create(base) {
    return GetOrdersRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGetOrdersRequest();

    message.clientId = object.clientId ?? '';
    message.includeMatched = object.includeMatched ?? false;
    message.includeCanceled = object.includeCanceled ?? false;
    message.includeActive = object.includeActive ?? false;

    return message;
  }
};

function createBaseOrder() {
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
    acceptedAt: undefined,
    securityBoard: '',
    market: 0
  };
}

export const Order = {
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

    if (message.securityBoard !== '') {
      writer.uint32(130).string(message.securityBoard);
    }

    if (message.market !== 0) {
      writer.uint32(136).int32(message.market);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrder();

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
        case 16:
          if (tag !== 130) {
            break;
          }

          message.securityBoard = reader.string();
          continue;
        case 17:
          if (tag !== 136) {
            break;
          }

          message.market = reader.int32();
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
        : undefined,
      securityBoard: isSet(object.securityBoard)
        ? globalThis.String(object.securityBoard)
        : '',
      market: isSet(object.market) ? marketFromJSON(object.market) : 0
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

    if (message.securityBoard !== '') {
      obj.securityBoard = message.securityBoard;
    }

    if (message.market !== 0) {
      obj.market = marketToJSON(message.market);
    }

    return obj;
  },
  create(base) {
    return Order.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrder();

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
    message.securityBoard = object.securityBoard ?? '';
    message.market = object.market ?? 0;

    return message;
  }
};

function createBaseGetOrdersResult() {
  return { clientId: '', orders: [] };
}

export const GetOrdersResult = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }

    for (const v of message.orders) {
      Order.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetOrdersResult();

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

          message.orders.push(Order.decode(reader, reader.uint32()));
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
      orders: globalThis.Array.isArray(object?.orders)
        ? object.orders.map((e) => Order.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.clientId !== '') {
      obj.clientId = message.clientId;
    }

    if (message.orders?.length) {
      obj.orders = message.orders.map((e) => Order.toJSON(e));
    }

    return obj;
  },
  create(base) {
    return GetOrdersResult.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGetOrdersResult();

    message.clientId = object.clientId ?? '';
    message.orders = object.orders?.map((e) => Order.fromPartial(e)) || [];

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
