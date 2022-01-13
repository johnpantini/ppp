import { PageWithTable } from '../page.js';
import { Observable } from '../element/observation/observable.js';

export class ApisPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d._id
    },
    {
      label: 'Тип',
      sortBy: (d) => d.type
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
    return this.app.ppp.user.functions.aggregate(
      {
        collection: 'apis'
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
