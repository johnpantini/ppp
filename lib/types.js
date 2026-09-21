/**
 * Shared data contracts for editor navigation. This module intentionally has no
 * runtime values; consumers reference it with JSDoc import() types.
 * @module
 */

/**
 * Instrument metadata used by pricing, trading and display helpers.
 * Fields are optional because helpers also accept partially loaded instruments.
 * @typedef {object} Instrument
 * @property {string} [symbol] Symbol, optionally suffixed with an exchange after ~.
 * @property {string} [fullName] Human-readable instrument name.
 * @property {string} [type] stock, bond, future, index, currency, cryptocurrency or option.
 * @property {string} [currency] Settlement currency code, or N/A for no label.
 * @property {string} [exchange] Exchange identifier from EXCHANGE.
 * @property {string} [broker] Broker identifier from BROKERS.
 * @property {string} [quoteCryptoAsset] Quote asset for a cryptocurrency pair.
 * @property {number} [minPriceIncrement] Minimum price tick in quote currency.
 * @property {number} [minQuantityIncrement] Minimum quantity step.
 * @property {number} [lot] Number of units in one lot.
 * @property {number} [nominal] Bond face value for relative price conversion.
 * @property {string} [underlyingSymbol] Underlying instrument for an option.
 * @property {boolean} [removed] Whether the instrument is hidden from search.
 * @property {boolean} [notSupported] Whether the current trader cannot adopt it.
 */

/**
 * Distance entered in an order form.
 * @typedef {object} Distance
 * @property {number} value Amount; percentages use 5 for 5%, not 0.05.
 * @property {'' | '%' | '+'} unit Absolute price, percent, or number of price ticks.
 */

/**
 * A single level in a market depth snapshot.
 * @typedef {object} OrderbookLevel
 * @property {number} price Price in quote currency.
 * @property {number} volume Available quantity in the trader's units.
 * @property {string} [pool] Venue or liquidity pool.
 */

/**
 * @typedef {object} Orderbook
 * @property {OrderbookLevel[]} bids Buy levels, normally ordered by descending price.
 * @property {OrderbookLevel[]} asks Sell levels, normally ordered by ascending price.
 */

/**
 * MongoDB document that can reference other PPP documents by <name>Id fields.
 * @typedef {Object<string, any> & {_id?: string, iv?: string}} PPPDocument
 */

/**
 * Connection and capability settings persisted for a trader.
 * @typedef {PPPDocument & {runtime?: 'main-thread' | 'shared-worker' | 'url', caps?: string[]}} TraderDocument
 */

/**
 * A persisted or simulated limit order.
 * @typedef {object} LimitOrder
 * @property {Instrument} instrument Instrument being traded.
 * @property {string | number} orderId Identifier assigned by the trader.
 * @property {string | number} [trackingId] Client-supplied correlation identifier.
 * @property {'buy' | 'sell'} side Order direction.
 * @property {number} price Limit price in quote currency.
 * @property {number} quantity Total requested quantity.
 * @property {number} filled Executed quantity; modification must preserve it.
 * @property {'open' | 'working' | 'filled' | 'canceled'} status Execution state.
 * @property {string} [symbol] Instrument symbol.
 */

export {};

/**
 * Translation registry shared by language modules; extend merges nested namespaces.
 * Leaves are translated strings that may contain Polyglot %{name} placeholders.
 * @typedef {object} LocalizationRegistry
 * @property {(phrases: Record<string, string | object>) => void} extend Register or replace phrases.
 */

/**
 * A widget, conditional order or remote proxy consuming a trader datum.
 * @typedef {object} TraderSource
 * @property {Instrument} [instrument] Currently selected instrument.
 * @property {string} [sourceID] Identifier used in remote assignment messages.
 * @property {boolean} [canChangeInstrument] Whether to listen for instrumentchange.
 * @property {object} [mainTrader] Owning trader of an internal conditional order.
 * @property {MessagePort} [port] Shared-worker transport for assignments.
 * @property {{closed?: boolean, send: (message: string) => void}} [ws] Remote socket.
 * @property {(name: string) => string | null} [getAttribute] Observed source attributes.
 * @property {(type: string, listener: Function) => void} [addEventListener] Event subscription.
 * @property {(type: string, listener: Function) => void} [removeEventListener] Event cleanup.
 */

/**
 * @typedef {object} FieldSubscription
 * @property {TraderSource} source Receiver of datum assignments.
 * @property {string} field Receiver property to update.
 * @property {string} datum Identifier from TRADER_DATUM.
 */
