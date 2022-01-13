import { svg } from './svg.js';

export const cloud = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path d="M12.571 8.143c0 1.775-.899 3.34-2.267 4.264l-.014.01a5.12 5.12 0 01-2.861.869H2.857a2.857 2.857 0 01-.545-5.663 5.144 5.144 0 0110.26.52zM13.821 8.143a6.38 6.38 0 01-2.358 4.96 3.429 3.429 0 102.17-6.506c.123.494.188 1.013.188 1.546z" fill="currentColor"></path>'
  });
