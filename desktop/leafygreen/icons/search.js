import { svg } from './svg.js';

export const search = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M2.323 9.819a5.302 5.302 0 006.463.805l4.144 4.144a1.3 1.3 0 101.838-1.838l-4.144-4.144a5.302 5.302 0 00-8.3-6.463 5.3 5.3 0 000 7.496zM7.98 4.162A2.7 2.7 0 114.162 7.98 2.7 2.7 0 017.98 4.162z" fill="currentColor"></path>'
  });
