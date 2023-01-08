import { FetchReadableStreamTransport } from './fetch.js';

export function CrossBrowserHttpTransport(init) {
  const fetchInit = {
    credentials: init.withCredentials ? 'include' : 'same-origin'
  };

  return FetchReadableStreamTransport(fetchInit);
}
