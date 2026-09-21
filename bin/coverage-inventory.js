import { readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceFiles } from './check-project.js';

const root = fileURLToPath(new URL('../', import.meta.url));

/**
 * Lists which application sources appear in Bun's LCOV output.
 * Missing files are unmeasured, not assumed to have zero executable lines.
 * VM-evaluated sources can be exercised without appearing in this report.
 * @param {string[]} files Repository-relative application source paths.
 * @param {string} lcov LCOV text produced by the current test run.
 * @returns {{totalFiles: number, measured: string[], unmeasured: string[], lines: {covered: number, total: number, percent: number | null}}}
 */
export function coverageInventory(files, lcov) {
  const normalize = (path) => path.replaceAll('\\', '/').replace(/^\.\//, '');
  const measured = new Set(
    [...lcov.matchAll(/^SF:(.+)$/gm)].map((match) => normalize(match[1].trim()))
  );
  const sources = [...new Set(files.map(normalize))].sort();
  const sourceSet = new Set(sources);
  const counts = new Map();

  for (const record of lcov.split('end_of_record')) {
    const file = record.match(/^SF:(.+)$/m)?.[1]?.trim();

    if (file && sourceSet.has(normalize(file))) {
      counts.set(normalize(file), {
        total: Number(record.match(/^LF:(\d+)/m)?.[1] ?? 0),
        covered: Number(record.match(/^LH:(\d+)/m)?.[1] ?? 0)
      });
    }
  }

  const lines = { covered: 0, total: 0, percent: null };

  for (const count of counts.values()) {
    lines.covered += count.covered;
    lines.total += count.total;
  }

  if (lines.total) {
    lines.percent = Math.round((lines.covered / lines.total) * 10000) / 100;
  }

  return {
    totalFiles: sources.length,
    measured: sources.filter((file) => measured.has(file)),
    unmeasured: sources.filter((file) => !measured.has(file)),
    lines
  };
}

if (import.meta.main) {
  const files = sourceFiles()
    .map((file) => relative(root, file).replaceAll('\\', '/'))
    .filter(
      (file) => !/^(test|bin)\//.test(file) && file !== 'lib/ppp-charts.js'
    );
  const report = coverageInventory(
    files,
    readFileSync(new URL('../coverage/lcov.info', import.meta.url), 'utf8')
  );

  writeFileSync(
    new URL('../coverage/inventory.json', import.meta.url),
    JSON.stringify(report, null, 2) + '\n'
  );
  console.log(
    `LCOV measures ${report.measured.length}/${report.totalFiles} application source files. ` +
      `${report.unmeasured.length} unmeasured files are listed in coverage/inventory.json.`
  );
  console.log(
    `Instrumented application lines: ${report.lines.covered}/${report.lines.total} ` +
      `(${report.lines.percent ?? 'unavailable'}%). Unmeasured files are excluded from this percentage.`
  );
}
