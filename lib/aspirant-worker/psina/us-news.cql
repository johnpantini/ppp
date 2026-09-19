-- Bootstrap for a bare Astra DB. Run once in the Astra CQL console (Data API
-- cannot create timeuuid columns or set a table TTL). Keyspace: psina.

CREATE TABLE IF NOT EXISTS psina.us_news (
  "T" text,
  i timeuuid,
  "S" set<text>,
  c set<text>,
  u text,
  t timestamp,
  h1 text,
  h2 text,
  b text,
  PRIMARY KEY ("T", i)
) WITH CLUSTERING ORDER BY (i DESC)
  AND default_time_to_live = 2592000
  AND gc_grace_seconds = 86400;

-- Ticker index. The worker also issues createIndex (ifNotExists) via Data API.
CREATE CUSTOM INDEX IF NOT EXISTS "S_idx" ON psina.us_news (VALUES("S"))
  USING 'StorageAttachedIndex';
