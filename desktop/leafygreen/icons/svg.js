import { sizeMap } from './size-map.js';
import { html } from '../../../shared/element/templating/template.js';

export const svg = ({
  size = 16,
  role = 'img',
  content = '',
  slot,
  cls,
  viewBox
}) => {
  const width = typeof size === 'number' ? size : sizeMap[size];
  const height = typeof size === 'number' ? size : sizeMap[size];
  const vb = viewBox ?? `0 0 ${width} ${height}`;

  return html` <svg
    width="${width}"
    height="${height}"
    viewBox="${vb}"
    role="${role}"
    ${typeof slot === 'string' ? 'slot="' + slot + '"' : ''}
    ${typeof cls === 'string' ? 'class="' + cls + '"' : ''}
  >
    ${content}
  </svg>`;
};
