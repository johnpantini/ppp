import {
  Page,
  PageWithDocuments,
  PageWithShiftLock,
  PageWithActionPage
} from './page.js';
import { Observable } from './element/observation/observable.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { parsePPPScript } from './ppp-script.js';
import { SERVICES, VERSIONING_STATUS } from './const.js';
import { later } from './later.js';

export class ServicesPage extends Page {
  collection = 'services';

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .find({
          removed: { $ne: true }
        })
        .sort({ updatedAt: -1 });
    };
  }

  async transform() {
    return Promise.all(
      this.documents.map((d) => {
        if (d.type !== SERVICES.PPP_ASPIRANT_WORKER) {
          d.versioningStatus = VERSIONING_STATUS.OK;
          d.actualVersion = 1;

          return d;
        }

        if (!d.useVersioning || !d.versioningUrl) {
          d.versioningStatus = VERSIONING_STATUS.OFF;
          d.actualVersion = 'N/A';

          return d;
        }

        return (async () => {
          let url;

          if (d.versioningUrl.startsWith('/')) {
            const rootUrl = window.location.origin;

            if (rootUrl.endsWith('.github.io'))
              url = new URL('/ppp' + d.versioningUrl, rootUrl);
            else url = new URL(d.versioningUrl, rootUrl);
          } else {
            url = new URL(d.versioningUrl);
          }

          const fcRequest = await fetch(url.toString(), {
            cache: 'no-cache'
          });

          const parsed = parsePPPScript(await fcRequest.text());

          if (parsed && Array.isArray(parsed.meta?.version)) {
            const [version] = parsed.meta?.version;

            d.actualVersion = Math.abs(+version) || 1;
            d.versioningStatus =
              d.version < d.actualVersion
                ? VERSIONING_STATUS.OLD
                : VERSIONING_STATUS.OK;
          }

          return d;
        })();
      })
    );
  }

  async updateService(datum) {
    await this.actionPageCall({
      page: `service-${datum.type}`,
      documentId: datum._id,
      methodName: 'updateService'
    });

    await later(1000);

    const index = this.documents.findIndex((d) => d._id === datum._id);

    if (index > -1) {
      this.documents[index].version = datum.actualVersion;
      this.documents[index].versioningStatus = VERSIONING_STATUS.OK;
    }

    Observable.notify(this, 'documents');
  }

  async removeService(datum) {
    await this.actionPageCall({
      page: `service-${datum.type}`,
      documentId: datum._id,
      methodName: 'cleanupService'
    });

    await later(1000);

    const index = this.documents.findIndex((d) => d._id === datum._id);

    if (index > -1) {
      this.documents.splice(index, 1);
    }

    Observable.notify(this, 'documents');
  }
}

applyMixins(
  ServicesPage,
  PageWithDocuments,
  PageWithShiftLock,
  PageWithActionPage
);
