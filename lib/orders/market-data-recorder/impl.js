/** @decorator */

import {
  ConditionalOrder,
  pppOrderInstanceForWorkerIs
} from '../../conditional-order.js';
import { observable } from '../../../lib/fast/observable.js';
import { TRADER_DATUM } from '../../const.js';
import { maybeFetchError } from '../../ppp-exceptions.js';
import { HMAC, sha256, uuidv4 } from '../../ppp-crypto.js';
import { getYCPsinaFolder, generateYCAWSSigningKey } from '../../../lib/yc.js';

/** Records compact quotes/trades during active intervals and uploads an archive. */
class MarketDataRecorderOrder extends ConditionalOrder {
  @observable
  eventCounter;

  @observable
  startedAt;

  /**
   * Publishes the beginning of an active recording interval.
   * @returns {unknown}
   */
  startedAtChanged() {
    return this.changed();
  }

  @observable
  pausedAt;

  /**
   * Publishes the end of an active recording interval.
   * @returns {unknown}
   */
  pausedAtChanged() {
    return this.changed();
  }

  @observable
  elapsedSeconds;

  /**
   * Publishes accumulated active recording time.
   * @returns {unknown}
   */
  elapsedSecondsChanged() {
    return this.changed();
  }

  orderbooks = [];

  prints = [];

  tradingStatuses = [];

  orderbookTrader;

  @observable
  orderbook;

  /**
   * Captures [bids, asks] as compact price/volume/condition/time/pool tuples.
   * @param {import('../../types.js').Orderbook} oldValue Previous snapshot.
   * @param {import('../../types.js').Orderbook} orderbook New snapshot.
   * @returns {void} Paused/nonworking snapshots are ignored.
   */
  orderbookChanged(oldValue, orderbook) {
    if (this.status === 'working') {
      this.eventCounter++;
      // [bids, asks]
      this.orderbooks.push([
        (orderbook.bids ?? []).map((i) => [
          i.price,
          i.volume,
          i.condition ?? [],
          i.timestamp ?? Date.now(),
          i.pool ?? ''
        ]),
        (orderbook.asks ?? []).map((i) => [
          i.price,
          i.volume,
          i.condition ?? [],
          i.timestamp ?? Date.now(),
          i.pool ?? ''
        ])
      ]);

      return this.changedWithThrottle();
    }
  }

  printTrader;

  @observable
  print;

  /**
   * Normalizes a provider trade and records it only while working.
   * @param {unknown} oldValue Previous trade.
   * @param {unknown} rawTrade Provider-specific trade representation.
   * @returns {void}
   */
  printChanged(oldValue, rawTrade) {
    const print = this.printTrader.rawTradeToCanonicalTrade(rawTrade);

    if (this.status === 'working') {
      this.eventCounter = this.eventCounter + 1;
      this.prints.push([
        print.symbol,
        print.side,
        print.condition ?? [],
        print.timestamp,
        print.price,
        print.volume,
        print.pool ?? ''
      ]);

      return this.changedWithThrottle();
    }
  }

  tradingStatusTrader;

  @observable
  tradingStatus;

  /**
   * @param {string} oldValue Previous trading status.
   * @param {string} tradingStatus New status, timestamped on receipt.
   * @returns {void} Records the status only while working.
   */
  tradingStatusChanged(oldValue, tradingStatus) {
    if (this.status === 'working') {
      this.eventCounter++;
      this.tradingStatuses.push([tradingStatus, Date.now()]);

      return this.changedWithThrottle();
    }
  }

  /**
   * @param {import('../../traders/trader-worker.js').Trader} mainTrader Owning trader.
   * @param {number} [throttleTime=250] Interval between progress broadcasts, in ms.
   */
  constructor(mainTrader, throttleTime = 250) {
    super(mainTrader, throttleTime);

    this.eventCounter = 0;
    this.elapsedSeconds = 0;
  }

  /**
   * Initializes recording and honors the per-placement or stored autoStart flag.
   * @param {object} options Placement parameters.
   * @param {import('../../types.js').Instrument} options.instrument Instrument to record.
   * @param {'buy' | 'sell'} options.direction Base conditional-order side.
   * @param {import('../../types.js').PPPDocument} options.payload Recording settings and sources.
   * @returns {Promise<void>}
   */
  async place({ instrument, direction, payload }) {
    super.place({ instrument, direction, payload });

    this.status = 'pending';

    if (this.payload.autoStart ?? this.payload.order.autoStart) {
      return this.start();
    } else {
      return this.pause();
    }
  }

  /**
   * Attaches missing data sources and starts/resumes active timing.
   * @returns {Promise<void>}
   */
  async start() {
    if (this.payload.trader1 && !this.orderbookTrader) {
      this.orderbookTrader = await globalThis.ppp.getOrCreateTrader(
        this.payload.trader1
      );

      this.orderbookTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          orderbook: TRADER_DATUM.ORDERBOOK
        }
      });
    }

    if (this.payload.trader2 && !this.printTrader) {
      this.printTrader = await globalThis.ppp.getOrCreateTrader(
        this.payload.trader2
      );

      this.printTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });
    }

    if (this.payload.trader3 && !this.tradingStatusTrader) {
      this.tradingStatusTrader = await globalThis.ppp.getOrCreateTrader(
        this.payload.trader3
      );

      this.tradingStatusTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          tradingStatus: TRADER_DATUM.TRADING_STATUS
        }
      });
    }

    if (this.status !== 'working') {
      this.status = 'working';
      this.startedAt = new Date().toISOString();
    }
  }

  /**
   * Stops active timing once; retains subscriptions so recording can resume.
   * @returns {void}
   */
  pause() {
    if (this.status !== 'paused') {
      this.status = 'paused';
      this.pausedAt = new Date().toISOString();

      if (this.startedAt) {
        this.elapsedSeconds +=
          (new Date(this.pausedAt).valueOf() -
            new Date(this.startedAt).valueOf()) /
          1000;
      }
    }
  }

  /**
   * Detaches data sources, finalizes timing and uploads the recording.
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.orderbookTrader) {
      this.orderbookTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          orderbook: TRADER_DATUM.ORDERBOOK
        }
      });
    }

    if (this.printTrader) {
      this.printTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });
    }

    if (this.tradingStatusTrader) {
      this.tradingStatusTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          tradingStatus: TRADER_DATUM.TRADING_STATUS
        }
      });
    }

    // Update timings.
    this.pause();

    this.status = 'executing';

    await this.flushDataToCloud();

    if (this.status !== 'failed') {
      this.status = 'executed';
    }
  }

  /**
   * Marks completed/failed recordings canceled; active recordings require force.
   * @param {{force?: boolean}} options Whether to bypass lifecycle restrictions.
   * @returns {void}
   */
  cancel({ force }) {
    if (this.status === 'executed' || this.status === 'failed' || force) {
      super.cancel();
    }
  }

  /** @returns {object} Public order state and recording counters/timestamps. */
  serialize() {
    return {
      ...super.serialize(),
      eventCounter: this.eventCounter,
      startedAt: this.startedAt,
      pausedAt: this.pausedAt,
      elapsedSeconds: this.elapsedSeconds
    };
  }

  /**
   * Archives recorded arrays and uploads the ZIP to configured Yandex storage.
   * Errors set failed status and are logged; callers inspect status after awaiting.
   * @returns {Promise<void>}
   */
  async flushDataToCloud() {
    try {
      const isServer =
        typeof process !== 'undefined' && process.release.name === 'node';

      let jose = globalThis.jose;

      if (!isServer) {
        await import('../../../vendor/zip-full.min.js');

        jose = await import('../../../vendor/jose.min.js');
      }

      const zip = globalThis.zip;
      const zipWriter = new zip.ZipWriter(
        new zip.BlobWriter('application/zip')
      );

      await zipWriter.add(
        'orderbooks.json',
        new zip.TextReader(JSON.stringify(this.orderbooks))
      );

      await zipWriter.add(
        'prints.json',
        new zip.TextReader(JSON.stringify(this.prints))
      );

      await zipWriter.add(
        'trading-statuses.json',
        new zip.TextReader(JSON.stringify(this.tradingStatuses))
      );

      const zipBlob = await zipWriter.close();

      if (zipBlob) {
        const {
          ycServiceAccountID,
          ycPublicKeyID,
          ycPrivateKey,
          ycStaticKeyID,
          ycStaticKeySecret
        } = this.payload.order.ycApi;

        const { psinaFolderId, iamToken } = await getYCPsinaFolder({
          jose,
          ycServiceAccountID,
          ycPublicKeyID,
          ycPrivateKey
        });

        const rBucketList = await maybeFetchError(
          await ppp.fetch(
            `https://storage.api.cloud.yandex.net/storage/v1/buckets?folderId=${psinaFolderId}`,
            {
              headers: {
                Authorization: `Bearer ${iamToken}`
              }
            }
          ),
          'Не удалось получить список бакетов. Проверьте права доступа.'
        );

        const bucketList = await rBucketList.json();
        let recordingsBucket = bucketList?.buckets?.find((b) =>
          /^ppp-recordings-/.test(b.name)
        );

        if (!recordingsBucket) {
          // Create new bucket.
          const rNewBucket = await maybeFetchError(
            await ppp.fetch(
              'https://storage.api.cloud.yandex.net/storage/v1/buckets',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${iamToken}`
                },
                body: JSON.stringify({
                  name: `ppp-recordings-${uuidv4()}`,
                  folderId: psinaFolderId,
                  defaultStorageClass: 'STANDARD',
                  // 1 GB
                  maxSize: 1024 ** 3,
                  anonymousAccessFlags: {
                    read: true,
                    list: false,
                    configRead: false
                  }
                })
              }
            ),
            'Не удалось создать бакет для файлов записей.'
          );

          recordingsBucket = (await rNewBucket.json()).response;
        }

        const instrument = this.instrument;
        const key = `${this.mainTrader.getSymbol(instrument)}|${
          instrument.dictionary
        }|${Date.now()}.zip`;
        const host = `${recordingsBucket.name}.storage.yandexcloud.net`;
        const xAmzDate =
          new Date()
            .toISOString()
            .replaceAll('-', '')
            .replaceAll(':', '')
            .split('.')[0] + 'Z';
        const date = xAmzDate.split('T')[0];
        const signingKey = await generateYCAWSSigningKey({
          ycStaticKeySecret,
          date
        });
        const hashBuffer = await crypto.subtle.digest(
          'SHA-256',
          await zipBlob.arrayBuffer()
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPayload = hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        const canonicalRequest = `PUT\n/${encodeURIComponent(
          key
        )}\n\nhost:${host}\nx-amz-content-sha256:${hashedPayload}\nx-amz-date:${xAmzDate}\n\nhost;x-amz-content-sha256;x-amz-date\n${hashedPayload}`;
        const scope = `${date}/ru-central1/s3/aws4_request`;
        const stringToSign = `AWS4-HMAC-SHA256\n${xAmzDate}\n${scope}\n${await sha256(
          canonicalRequest
        )}`;
        const signature = await HMAC(signingKey, stringToSign, {
          format: 'hex'
        });
        const Authorization = `AWS4-HMAC-SHA256 Credential=${ycStaticKeyID}/${date}/ru-central1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`;

        await maybeFetchError(
          await ppp.fetch(`https://${host}/${key}`, {
            method: 'PUT',
            headers: {
              Authorization,
              'x-amz-date': xAmzDate,
              'x-amz-content-sha256': hashedPayload
            },
            body: zipBlob
          }),
          'Не удалось загрузить файл записи в облачное хранилище.'
        );
      } else {
        this.status = 'failed';
      }
    } catch (e) {
      console.dir(e);

      this.status = 'failed';
    }
  }
}

pppOrderInstanceForWorkerIs(MarketDataRecorderOrder);

export default MarketDataRecorderOrder;
