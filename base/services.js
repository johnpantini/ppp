import { PageWithTable } from '../lib/page/page.js';

export class ServicesPage extends PageWithTable {
  static i18n = ['services'];

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
      label: 'Действия'
    }
  ];

  async data() {
    return await this.app.ppp.user.functions.aggregate(
      {
        collection: 'services'
      },
      [
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

  async remove(_id) {
    return this.removeDocument({ collection: 'services' }, { _id });
  }
}
