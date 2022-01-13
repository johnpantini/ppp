import { svg } from './svg.js';

export const laptop = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path d="M5 6a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5A.5.5 0 015 6zM5.5 7.5a.5.5 0 000 1h3a.5.5 0 000-1h-3z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3 2.5a1 1 0 00-1 1v7.813l-.29.49a.91.91 0 00-.068.1L1 13a1 1 0 001 1h12a1 1 0 001-1l-.642-1.096a.901.901 0 00-.067-.1L14 11.313V3.5a1 1 0 00-1-1H3zM12.5 4h-9v6.5h9V4z" fill="currentColor"></path>'
  });
