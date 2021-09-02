import { svg } from './svg.js';

export const plus = ({ size, role, slot, cls }) =>
  svg({
    size,
    role,
    slot,
    cls,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 2a1 1 0 00-1 1v3.5H3a1 1 0 00-1 1v1a1 1 0 001 1h3.5V13a1 1 0 001 1h1a1 1 0 001-1V9.5H13a1 1 0 001-1v-1a1 1 0 00-1-1H9.5V3a1 1 0 00-1-1h-1z" fill="currentColor"></path>'
  });
