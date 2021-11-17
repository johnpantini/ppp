import { svg } from './svg.js';

export const apps = ({ size, role, slot, cls }) =>
  svg({
    size,
    role,
    slot,
    cls,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M7 3H3v4h4V3zm0 6H3v4h4V9zm2-6h4v4H9V3zm4 6H9v4h4V9z" fill="currentColor"></path>'
  });
