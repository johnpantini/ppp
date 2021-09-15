import { svg } from './svg.js';

export const checkmark = ({ size, role, slot, cls }) =>
  svg({
    size,
    role,
    slot,
    cls,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M6.306 9.05l5.455-5.455a1 1 0 011.414 0l.707.707a1 1 0 010 1.414l-7.067 7.068a1 1 0 01-1.5-.098l-3.049-3.97a1 1 0 01.184-1.402l.595-.457a1.25 1.25 0 011.753.23L6.306 9.05z" fill="currentColor"></path>'
  });
