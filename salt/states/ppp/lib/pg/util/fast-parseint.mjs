export function fastParseInt(str) {
  if (typeof str === 'number') return Math.floor(str);

  if (typeof str !== 'string') return NaN;

  const strLength = str.length;
  let res = 0;
  let i = 0;
  let neg = false;

  if (str.startsWith('-')) {
    neg = true;
    i++;
  }

  do {
    const charCode = str.charCodeAt(i);

    if (charCode === 46) return res;

    if (charCode < 48 || charCode > 57) return NaN;

    res *= 10;
    res += charCode - 48;
  } while (++i < strLength);

  return neg ? -res : res;
}
