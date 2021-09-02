import { SideNav } from '../../../lib/side-nav/side-nav.js';
import { sideNavTemplate as template } from './side-nav.template.js';
import { sideNavStyles as styles } from './side-nav.styles.js';

export const sideNav = SideNav.compose({
  baseName: 'side-nav',
  template,
  styles
});
