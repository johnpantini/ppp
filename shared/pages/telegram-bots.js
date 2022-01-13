import { PageWithTable } from '../page.js';
import { Observable } from '../element/observation/observable.js';

export class TelegramBotsPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d._id
    },
    {
      label: 'Дата создания',
      sortBy: (d) => d.created_at
    },
    {
      label: 'Последнее изменение',
      sortBy: (d) => d.updated_at
    },
    {
      label: 'Действия'
    }
  ];

  async data() {
    return await this.app.ppp.user.functions.aggregate(
      {
        collection: 'bots'
      },
      [
        {
          $match: {
            removed: { $not: { $eq: true } }
          }
        }
      ]
    );
  }
}
