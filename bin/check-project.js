import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const excluded = new Set([
  '.git',
  '.claude',
  'node_modules',
  'vendor',
  'coverage',
  'build',
  'mkcert'
]);

/**
 * Enumerates maintained JavaScript; generated bundles and vendored code are
 * intentionally excluded, while deployable templates and manual tools remain.
 * @param {string} directory Absolute directory to inspect.
 * @returns {string[]} Absolute source paths, sorted for reproducible reports.
 */
export function sourceFiles(directory = root) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      if (excluded.has(entry.name)) return [];

      const path = join(directory, entry.name);

      if (entry.isDirectory()) return sourceFiles(path);
      if (
        !/\.(m?js)$/.test(entry.name) ||
        /\.min\./.test(entry.name) ||
        entry.name === 'ppf.full.js'
      )
        return [];

      return [path];
    })
    .sort();
}

/**
 * Parses project sources and resolves static relative imports without executing entry points.
 * Decorated sources use exactly the transformation served to production clients.
 * @returns {{checked: number, failures: {file: string, message: string}[]}}
 */
export function checkProject() {
  const context = { self: { addEventListener() {} } };

  runInNewContext(readFileSync(join(root, 'ppp-sw.js'), 'utf8'), context);

  const transpiler = new Bun.Transpiler({ loader: 'js', target: 'browser' });
  const failures = [];
  const files = sourceFiles();

  for (const file of files) {
    let source = readFileSync(file, 'utf8');

    try {
      if (source.startsWith('/** @decorator */')) {
        source = context.removeDecorators(source);
      }

      transpiler.transformSync(source);

      for (const entry of transpiler.scanImports(source)) {
        const path = entry.path.split(/[?#]/)[0];

        // Absolute runtime URLs, packages and deploy-time template imports are
        // resolved by their host, not by the local repository filesystem.
        if (!path.startsWith('.') || /[$\[\]]/.test(path)) continue;

        const target = resolve(dirname(file), path);
        const candidates = [
          target,
          `${target}.js`,
          `${target}.mjs`,
          `${target}.json`,
          join(target, 'index.js')
        ];

        if (!candidates.some(existsSync)) {
          failures.push({
            file: relative(root, file).replaceAll('\\', '/'),
            message: `Unresolved relative import: ${entry.path}`
          });
        }
      }
    } catch (error) {
      failures.push({
        file: relative(root, file).replaceAll('\\', '/'),
        message: String(error)
      });
    }
  }

  return { checked: files.length, failures };
}

if (import.meta.main) {
  const result = checkProject();

  for (const failure of result.failures)
    console.error(`${failure.file}: ${failure.message}`);

  console.log(
    `Checked syntax and relative imports in ${result.checked} JavaScript files; ${result.failures.length} failures.`
  );
  process.exitCode = result.failures.length ? 1 : 0;
}
