import Long from '../../long.min.js';
import protobuf from '../../protobuf/minimal.js';
import { MoneyValue, Quotation } from './common.js';
import { Timestamp } from './google/protobuf/timestamp.js';

export const protobufPackage = 'tinkoff.public.invest.api.contract.v1';
/** Тип счёта. */
export var AccountType;
(function (AccountType) {
  /** ACCOUNT_TYPE_UNSPECIFIED - Тип аккаунта не определён. */
  AccountType[(AccountType['ACCOUNT_TYPE_UNSPECIFIED'] = 0)] =
    'ACCOUNT_TYPE_UNSPECIFIED';
  /** ACCOUNT_TYPE_TINKOFF - Брокерский счёт Тинькофф. */
  AccountType[(AccountType['ACCOUNT_TYPE_TINKOFF'] = 1)] =
    'ACCOUNT_TYPE_TINKOFF';
  /** ACCOUNT_TYPE_TINKOFF_IIS - ИИС счёт. */
  AccountType[(AccountType['ACCOUNT_TYPE_TINKOFF_IIS'] = 2)] =
    'ACCOUNT_TYPE_TINKOFF_IIS';
  /** ACCOUNT_TYPE_INVEST_BOX - Инвесткопилка. */
  AccountType[(AccountType['ACCOUNT_TYPE_INVEST_BOX'] = 3)] =
    'ACCOUNT_TYPE_INVEST_BOX';
  AccountType[(AccountType['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(AccountType || (AccountType = {}));

export function accountTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'ACCOUNT_TYPE_UNSPECIFIED':
      return AccountType.ACCOUNT_TYPE_UNSPECIFIED;
    case 1:
    case 'ACCOUNT_TYPE_TINKOFF':
      return AccountType.ACCOUNT_TYPE_TINKOFF;
    case 2:
    case 'ACCOUNT_TYPE_TINKOFF_IIS':
      return AccountType.ACCOUNT_TYPE_TINKOFF_IIS;
    case 3:
    case 'ACCOUNT_TYPE_INVEST_BOX':
      return AccountType.ACCOUNT_TYPE_INVEST_BOX;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return AccountType.UNRECOGNIZED;
  }
}

export function accountTypeToJSON(object) {
  switch (object) {
    case AccountType.ACCOUNT_TYPE_UNSPECIFIED:
      return 'ACCOUNT_TYPE_UNSPECIFIED';
    case AccountType.ACCOUNT_TYPE_TINKOFF:
      return 'ACCOUNT_TYPE_TINKOFF';
    case AccountType.ACCOUNT_TYPE_TINKOFF_IIS:
      return 'ACCOUNT_TYPE_TINKOFF_IIS';
    case AccountType.ACCOUNT_TYPE_INVEST_BOX:
      return 'ACCOUNT_TYPE_INVEST_BOX';
    case AccountType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Статус счёта. */
export var AccountStatus;
(function (AccountStatus) {
  /** ACCOUNT_STATUS_UNSPECIFIED - Статус счёта не определён. */
  AccountStatus[(AccountStatus['ACCOUNT_STATUS_UNSPECIFIED'] = 0)] =
    'ACCOUNT_STATUS_UNSPECIFIED';
  /** ACCOUNT_STATUS_NEW - Новый, в процессе открытия. */
  AccountStatus[(AccountStatus['ACCOUNT_STATUS_NEW'] = 1)] =
    'ACCOUNT_STATUS_NEW';
  /** ACCOUNT_STATUS_OPEN - Открытый и активный счёт. */
  AccountStatus[(AccountStatus['ACCOUNT_STATUS_OPEN'] = 2)] =
    'ACCOUNT_STATUS_OPEN';
  /** ACCOUNT_STATUS_CLOSED - Закрытый счёт. */
  AccountStatus[(AccountStatus['ACCOUNT_STATUS_CLOSED'] = 3)] =
    'ACCOUNT_STATUS_CLOSED';
  AccountStatus[(AccountStatus['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(AccountStatus || (AccountStatus = {}));

export function accountStatusFromJSON(object) {
  switch (object) {
    case 0:
    case 'ACCOUNT_STATUS_UNSPECIFIED':
      return AccountStatus.ACCOUNT_STATUS_UNSPECIFIED;
    case 1:
    case 'ACCOUNT_STATUS_NEW':
      return AccountStatus.ACCOUNT_STATUS_NEW;
    case 2:
    case 'ACCOUNT_STATUS_OPEN':
      return AccountStatus.ACCOUNT_STATUS_OPEN;
    case 3:
    case 'ACCOUNT_STATUS_CLOSED':
      return AccountStatus.ACCOUNT_STATUS_CLOSED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return AccountStatus.UNRECOGNIZED;
  }
}

export function accountStatusToJSON(object) {
  switch (object) {
    case AccountStatus.ACCOUNT_STATUS_UNSPECIFIED:
      return 'ACCOUNT_STATUS_UNSPECIFIED';
    case AccountStatus.ACCOUNT_STATUS_NEW:
      return 'ACCOUNT_STATUS_NEW';
    case AccountStatus.ACCOUNT_STATUS_OPEN:
      return 'ACCOUNT_STATUS_OPEN';
    case AccountStatus.ACCOUNT_STATUS_CLOSED:
      return 'ACCOUNT_STATUS_CLOSED';
    case AccountStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

/** Уровень доступа к счёту. */
export var AccessLevel;
(function (AccessLevel) {
  /** ACCOUNT_ACCESS_LEVEL_UNSPECIFIED - Уровень доступа не определён. */
  AccessLevel[(AccessLevel['ACCOUNT_ACCESS_LEVEL_UNSPECIFIED'] = 0)] =
    'ACCOUNT_ACCESS_LEVEL_UNSPECIFIED';
  /** ACCOUNT_ACCESS_LEVEL_FULL_ACCESS - Полный доступ к счёту. */
  AccessLevel[(AccessLevel['ACCOUNT_ACCESS_LEVEL_FULL_ACCESS'] = 1)] =
    'ACCOUNT_ACCESS_LEVEL_FULL_ACCESS';
  /** ACCOUNT_ACCESS_LEVEL_READ_ONLY - Доступ с уровнем прав "только чтение". */
  AccessLevel[(AccessLevel['ACCOUNT_ACCESS_LEVEL_READ_ONLY'] = 2)] =
    'ACCOUNT_ACCESS_LEVEL_READ_ONLY';
  /** ACCOUNT_ACCESS_LEVEL_NO_ACCESS - Доступ отсутствует. */
  AccessLevel[(AccessLevel['ACCOUNT_ACCESS_LEVEL_NO_ACCESS'] = 3)] =
    'ACCOUNT_ACCESS_LEVEL_NO_ACCESS';
  AccessLevel[(AccessLevel['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(AccessLevel || (AccessLevel = {}));

export function accessLevelFromJSON(object) {
  switch (object) {
    case 0:
    case 'ACCOUNT_ACCESS_LEVEL_UNSPECIFIED':
      return AccessLevel.ACCOUNT_ACCESS_LEVEL_UNSPECIFIED;
    case 1:
    case 'ACCOUNT_ACCESS_LEVEL_FULL_ACCESS':
      return AccessLevel.ACCOUNT_ACCESS_LEVEL_FULL_ACCESS;
    case 2:
    case 'ACCOUNT_ACCESS_LEVEL_READ_ONLY':
      return AccessLevel.ACCOUNT_ACCESS_LEVEL_READ_ONLY;
    case 3:
    case 'ACCOUNT_ACCESS_LEVEL_NO_ACCESS':
      return AccessLevel.ACCOUNT_ACCESS_LEVEL_NO_ACCESS;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return AccessLevel.UNRECOGNIZED;
  }
}

export function accessLevelToJSON(object) {
  switch (object) {
    case AccessLevel.ACCOUNT_ACCESS_LEVEL_UNSPECIFIED:
      return 'ACCOUNT_ACCESS_LEVEL_UNSPECIFIED';
    case AccessLevel.ACCOUNT_ACCESS_LEVEL_FULL_ACCESS:
      return 'ACCOUNT_ACCESS_LEVEL_FULL_ACCESS';
    case AccessLevel.ACCOUNT_ACCESS_LEVEL_READ_ONLY:
      return 'ACCOUNT_ACCESS_LEVEL_READ_ONLY';
    case AccessLevel.ACCOUNT_ACCESS_LEVEL_NO_ACCESS:
      return 'ACCOUNT_ACCESS_LEVEL_NO_ACCESS';
    case AccessLevel.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

function createBaseGetAccountsRequest() {
  return {};
}

export const GetAccountsRequest = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAccountsRequest();

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

function createBaseGetAccountsResponse() {
  return { accounts: [] };
}

export const GetAccountsResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.accounts) {
      Account.encode(v, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAccountsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.accounts.push(Account.decode(reader, reader.uint32()));

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
      accounts: Array.isArray(object?.accounts)
        ? object.accounts.map((e) => Account.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.accounts) {
      obj.accounts = message.accounts.map((e) =>
        e ? Account.toJSON(e) : undefined
      );
    } else {
      obj.accounts = [];
    }

    return obj;
  }
};

function createBaseAccount() {
  return {
    id: '',
    type: 0,
    name: '',
    status: 0,
    openedDate: undefined,
    closedDate: undefined,
    accessLevel: 0
  };
}

export const Account = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }

    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }

    if (message.name !== '') {
      writer.uint32(26).string(message.name);
    }

    if (message.status !== 0) {
      writer.uint32(32).int32(message.status);
    }

    if (message.openedDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.openedDate),
        writer.uint32(42).fork()
      ).ldelim();
    }

    if (message.closedDate !== undefined) {
      Timestamp.encode(
        toTimestamp(message.closedDate),
        writer.uint32(50).fork()
      ).ldelim();
    }

    if (message.accessLevel !== 0) {
      writer.uint32(56).int32(message.accessLevel);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccount();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();

          break;
        case 2:
          message.type = reader.int32();

          break;
        case 3:
          message.name = reader.string();

          break;
        case 4:
          message.status = reader.int32();

          break;
        case 5:
          message.openedDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 6:
          message.closedDate = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );

          break;
        case 7:
          message.accessLevel = reader.int32();

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
      id: isSet(object.id) ? String(object.id) : '',
      type: isSet(object.type) ? accountTypeFromJSON(object.type) : 0,
      name: isSet(object.name) ? String(object.name) : '',
      status: isSet(object.status) ? accountStatusFromJSON(object.status) : 0,
      openedDate: isSet(object.openedDate)
        ? fromJsonTimestamp(object.openedDate)
        : undefined,
      closedDate: isSet(object.closedDate)
        ? fromJsonTimestamp(object.closedDate)
        : undefined,
      accessLevel: isSet(object.accessLevel)
        ? accessLevelFromJSON(object.accessLevel)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    message.id !== undefined && (obj.id = message.id);
    message.type !== undefined && (obj.type = accountTypeToJSON(message.type));
    message.name !== undefined && (obj.name = message.name);
    message.status !== undefined &&
      (obj.status = accountStatusToJSON(message.status));
    message.openedDate !== undefined &&
      (obj.openedDate = message.openedDate.toISOString());
    message.closedDate !== undefined &&
      (obj.closedDate = message.closedDate.toISOString());
    message.accessLevel !== undefined &&
      (obj.accessLevel = accessLevelToJSON(message.accessLevel));

    return obj;
  }
};

function createBaseGetMarginAttributesRequest() {
  return { accountId: '' };
}

export const GetMarginAttributesRequest = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.accountId !== '') {
      writer.uint32(10).string(message.accountId);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMarginAttributesRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.accountId = reader.string();

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
      accountId: isSet(object.accountId) ? String(object.accountId) : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.accountId !== undefined && (obj.accountId = message.accountId);

    return obj;
  }
};

function createBaseGetMarginAttributesResponse() {
  return {
    liquidPortfolio: undefined,
    startingMargin: undefined,
    minimalMargin: undefined,
    fundsSufficiencyLevel: undefined,
    amountOfMissingFunds: undefined
  };
}

export const GetMarginAttributesResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.liquidPortfolio !== undefined) {
      MoneyValue.encode(
        message.liquidPortfolio,
        writer.uint32(10).fork()
      ).ldelim();
    }

    if (message.startingMargin !== undefined) {
      MoneyValue.encode(
        message.startingMargin,
        writer.uint32(18).fork()
      ).ldelim();
    }

    if (message.minimalMargin !== undefined) {
      MoneyValue.encode(
        message.minimalMargin,
        writer.uint32(26).fork()
      ).ldelim();
    }

    if (message.fundsSufficiencyLevel !== undefined) {
      Quotation.encode(
        message.fundsSufficiencyLevel,
        writer.uint32(34).fork()
      ).ldelim();
    }

    if (message.amountOfMissingFunds !== undefined) {
      MoneyValue.encode(
        message.amountOfMissingFunds,
        writer.uint32(42).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMarginAttributesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.liquidPortfolio = MoneyValue.decode(reader, reader.uint32());

          break;
        case 2:
          message.startingMargin = MoneyValue.decode(reader, reader.uint32());

          break;
        case 3:
          message.minimalMargin = MoneyValue.decode(reader, reader.uint32());

          break;
        case 4:
          message.fundsSufficiencyLevel = Quotation.decode(
            reader,
            reader.uint32()
          );

          break;
        case 5:
          message.amountOfMissingFunds = MoneyValue.decode(
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
      liquidPortfolio: isSet(object.liquidPortfolio)
        ? MoneyValue.fromJSON(object.liquidPortfolio)
        : undefined,
      startingMargin: isSet(object.startingMargin)
        ? MoneyValue.fromJSON(object.startingMargin)
        : undefined,
      minimalMargin: isSet(object.minimalMargin)
        ? MoneyValue.fromJSON(object.minimalMargin)
        : undefined,
      fundsSufficiencyLevel: isSet(object.fundsSufficiencyLevel)
        ? Quotation.fromJSON(object.fundsSufficiencyLevel)
        : undefined,
      amountOfMissingFunds: isSet(object.amountOfMissingFunds)
        ? MoneyValue.fromJSON(object.amountOfMissingFunds)
        : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    message.liquidPortfolio !== undefined &&
      (obj.liquidPortfolio = message.liquidPortfolio
        ? MoneyValue.toJSON(message.liquidPortfolio)
        : undefined);
    message.startingMargin !== undefined &&
      (obj.startingMargin = message.startingMargin
        ? MoneyValue.toJSON(message.startingMargin)
        : undefined);
    message.minimalMargin !== undefined &&
      (obj.minimalMargin = message.minimalMargin
        ? MoneyValue.toJSON(message.minimalMargin)
        : undefined);
    message.fundsSufficiencyLevel !== undefined &&
      (obj.fundsSufficiencyLevel = message.fundsSufficiencyLevel
        ? Quotation.toJSON(message.fundsSufficiencyLevel)
        : undefined);
    message.amountOfMissingFunds !== undefined &&
      (obj.amountOfMissingFunds = message.amountOfMissingFunds
        ? MoneyValue.toJSON(message.amountOfMissingFunds)
        : undefined);

    return obj;
  }
};

function createBaseGetUserTariffRequest() {
  return {};
}

export const GetUserTariffRequest = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserTariffRequest();

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

function createBaseGetUserTariffResponse() {
  return { unaryLimits: [], streamLimits: [] };
}

export const GetUserTariffResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    for (const v of message.unaryLimits) {
      UnaryLimit.encode(v, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.streamLimits) {
      StreamLimit.encode(v, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserTariffResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.unaryLimits.push(UnaryLimit.decode(reader, reader.uint32()));

          break;
        case 2:
          message.streamLimits.push(
            StreamLimit.decode(reader, reader.uint32())
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
      unaryLimits: Array.isArray(object?.unaryLimits)
        ? object.unaryLimits.map((e) => UnaryLimit.fromJSON(e))
        : [],
      streamLimits: Array.isArray(object?.streamLimits)
        ? object.streamLimits.map((e) => StreamLimit.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.unaryLimits) {
      obj.unaryLimits = message.unaryLimits.map((e) =>
        e ? UnaryLimit.toJSON(e) : undefined
      );
    } else {
      obj.unaryLimits = [];
    }

    if (message.streamLimits) {
      obj.streamLimits = message.streamLimits.map((e) =>
        e ? StreamLimit.toJSON(e) : undefined
      );
    } else {
      obj.streamLimits = [];
    }

    return obj;
  }
};

function createBaseUnaryLimit() {
  return { limitPerMinute: 0, methods: [] };
}

export const UnaryLimit = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.limitPerMinute !== 0) {
      writer.uint32(8).int32(message.limitPerMinute);
    }

    for (const v of message.methods) {
      writer.uint32(18).string(v);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnaryLimit();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.limitPerMinute = reader.int32();

          break;
        case 2:
          message.methods.push(reader.string());

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
      limitPerMinute: isSet(object.limitPerMinute)
        ? Number(object.limitPerMinute)
        : 0,
      methods: Array.isArray(object?.methods)
        ? object.methods.map((e) => String(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.limitPerMinute !== undefined &&
      (obj.limitPerMinute = Math.round(message.limitPerMinute));

    if (message.methods) {
      obj.methods = message.methods.map((e) => e);
    } else {
      obj.methods = [];
    }

    return obj;
  }
};

function createBaseStreamLimit() {
  return { limit: 0, streams: [] };
}

export const StreamLimit = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.limit !== 0) {
      writer.uint32(8).int32(message.limit);
    }

    for (const v of message.streams) {
      writer.uint32(18).string(v);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamLimit();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.limit = reader.int32();

          break;
        case 2:
          message.streams.push(reader.string());

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
      limit: isSet(object.limit) ? Number(object.limit) : 0,
      streams: Array.isArray(object?.streams)
        ? object.streams.map((e) => String(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    message.limit !== undefined && (obj.limit = Math.round(message.limit));

    if (message.streams) {
      obj.streams = message.streams.map((e) => e);
    } else {
      obj.streams = [];
    }

    return obj;
  }
};

function createBaseGetInfoRequest() {
  return {};
}

export const GetInfoRequest = {
  encode(_, writer = protobuf.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetInfoRequest();

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

function createBaseGetInfoResponse() {
  return {
    premStatus: false,
    qualStatus: false,
    qualifiedForWorkWith: [],
    tariff: ''
  };
}

export const GetInfoResponse = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.premStatus === true) {
      writer.uint32(8).bool(message.premStatus);
    }

    if (message.qualStatus === true) {
      writer.uint32(16).bool(message.qualStatus);
    }

    for (const v of message.qualifiedForWorkWith) {
      writer.uint32(26).string(v);
    }

    if (message.tariff !== '') {
      writer.uint32(34).string(message.tariff);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetInfoResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.premStatus = reader.bool();

          break;
        case 2:
          message.qualStatus = reader.bool();

          break;
        case 3:
          message.qualifiedForWorkWith.push(reader.string());

          break;
        case 4:
          message.tariff = reader.string();

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
      premStatus: isSet(object.premStatus) ? Boolean(object.premStatus) : false,
      qualStatus: isSet(object.qualStatus) ? Boolean(object.qualStatus) : false,
      qualifiedForWorkWith: Array.isArray(object?.qualifiedForWorkWith)
        ? object.qualifiedForWorkWith.map((e) => String(e))
        : [],
      tariff: isSet(object.tariff) ? String(object.tariff) : ''
    };
  },
  toJSON(message) {
    const obj = {};

    message.premStatus !== undefined && (obj.premStatus = message.premStatus);
    message.qualStatus !== undefined && (obj.qualStatus = message.qualStatus);

    if (message.qualifiedForWorkWith) {
      obj.qualifiedForWorkWith = message.qualifiedForWorkWith.map((e) => e);
    } else {
      obj.qualifiedForWorkWith = [];
    }

    message.tariff !== undefined && (obj.tariff = message.tariff);

    return obj;
  }
};
export const UsersServiceDefinition = {
  name: 'UsersService',
  fullName: 'tinkoff.public.invest.api.contract.v1.UsersService',
  methods: {
    /** Метод получения счетов пользователя. */
    getAccounts: {
      name: 'GetAccounts',
      requestType: GetAccountsRequest,
      requestStream: false,
      responseType: GetAccountsResponse,
      responseStream: false,
      options: {}
    },
    /** Расчёт маржинальных показателей по счёту. */
    getMarginAttributes: {
      name: 'GetMarginAttributes',
      requestType: GetMarginAttributesRequest,
      requestStream: false,
      responseType: GetMarginAttributesResponse,
      responseStream: false,
      options: {}
    },
    /** Запрос тарифа пользователя. */
    getUserTariff: {
      name: 'GetUserTariff',
      requestType: GetUserTariffRequest,
      requestStream: false,
      responseType: GetUserTariffResponse,
      responseStream: false,
      options: {}
    },
    /** Метод получения информации о пользователе. */
    getInfo: {
      name: 'GetInfo',
      requestType: GetInfoRequest,
      requestStream: false,
      responseType: GetInfoResponse,
      responseStream: false,
      options: {}
    }
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

if (protobuf.util.Long !== Long) {
  protobuf.util.Long = Long;
  protobuf.configure();
}

function isSet(value) {
  return value !== null && value !== undefined;
}
