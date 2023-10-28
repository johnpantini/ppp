const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
const EMPTY_BUFFER = Buffer.alloc(0);
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const kForOnEventAttribute = Symbol('kIsForOnEventAttribute');
const kListener = Symbol('kListener');
const kStatusCode = Symbol('status-code');
const kWebSocket = Symbol('websocket');
const NOOP = () => {};

export {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket,
  NOOP
};
