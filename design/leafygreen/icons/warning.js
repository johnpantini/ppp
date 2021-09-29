import { svg } from './svg.js';

export const warning = ({ size, role, slot, cls, viewBox }) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M8.864 2.514a.983.983 0 00-1.728 0L1.122 13.539A.987.987 0 001.986 15h12.028a.987.987 0 00.864-1.461L8.864 2.514zM7 6a1 1 0 012 0v4a1 1 0 11-2 0V6zm2 7a1 1 0 11-2 0 1 1 0 012 0z" fill="currentColor"></path>'
  });
