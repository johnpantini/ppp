import Long from '../../long.min.js';
import protobuf from '../../protobuf/minimal.js';
import { marketFromJSON, marketToJSON } from './common.js';

export const protobufPackage = 'proto.tradeapi.v1';

function createBasePortfolioContent() {
  return {
    includeCurrencies: false,
    includeMoney: false,
    includePositions: false,
    includeMaxBuySell: false
  };
}

export const PortfolioContent = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.includeCurrencies === true) {
      writer.uint32(8).bool(message.includeCurrencies);
    }

    if (message.includeMoney === true) {
      writer.uint32(16).bool(message.includeMoney);
    }

    if (message.includePositions === true) {
      writer.uint32(24).bool(message.includePositions);
    }

    if (message.includeMaxBuySell === true) {
      writer.uint32(32).bool(message.includeMaxBuySell);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePortfolioContent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.includeCurrencies = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.includeMoney = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.includePositions = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.includeMaxBuySell = reader.bool();
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
      includeCurrencies: isSet(object.includeCurrencies)
        ? globalThis.Boolean(object.includeCurrencies)
        : false,
      includeMoney: isSet(object.includeMoney)
        ? globalThis.Boolean(object.includeMoney)
        : false,
      includePositions: isSet(object.includePositions)
        ? globalThis.Boolean(object.includePositions)
        : false,
      includeMaxBuySell: isSet(object.includeMaxBuySell)
        ? globalThis.Boolean(object.includeMaxBuySell)
        : false
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.includeCurrencies === true) {
      obj.includeCurrencies = message.includeCurrencies;
    }

    if (message.includeMoney === true) {
      obj.includeMoney = message.includeMoney;
    }

    if (message.includePositions === true) {
      obj.includePositions = message.includePositions;
    }

    if (message.includeMaxBuySell === true) {
      obj.includeMaxBuySell = message.includeMaxBuySell;
    }

    return obj;
  },
  create(base) {
    return PortfolioContent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBasePortfolioContent();

    message.includeCurrencies = object.includeCurrencies ?? false;
    message.includeMoney = object.includeMoney ?? false;
    message.includePositions = object.includePositions ?? false;
    message.includeMaxBuySell = object.includeMaxBuySell ?? false;

    return message;
  }
};

function createBasePositionRow() {
  return {
    securityCode: '',
    market: 0,
    balance: 0,
    currentPrice: 0,
    equity: 0,
    averagePrice: 0,
    currency: '',
    accumulatedProfit: 0,
    todayProfit: 0,
    unrealizedProfit: 0,
    profit: 0,
    maxBuy: 0,
    maxSell: 0,
    priceCurrency: '',
    averagePriceCurrency: '',
    averageRate: 0
  };
}

export const PositionRow = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.securityCode !== '') {
      writer.uint32(10).string(message.securityCode);
    }

    if (message.market !== 0) {
      writer.uint32(16).int32(message.market);
    }

    if (message.balance !== 0) {
      writer.uint32(24).int64(message.balance);
    }

    if (message.currentPrice !== 0) {
      writer.uint32(33).double(message.currentPrice);
    }

    if (message.equity !== 0) {
      writer.uint32(41).double(message.equity);
    }

    if (message.averagePrice !== 0) {
      writer.uint32(49).double(message.averagePrice);
    }

    if (message.currency !== '') {
      writer.uint32(58).string(message.currency);
    }

    if (message.accumulatedProfit !== 0) {
      writer.uint32(65).double(message.accumulatedProfit);
    }

    if (message.todayProfit !== 0) {
      writer.uint32(73).double(message.todayProfit);
    }

    if (message.unrealizedProfit !== 0) {
      writer.uint32(81).double(message.unrealizedProfit);
    }

    if (message.profit !== 0) {
      writer.uint32(89).double(message.profit);
    }

    if (message.maxBuy !== 0) {
      writer.uint32(96).int64(message.maxBuy);
    }

    if (message.maxSell !== 0) {
      writer.uint32(104).int64(message.maxSell);
    }

    if (message.priceCurrency !== '') {
      writer.uint32(114).string(message.priceCurrency);
    }

    if (message.averagePriceCurrency !== '') {
      writer.uint32(122).string(message.averagePriceCurrency);
    }

    if (message.averageRate !== 0) {
      writer.uint32(129).double(message.averageRate);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionRow();

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

          message.market = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.balance = longToNumber(reader.int64());
          continue;
        case 4:
          if (tag !== 33) {
            break;
          }

          message.currentPrice = reader.double();
          continue;
        case 5:
          if (tag !== 41) {
            break;
          }

          message.equity = reader.double();
          continue;
        case 6:
          if (tag !== 49) {
            break;
          }

          message.averagePrice = reader.double();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.currency = reader.string();
          continue;
        case 8:
          if (tag !== 65) {
            break;
          }

          message.accumulatedProfit = reader.double();
          continue;
        case 9:
          if (tag !== 73) {
            break;
          }

          message.todayProfit = reader.double();
          continue;
        case 10:
          if (tag !== 81) {
            break;
          }

          message.unrealizedProfit = reader.double();
          continue;
        case 11:
          if (tag !== 89) {
            break;
          }

          message.profit = reader.double();
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.maxBuy = longToNumber(reader.int64());
          continue;
        case 13:
          if (tag !== 104) {
            break;
          }

          message.maxSell = longToNumber(reader.int64());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.priceCurrency = reader.string();
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.averagePriceCurrency = reader.string();
          continue;
        case 16:
          if (tag !== 129) {
            break;
          }

          message.averageRate = reader.double();
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
      market: isSet(object.market) ? marketFromJSON(object.market) : 0,
      balance: isSet(object.balance) ? globalThis.Number(object.balance) : 0,
      currentPrice: isSet(object.currentPrice)
        ? globalThis.Number(object.currentPrice)
        : 0,
      equity: isSet(object.equity) ? globalThis.Number(object.equity) : 0,
      averagePrice: isSet(object.averagePrice)
        ? globalThis.Number(object.averagePrice)
        : 0,
      currency: isSet(object.currency)
        ? globalThis.String(object.currency)
        : '',
      accumulatedProfit: isSet(object.accumulatedProfit)
        ? globalThis.Number(object.accumulatedProfit)
        : 0,
      todayProfit: isSet(object.todayProfit)
        ? globalThis.Number(object.todayProfit)
        : 0,
      unrealizedProfit: isSet(object.unrealizedProfit)
        ? globalThis.Number(object.unrealizedProfit)
        : 0,
      profit: isSet(object.profit) ? globalThis.Number(object.profit) : 0,
      maxBuy: isSet(object.maxBuy) ? globalThis.Number(object.maxBuy) : 0,
      maxSell: isSet(object.maxSell) ? globalThis.Number(object.maxSell) : 0,
      priceCurrency: isSet(object.priceCurrency)
        ? globalThis.String(object.priceCurrency)
        : '',
      averagePriceCurrency: isSet(object.averagePriceCurrency)
        ? globalThis.String(object.averagePriceCurrency)
        : '',
      averageRate: isSet(object.averageRate)
        ? globalThis.Number(object.averageRate)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.securityCode !== '') {
      obj.securityCode = message.securityCode;
    }

    if (message.market !== 0) {
      obj.market = marketToJSON(message.market);
    }

    if (message.balance !== 0) {
      obj.balance = Math.round(message.balance);
    }

    if (message.currentPrice !== 0) {
      obj.currentPrice = message.currentPrice;
    }

    if (message.equity !== 0) {
      obj.equity = message.equity;
    }

    if (message.averagePrice !== 0) {
      obj.averagePrice = message.averagePrice;
    }

    if (message.currency !== '') {
      obj.currency = message.currency;
    }

    if (message.accumulatedProfit !== 0) {
      obj.accumulatedProfit = message.accumulatedProfit;
    }

    if (message.todayProfit !== 0) {
      obj.todayProfit = message.todayProfit;
    }

    if (message.unrealizedProfit !== 0) {
      obj.unrealizedProfit = message.unrealizedProfit;
    }

    if (message.profit !== 0) {
      obj.profit = message.profit;
    }

    if (message.maxBuy !== 0) {
      obj.maxBuy = Math.round(message.maxBuy);
    }

    if (message.maxSell !== 0) {
      obj.maxSell = Math.round(message.maxSell);
    }

    if (message.priceCurrency !== '') {
      obj.priceCurrency = message.priceCurrency;
    }

    if (message.averagePriceCurrency !== '') {
      obj.averagePriceCurrency = message.averagePriceCurrency;
    }

    if (message.averageRate !== 0) {
      obj.averageRate = message.averageRate;
    }

    return obj;
  },
  create(base) {
    return PositionRow.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBasePositionRow();

    message.securityCode = object.securityCode ?? '';
    message.market = object.market ?? 0;
    message.balance = object.balance ?? 0;
    message.currentPrice = object.currentPrice ?? 0;
    message.equity = object.equity ?? 0;
    message.averagePrice = object.averagePrice ?? 0;
    message.currency = object.currency ?? '';
    message.accumulatedProfit = object.accumulatedProfit ?? 0;
    message.todayProfit = object.todayProfit ?? 0;
    message.unrealizedProfit = object.unrealizedProfit ?? 0;
    message.profit = object.profit ?? 0;
    message.maxBuy = object.maxBuy ?? 0;
    message.maxSell = object.maxSell ?? 0;
    message.priceCurrency = object.priceCurrency ?? '';
    message.averagePriceCurrency = object.averagePriceCurrency ?? '';
    message.averageRate = object.averageRate ?? 0;

    return message;
  }
};

function createBaseCurrencyRow() {
  return { name: '', balance: 0, crossRate: 0, equity: 0, unrealizedProfit: 0 };
}

export const CurrencyRow = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }

    if (message.balance !== 0) {
      writer.uint32(17).double(message.balance);
    }

    if (message.crossRate !== 0) {
      writer.uint32(25).double(message.crossRate);
    }

    if (message.equity !== 0) {
      writer.uint32(33).double(message.equity);
    }

    if (message.unrealizedProfit !== 0) {
      writer.uint32(41).double(message.unrealizedProfit);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCurrencyRow();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.balance = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.crossRate = reader.double();
          continue;
        case 4:
          if (tag !== 33) {
            break;
          }

          message.equity = reader.double();
          continue;
        case 5:
          if (tag !== 41) {
            break;
          }

          message.unrealizedProfit = reader.double();
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
      name: isSet(object.name) ? globalThis.String(object.name) : '',
      balance: isSet(object.balance) ? globalThis.Number(object.balance) : 0,
      crossRate: isSet(object.crossRate)
        ? globalThis.Number(object.crossRate)
        : 0,
      equity: isSet(object.equity) ? globalThis.Number(object.equity) : 0,
      unrealizedProfit: isSet(object.unrealizedProfit)
        ? globalThis.Number(object.unrealizedProfit)
        : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.name !== '') {
      obj.name = message.name;
    }

    if (message.balance !== 0) {
      obj.balance = message.balance;
    }

    if (message.crossRate !== 0) {
      obj.crossRate = message.crossRate;
    }

    if (message.equity !== 0) {
      obj.equity = message.equity;
    }

    if (message.unrealizedProfit !== 0) {
      obj.unrealizedProfit = message.unrealizedProfit;
    }

    return obj;
  },
  create(base) {
    return CurrencyRow.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCurrencyRow();

    message.name = object.name ?? '';
    message.balance = object.balance ?? 0;
    message.crossRate = object.crossRate ?? 0;
    message.equity = object.equity ?? 0;
    message.unrealizedProfit = object.unrealizedProfit ?? 0;

    return message;
  }
};

function createBaseMoneyRow() {
  return { market: 0, currency: '', balance: 0 };
}

export const MoneyRow = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.market !== 0) {
      writer.uint32(8).int32(message.market);
    }

    if (message.currency !== '') {
      writer.uint32(18).string(message.currency);
    }

    if (message.balance !== 0) {
      writer.uint32(25).double(message.balance);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoneyRow();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.market = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.currency = reader.string();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.balance = reader.double();
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
      market: isSet(object.market) ? marketFromJSON(object.market) : 0,
      currency: isSet(object.currency)
        ? globalThis.String(object.currency)
        : '',
      balance: isSet(object.balance) ? globalThis.Number(object.balance) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.market !== 0) {
      obj.market = marketToJSON(message.market);
    }

    if (message.currency !== '') {
      obj.currency = message.currency;
    }

    if (message.balance !== 0) {
      obj.balance = message.balance;
    }

    return obj;
  },
  create(base) {
    return MoneyRow.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseMoneyRow();

    message.market = object.market ?? 0;
    message.currency = object.currency ?? '';
    message.balance = object.balance ?? 0;

    return message;
  }
};

function createBaseGetPortfolioRequest() {
  return { clientId: '', content: undefined };
}

export const GetPortfolioRequest = {
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
    const message = createBaseGetPortfolioRequest();

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
    return GetPortfolioRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGetPortfolioRequest();

    message.clientId = object.clientId ?? '';
    message.content =
      object.content !== undefined && object.content !== null
        ? PortfolioContent.fromPartial(object.content)
        : undefined;

    return message;
  }
};

function createBaseGetPortfolioResult() {
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

export const GetPortfolioResult = {
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
    const message = createBaseGetPortfolioResult();

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
    return GetPortfolioResult.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGetPortfolioResult();

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
