import { Page } from '../page.js';

export class ApisPage extends Page {
  collection = 'apis';

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
}
