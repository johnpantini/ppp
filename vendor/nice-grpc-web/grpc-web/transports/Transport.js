import { CrossBrowserHttpTransport } from './http/http.js';

let defaultTransportFactory = (options) =>
  CrossBrowserHttpTransport({ withCredentials: false })(options);

export function setDefaultTransportFactory(t) {
  defaultTransportFactory = t;
}

export function makeDefaultTransport(options) {
  return defaultTransportFactory(options);
}
