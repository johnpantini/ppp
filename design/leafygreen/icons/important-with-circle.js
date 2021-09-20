import { svg } from './svg.js';

export const importantWithCircle = ({ size, role, slot, cls }) =>
  svg({
    size,
    role,
    slot,
    cls,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM7 4.5a1 1 0 012 0v4a1 1 0 01-2 0v-4zm2 7a1 1 0 11-2 0 1 1 0 012 0z" fill="currentColor"></path>'
  });
