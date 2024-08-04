/** @decorator */

import {
  ConditionalOrder,
  pppOrderInstanceForWorkerIs
} from '../../conditional-order.js';
import { observable } from '../../../lib/fast/observable.js';
import { TRADER_DATUM } from '../../const.js';
import {
  generateYCAWSSigningKey,
  getYCPsinaFolder
} from '../../../elements/pages/api-yc.js';
import { maybeFetchError } from '../../ppp-errors.js';
import { HMAC, sha256, uuidv4 } from '../../ppp-crypto.js';

class MarketDataRecorderOrder extends ConditionalOrder {
  @observable
  eventCounter;

  @observable
  startedAt;

  startedAtChanged() {
    return this.changed();
  }

  @observable
  pausedAt;

  pausedAtChanged() {
    return this.changed();
  }

  @observable
  elapsedSeconds;

  elapsedSecondsChanged() {
    return this.changed();
  }

  orderbooks = [];

  prints = [];

  tradingStatuses = [];

  orderbookTrader;

  @observable
  orderbook;

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

      return this.changed();
    }
  }

  printTrader;

  @observable
  print;

  printChanged(oldValue, print) {
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

      return this.changed();
    }
  }

  tradingStatusTrader;

  @observable
  tradingStatus;

  tradingStatusChanged(oldValue, tradingStatus) {
    if (this.status === 'working') {
      this.eventCounter++;
      this.tradingStatuses.push([tradingStatus, Date.now()]);

      return this.changed();
    }
  }

  constructor() {
    super();

    this.eventCounter = 0;
    this.elapsedSeconds = 0;
  }

  async place({ mainTrader, instrument, direction, payload }) {
    super.place({ mainTrader, instrument, direction, payload });

    this.status = 'pending';

    if (this.payload.autoStart ?? this.payload.order.autoStart) {
      return this.start();
    } else {
      return this.pause();
    }
  }

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

  cancel({ force }) {
    if (this.status === 'executed' || force) {
      super.cancel();
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      eventCounter: this.eventCounter,
      startedAt: this.startedAt,
      pausedAt: this.pausedAt,
      elapsedSeconds: this.elapsedSeconds
    };
  }

  async flushDataToCloud() {
    try {
      if (typeof process !== 'undefined' && process.release.name === 'node') {
        // Remote worker.
        // TODO: Implement remote worker.
      } else {
        // Browser.
        await import('../../../vendor/zip-full.min.js');

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
                `https://storage.api.cloud.yandex.net/storage/v1/buckets`,
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
          const reader = new FileReader();

          reader.readAsArrayBuffer(zipBlob);

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
      }
    } catch (e) {
      console.dir(e);

      this.status = 'failed';
    }
  }
}

pppOrderInstanceForWorkerIs(MarketDataRecorderOrder);

export default MarketDataRecorderOrder;
