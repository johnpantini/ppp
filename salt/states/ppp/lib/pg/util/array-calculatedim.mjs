export function arrayCalculateDim(arr) {
  if (!arr || arr.length === 0) return [0];

  const dim = [arr.length];
  const iterate = (a, level) => {
    for (let i = 0; i < a.length; i++) {
      if (Array.isArray(a[i])) {
        dim[level] = Math.max(dim[level] || 0, a[i].length);
        iterate(a[i], level + 1);
      }
    }
  };

  iterate(arr, 1);

  return dim;
}
