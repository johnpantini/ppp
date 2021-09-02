import { svg } from './svg.js';

export const arrowRight = ({ size, role, slot, cls }) =>
  svg({
    size,
    role,
    slot,
    cls,
    content:
      '<path d="M3 6.832h6.944L8.41 5.297a1 1 0 010-1.414l.24-.239a1 1 0 011.414 0l3.382 3.383c.01.008.018.017.027.026l.24.239a1 1 0 010 1.414l-3.652 3.651a1 1 0 01-1.414 0l-.239-.239a1 1 0 010-1.414L9.941 9.17H3a1 1 0 01-1-1v-.338a1 1 0 011-1z" fill="currentColor"></path>'
  });
