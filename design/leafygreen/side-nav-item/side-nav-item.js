import { SideNavItem } from '../../../lib/side-nav-item/side-nav-item.js';
import { sideNavItemTemplate as template } from './side-nav-item.template.js';
import { sideNavItemStyles as styles } from './side-nav-item.styles.js';

export const sideNavItem = SideNavItem.compose({
  baseName: 'side-nav-item',
  template,
  styles
});
