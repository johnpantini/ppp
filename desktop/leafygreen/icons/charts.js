import { svg } from './svg.js';

export const charts = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path d="M11.5 13a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1h-1a1 1 0 00-1 1v10zM7.5 14a1 1 0 01-1-1V6a1 1 0 011-1h1a1 1 0 011 1v7a1 1 0 01-1 1h-1zM2.5 14a1 1 0 01-1-1V9a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1h-1z" fill="currentColor"></path>'
  });
