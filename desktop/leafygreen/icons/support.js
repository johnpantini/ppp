import { svg } from './svg.js';

export const support = ({ size, role, slot, cls, viewBox } = {}) =>
  svg({
    size,
    role,
    slot,
    cls,
    viewBox,
    content:
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M5 7a3 3 0 016 0v2.5c0 1.51-.957 2.798-2.298 3.288a1 1 0 10.265.967 4.512 4.512 0 002.787-2.785c.08.02.161.03.246.03h.5a2.5 2.5 0 00.406-4.967 5.002 5.002 0 00-9.813 0A2.5 2.5 0 003.5 11H4a1 1 0 001-1V7z" fill="currentColor"></path>'
  });
