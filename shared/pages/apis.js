import { PageWithTable } from '../page.js';

export class ApisPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d.name
    },
    {
      label: 'Тип',
      sortBy: (d) => d.type
    },
    {
      label: 'Дата создания',
      sortBy: (d) => d.createdAt
    },
    {
      label: 'Последнее изменение',
      sortBy: (d) => d.updatedAt
    },
    {
      label: 'Версия',
      sortBy: (d) => d.version
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
