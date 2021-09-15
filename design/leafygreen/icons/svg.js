import { sizeMap } from './size-map.js';
import { html } from '../../../lib/element/templating/template.js';

export const svg = ({ size = 16, role = 'img', content = '', slot, cls }) => {
  const width = typeof size === 'number' ? size : sizeMap[size];
  const height = typeof size === 'number' ? size : sizeMap[size];

  return html`<svg
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}"
    role="${role}"
    ${typeof slot === 'string' ? 'slot="' + slot + '"' : ''}
    ${typeof cls === 'string' ? 'class="' + cls + '"' : ''}
  >
    ${content}
  </svg>`;
};
