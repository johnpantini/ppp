import { svg } from './svg.js';

export const checkmarkWithCircle = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm2.448-10.104a.997.997 0 111.508 1.306l-4.572 5.28a1 1 0 01-1.64-.07l-1.82-2.868a1 1 0 111.69-1.07l1.1 1.734 3.734-4.312z" fill="currentColor"></path>'
  });
