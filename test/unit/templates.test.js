import { expect, spyOn, test } from 'bun:test';
import { parsePPPScript } from '../../lib/ppp-script.js';
import { Tmpl } from '../../lib/tmpl.js';

test('parses repeated metadata and preserves the script body', () => {
  const script =
    '// ==PPPScript==\n// @version 1\n// @tag one\n// @tag two\n// ignored\n// ==/PPPScript==\nreturn 42;';

  expect(parsePPPScript(script)).toEqual({
    meta: { version: ['1'], tag: ['one', 'two'] },
    content: '\nreturn 42;'
  });
  expect(parsePPPScript(script.replaceAll('\n', '\r\n')).content).toBe(
    '\r\nreturn 42;'
  );
  expect(parsePPPScript()).toBeNull();
  expect(parsePPPScript('return 42;')).toBeNull();
});

test('invalid script input returns null and reports the parse error', () => {
  const error = spyOn(console, 'error').mockImplementation(() => {});

  expect(parsePPPScript(null)).toBeNull();
  expect(error).toHaveBeenCalledTimes(1);
});

test('escapes interpolation while raw interpolation stays raw', async () => {
  expect(
    await new Tmpl().render({}, '[%= payload.text %]|[%# payload.text %]', {
      text: '<b>&"\'\0'
    })
  ).toBe('&lt;b&gt;&amp;&quot;&#39;|<b>&"\'\0');
  expect(await new Tmpl().render({}, "quote'\\\n\r\t")).toBe("quote'\\\n\r\t");
});

test('supports async evaluation, context, helpers and custom argument names', async () => {
  const template = new Tmpl(undefined, 'data');

  expect(
    await template.render(
      { prefix: 'ok' },
      '[% for (const n of data) { %][%= await Promise.resolve(n) %][% } %]-[%# this.prefix %]-[%# json({a: 1}) %]',
      [1, 2]
    )
  ).toBe('12-ok-{"a":1}');
  expect(
    await template.render({}, '[% print("<", false); print(">", true); %]')
  ).toBe('&lt;>');
});

test('supports a reusable compiled function and rejects invalid expressions', async () => {
  const render = await new Tmpl().render({}, '[%= payload.name %]', null);

  expect(await render({ name: 'one' })).toBe('one');
  expect(await render({ name: 'two' })).toBe('two');
  await expect(new Tmpl().render({}, '[%= missing.value %]')).rejects.toThrow();
});
