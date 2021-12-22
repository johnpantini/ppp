import { svg } from './svg.js';

export const trash = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M5 2a1 1 0 011-1h4a1 1 0 011 1h2a1 1 0 011 1v1H2V3a1 1 0 011-1h2zm9 3H2l1.678 8.392A2 2 0 005.64 15h4.72a2 2 0 001.962-1.608L14 5z" fill="currentColor"></path>'
  });
