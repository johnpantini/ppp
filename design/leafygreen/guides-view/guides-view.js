import { GuidesView } from '../../../lib/guides-view/guides-view.js';
import { guidesViewTemplate as template } from '../../../lib/guides-view/guides-view.template.js';
import { guidesViewStyles as styles } from '../../../lib/guides-view/guides-view.styles.js';

export const guidesView = GuidesView.compose({
  baseName: 'guides-view',
  template,
  styles
});
