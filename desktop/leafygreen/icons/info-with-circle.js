import { svg } from './svg.js';

export const infoWithCircle = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM9 4a1 1 0 11-2 0 1 1 0 012 0zM8 6a1 1 0 011 1v4h.5a.5.5 0 010 1h-3a.5.5 0 010-1H7V7h-.5a.5.5 0 010-1H8z" fill="currentColor"></path>'
  });
