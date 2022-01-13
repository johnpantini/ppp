import { svg } from './svg.js';

export const arrowLeft = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path d="M13 6.832H6.056L7.59 5.297a1 1 0 000-1.414l-.24-.239a1 1 0 00-1.414 0L2.555 7.027c-.01.008-.018.017-.027.026l-.24.239a1 1 0 000 1.414l3.652 3.651a1 1 0 001.414 0l.239-.239a1 1 0 000-1.414L6.059 9.17H13a1 1 0 001-1v-.338a1 1 0 00-1-1z" fill="currentColor"></path>'
  });
