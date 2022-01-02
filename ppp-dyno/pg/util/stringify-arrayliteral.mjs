import { arrayCalculateDim } from './array-calculatedim.mjs';

export function stringifyArrayLiteral(value, options, encode) {
  const dim = arrayCalculateDim(value);
  const writeDim = (arr, level) => {
    const elemCount = dim[level];
    const out = [];

    for (let i = 0; i < elemCount; i++) {
      let x = arr && arr[i];

      if (level < dim.length - 1) {
        if (x != null && !Array.isArray(x)) x = [x];

        out.push(writeDim(x, level + 1));
        continue;
      }

      // if value is null
      if (x == null) {
        out.push('NULL');
        continue;
      }

      if (Array.isArray(x)) {
        out.push(stringifyArrayLiteral(x, options, encode));
        continue;
      }

      if (encode) x = encode(x, options || {});

      out.push(escapeArrayItem('' + x));
    }

    return '{' + out.join(',') + '}';
  };

  return writeDim(value, 0);
}

function escapeArrayItem(str) {
  return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}
