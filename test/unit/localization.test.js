import { expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../i18n/', import.meta.url));

/**
 * @param {string} directory Translation directory.
 * @returns {string[]} Absolute translation module paths.
 */
function dictionaries(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const file = join(directory, entry.name);

      return entry.isDirectory()
        ? dictionaries(file)
        : file.endsWith('.i18n.js')
          ? [file]
          : [];
    })
    .sort();
}

/**
 * Flattens the same nested namespaces accepted by the application's registry.
 * @param {object} phrases Nested phrases passed to extend().
 * @param {Map<string, string>} target Destination dictionary.
 * @param {string} [prefix] Parent namespace.
 * @returns {void}
 */
function extend(phrases, target, prefix = '') {
  for (const [key, value] of Object.entries(phrases)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      extend(value, target, path);
    } else {
      expect(typeof value, path).toBe('string');
      target.set(path, value);
    }
  }
}

for (const file of dictionaries(root)) {
  const name = relative(root, file).replaceAll('\\', '/');

  test(`localization ${name} registers string phrases and stable interpolation tokens`, async () => {
    const register = (await import(pathToFileURL(file).href)).default;
    const phrases = new Map();
    expect(typeof register).toBe('function');
    await register({ extend: (data) => extend(data, phrases) });
    expect(phrases.size).toBeGreaterThan(0);

    for (const [key, value] of phrases) {
      // A broken placeholder would become visible text instead of a substitution.
      expect(value.replace(/%\{[^{}]+\}/g, ''), key).not.toContain('%{');
    }
  });
}
