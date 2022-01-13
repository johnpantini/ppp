import { PageWithTable } from '../page.js';

export class ServersPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d._id
    },
    {
      label: 'Адрес',
      sortBy: (d) => d.host
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
    return this.app.ppp.user.functions.find({
      collection: 'servers'
    });
  }

  async remove(_id) {
    return {
      pre: async () => {
        return this.removeDocument({ collection: 'servers' }, { _id });
      }
    };
  }
}
