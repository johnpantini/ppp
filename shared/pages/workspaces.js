import { Observable } from '../element/observation/observable.js';
import { PageWithTable } from '../page.js';

export class WorkspacesPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d._id
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
    return await this.app.ppp.user.functions.aggregate({
      collection: 'workspaces'
    });
  }

  async remove(_id) {
    return {
      pre: async () => {
        return this.removeDocument({ collection: 'workspaces' }, { _id });
      },
      post: async () => {
        const index = this.app.workspaces.findIndex((x) => x._id === _id);

        if (index > -1) this.app.workspaces.splice(index, 1);

        Observable.notify(this.app, 'workspaces');
      }
    };
  }
}
