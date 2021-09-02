import { SideNavGroup } from '../../../lib/side-nav-group/side-nav-group.js';
import { sideNavGroupTemplate as template } from './side-nav-group.template.js';
import { sideNavGroupStyles as styles } from './side-nav-group.styles.js';

export const sideNavGroup = SideNavGroup.compose({
  baseName: 'side-nav-group',
  template,
  styles
});
