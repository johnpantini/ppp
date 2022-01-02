function toInt(v) {
  if (v == null) return;

  const x = parseInt(v, 10);

  if (x || x === 0) return x;

  throw new TypeError(`"${v}" is not a valid integer value.`);
}

function toIntDef(v, d) {
  return v != null ? toInt(v) : toInt(d);
}

export function configFromEnv() {
  const env = process.env;
  const result = {};

  result.host = env.PGHOST || env.PGHOSTADDR;

  if (env.PGPORT) result.port = toIntDef(env.PGPORT, 5432);

  if (env.PGDATABASE) result.database = env.PGDATABASE;

  if (env.PGUSER) result.user = env.PGUSER;

  if (env.PGPASSWORD) result.password = env.PGPASSWORD;

  if (env.PGAPPNAME) result.applicationName = env.PGAPPNAME;

  if (env.PGTZ) result.timezone = env.PGTZ;

  if (env.PGSCHEMA) result.schema = env.PGSCHEMA;

  if (env.PGCONNECT_TIMEOUT)
    result.connectTimeoutMs = toIntDef(env.PGCONNECT_TIMEOUT, 30000);

  return result;
}
