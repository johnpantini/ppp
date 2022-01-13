import { svg } from './svg.js';

export const building = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M1 2a1 1 0 011-1h5a1 1 0 011 1v13H6v-2H4v2H1v-4h4.5a.5.5 0 000-1H1V8h4.5a.5.5 0 000-1H1V5h4.5a.5.5 0 000-1H1V2zm8 9h4.5a.5.5 0 000-1H9V8h4.5a.5.5 0 000-1H9V5a1 1 0 011-1h5a1 1 0 011 1v10h-2v-2h-2v2H9v-4z" fill="currentColor"></path>'
  });
