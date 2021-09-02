import { svg } from './svg.js';

export const chevronLeft = ({ size, role, slot, cls }) =>
  svg({
    size,
    role,
    slot,
    cls,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.778 1.636a1 1 0 00-1.414 0l-4.95 4.95-.707.707a1 1 0 000 1.414l.707.707 4.95 4.95a1 1 0 001.414 0l.707-.707a1 1 0 000-1.414L7.243 8l4.242-4.243a1 1 0 000-1.414l-.707-.707z" fill="currentColor"></path>'
  });
