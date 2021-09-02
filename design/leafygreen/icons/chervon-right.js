import { svg } from './svg.js';

export const chevronRight = ({ size, role, slot, cls }) =>
  svg({
    size,
    role,
    slot,
    cls,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M5.364 14.364a1 1 0 001.414 0l4.95-4.95.707-.707a1 1 0 000-1.414l-.707-.707-4.95-4.95a1 1 0 00-1.414 0l-.707.707a1 1 0 000 1.414L8.899 8l-4.242 4.243a1 1 0 000 1.414l.707.707z" fill="currentColor"></path>'
  });
