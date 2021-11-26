const idCounter = {};

export function uniqueId(prefix = 'ppp') {
  if (!idCounter[prefix]) {
    idCounter[prefix] = 0;
  }

  const id = ++idCounter[prefix];

  if (prefix === 'ppp') {
    return `${id}`;
  }

  return `${prefix}${id}`;
}
