import { PageWithTable } from '../page.js';

export class BrokersPage extends PageWithTable {
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
        collection: 'brokers'
      }
    );
  }

  async remove(_id) {
    return this.removeDocument({ collection: 'brokers' }, { _id });
  }
}
