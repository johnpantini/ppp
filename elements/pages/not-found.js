import { html, css } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';

export const notFoundPageTemplate = html` <template></template> `;

export const notFoundPageStyles = css`
  ${pageStyles}
`;

export class NotFoundPage extends Page {}

export default NotFoundPage.compose({
  template: notFoundPageTemplate,
  styles: notFoundPageStyles
}).define();
