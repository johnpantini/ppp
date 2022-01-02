import { configFromEnv } from './config-from-env.mjs';
import { merge } from './merge.mjs';

export function getConnectionConfig(config) {
  const cfg = configFromEnv();

  if (typeof config === 'string') {
    merge(cfg, parseConnectionString(config));
  } else if (typeof config === 'object') {
    merge(cfg, config);
  }

  if (cfg.host) {
    const x = parseConnectionString('' + cfg.host);

    merge(cfg, x);
  }

  cfg.user = cfg.user || 'postgres';
  cfg.database = cfg.database || 'postgres';
  cfg.host = cfg.host || '127.0.0.1';

  return cfg;
}

export function parseConnectionString(str) {
  if (str.startsWith('/')) str = 'socket:/' + str;

  if (!str.includes('://')) str = 'postgres://' + str;

  const parsed = new URL(str);

  const query = Object.fromEntries(parsed.searchParams);
  const getFirst = (v) => {
    return typeof v === 'string' ? v : Array.isArray(v) ? v[0] : '';
  };
  const cfg = {};

  cfg.host = decodeURI(parsed.hostname || '');

  if (parsed.port) cfg.port = parseInt(parsed.port, 10);

  if (parsed.protocol === 'socket:' || parsed.protocol === 'unix:') {
    if (!cfg.host.startsWith('/')) cfg.host = '/' + cfg.host;

    cfg.host += decodeURI(parsed.pathname || '');

    if (query.db) cfg.database = decodeURI(getFirst(query.db));
  } else if (parsed.protocol === 'pg:' || parsed.protocol === 'postgres:') {
    if (parsed.pathname) cfg.database = decodeURI(parsed.pathname.substring(1));
  }

  if (query.host) cfg.host = decodeURI(getFirst(query.host));

  if (query.db) cfg.database = decodeURI(getFirst(query.db));

  if (query.schema) cfg.schema = decodeURI(getFirst(query.schema));

  if (query.application_name)
    cfg.applicationName = decodeURI(getFirst(query.application_name));

  if (parsed.username) cfg.user = parsed.username;

  if (parsed.password) cfg.password = decodeURIComponent(parsed.password);

  return cfg;
}
