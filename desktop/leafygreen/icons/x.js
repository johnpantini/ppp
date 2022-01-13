import { svg } from './svg.js';

export const x = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.203 3.404a1 1 0 00-1.414 0L8.314 5.879 5.839 3.404a1 1 0 00-1.414 0l-.707.707a1 1 0 000 1.414L6.192 8l-2.474 2.475a1 1 0 000 1.414l.707.707a1 1 0 001.414 0l2.475-2.475 2.475 2.475a1 1 0 001.414 0l.707-.707a1 1 0 000-1.414L10.435 8l2.475-2.475a1 1 0 000-1.414l-.707-.707z" fill="currentColor"></path>'
  });
