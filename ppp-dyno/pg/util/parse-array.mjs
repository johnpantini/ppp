export function parsePostgresArray(s, opts) {
  if (!s) return;

  const sep = (opts?.separator || ',').substring(0, 1);
  const transform = opts?.transform;
  const len = s.length;
  let idx = 0;
  const out = [];
  const iterate = (arr) => {
    let c;
    let exactlyValue = false;
    let token = '';
    let quote = '';

    while (idx < len) {
      c = s.charAt(idx++);

      if (!quote) {
        if (!token && c === '{') {
          const a = [];

          arr.push(a);
          iterate(a);
          continue;
        }

        if (c === '}' || c === sep) {
          if (token) {
            if (token === 'NULL' && !exactlyValue) arr.push(null);
            else arr.push(transform ? transform(token) : token);

            exactlyValue = false;
          }

          token = '';

          if (c === '}') return;

          continue;
        }
      }

      if (c === '\\') {
        c = s.charAt(idx++);
        token += c;
        continue;
      }

      if (c === '"' || c === "'") {
        if (quote && quote === c) {
          quote = '';
        } else {
          exactlyValue = true;
          quote = c;
        }

        continue;
      }

      token += c;
    }
  };

  iterate(out);

  return out.length ? out[0] : undefined;
}
