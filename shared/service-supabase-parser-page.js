import { Page, PageWithService, PageWithSupabaseService } from './page.js'
import { applyMixins } from './utilities/apply-mixins.js';

export class ServiceSupabaseParserPage extends Page {
  collection = 'services';

  async read() {
    return (context) => {
      return context.services
      .get('mongodb-atlas')
      .db('ppp')
      .collection('[%#this.page.view.collection%]')
      .aggregate([
        {
          $match: {
            _id: new BSON.ObjectId('[%#payload.documentId%]'),
            type: `[%#(await import('./const.js')).SERVICES.SUPABASE_PARSER%]`
          }
        },
        {
          $lookup: {
            from: 'apis',
            localField: 'apiId',
            foreignField: '_id',
            as: 'api'
          }
        },
        {
          $unwind: '$api'
        },
        {
          $lookup: {
            from: 'bots',
            localField: 'botId',
            foreignField: '_id',
            as: 'bot'
          }
        },
        {
          $unwind: '$bot'
        }
      ]);
    };
  }
}

applyMixins(ServiceSupabaseParserPage, PageWithService, PageWithSupabaseService);
