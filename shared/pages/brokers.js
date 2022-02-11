import { PageWithTable } from '../page.js';

export class BrokersPage extends PageWithTable {
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
    }
  ];

  async data() {
    return this.app.ppp.user.functions.aggregate(
      {
        collection: 'brokers'
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
