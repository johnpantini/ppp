import { PageWithTable } from '../page.js';

export class ServicesPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d._id
    },
    {
      label: 'Сервер',
      sortBy: (d) => d.server_uuid
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
        },
        {
          $lookup: {
            from: 'servers',
            localField: 'server_uuid',
            foreignField: 'uuid',
            as: 'server'
          }
        }
      ]
    );
  }
}
