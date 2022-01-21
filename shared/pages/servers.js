import { PageWithTable } from '../page.js';

export class ServersPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d.name
    },
    {
      label: 'Адрес',
      sortBy: (d) => d.hostname
    },
    {
      label: 'Порт',
      sortBy: (d) => d.port
    },
    {
      label: 'Пользователь',
      sortBy: (d) => d.username
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
    },
    {
      label: 'Действия'
    }
  ];

  async data() {
    return this.app.ppp.user.functions.aggregate(
      {
        collection: 'servers'
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
