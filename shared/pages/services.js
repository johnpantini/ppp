import { PageWithTable } from '../page.js';

export class ServicesPage extends PageWithTable {
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
      label: 'Состояние',
      sortBy: (d) => d.state
    }
  ];

  async data() {
    return await this.app.ppp.user.functions.aggregate(
      {
        collection: 'services'
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
