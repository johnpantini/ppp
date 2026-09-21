import { expect, test } from 'bun:test';
import { coverageInventory } from '../../bin/coverage-inventory.js';

test('coverage inventory includes unloaded files and normalizes Windows paths', () => {
  expect(
    coverageInventory(
      ['lib/a.js', 'elements/b.js', 'lib\\a.js', 'lib/c.js'],
      'TN:\r\nSF:lib\\a.js\r\nLF:3\r\nLH:2\r\nend_of_record\r\nSF:node_modules/example.js\n'
    )
  ).toEqual({
    totalFiles: 3,
    measured: ['lib/a.js'],
    unmeasured: ['elements/b.js', 'lib/c.js'],
    lines: { covered: 2, total: 3, percent: 66.67 }
  });
});

test('an empty coverage file never implies complete coverage', () => {
  expect(coverageInventory(['./ppp.js'], '')).toEqual({
    totalFiles: 1,
    measured: [],
    unmeasured: ['ppp.js'],
    lines: { covered: 0, total: 0, percent: null }
  });
});

test('line coverage weights large modules and excludes dependencies', () => {
  const report = coverageInventory(
    ['small.js', 'large.js'],
    'SF:small.js\nLF:1\nLH:1\nend_of_record\n' +
      'SF:large.js\nLF:100\nLH:50\nend_of_record\n' +
      'SF:vendor/other.js\nLF:999\nLH:999\nend_of_record\n'
  );

  expect(report.lines).toEqual({ covered: 51, total: 101, percent: 50.5 });
});
