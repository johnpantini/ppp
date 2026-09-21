import { afterEach, expect, mock, test } from 'bun:test';
import { installDOM } from '../helpers/dom.js';

installDOM();

const { Checkbox } = await import('../../elements/checkbox.js');
const { Radio } = await import('../../elements/radio.js');
const { TextField } = await import('../../elements/text-field.js');
const { Updates } = await import('../../vendor/fast-element.min.js');
const { validate, validateDistanceElement, invalidate, openTabOrFolding } =
  await import('../../lib/ppp-errors.js');

afterEach(() => {
  document.body.replaceChildren();
  Updates.process();
});

test('checkbox exposes state and emits change after user interaction', () => {
  const checkbox = new Checkbox();
  const change = mock();

  document.body.append(checkbox);
  checkbox.addEventListener('change', change);
  checkbox.clickHandler();
  Updates.process();
  expect(checkbox.checked).toBe(true);
  expect(checkbox.getAttribute('aria-checked')).toBe('true');
  expect(change).toHaveBeenCalledTimes(1);
  checkbox.keypressHandler({ key: ' ' });
  expect(checkbox.checked).toBe(false);
});

test.each(['disabled', 'readOnly'])(
  'checkbox ignores clicks while %s',
  (flag) => {
    const checkbox = new Checkbox();

    checkbox[flag] = true;
    checkbox.clickHandler();
    expect(checkbox.checked).toBe(false);
  }
);

test('radio clicks select once and preserve readonly state', () => {
  const radio = new Radio();

  radio.clickHandler();
  expect(radio.checked).toBe(true);
  radio.clickHandler();
  expect(radio.checked).toBe(true);
  radio.checked = false;
  radio.readOnly = true;
  radio.clickHandler();
  expect(radio.checked).toBe(false);
});

test('text field synchronizes input, clears errors and toggles password visibility', () => {
  const field = new TextField();

  // Happy DOM cannot parse FAST's temporary `list` binding marker. Exercise
  // the real input handlers against a native control without rendering this template.
  field.control = document.createElement('input');
  field.appearance = 'error';
  field.control.value = 'hello';
  field.handleTextInput();
  expect(field.value).toBe('hello');
  expect(field.appearance).toBe('default');
  field.value = null;
  expect(field.value).toBe('');
  field.control.type = 'password';
  field.togglePasswordVisibility();
  expect(field.control.type).toBe('text');
  expect(field.passwordVisible).toBe(true);
  field.togglePasswordVisibility();
  expect(field.control.type).toBe('password');
});

test.each(['', '   ', undefined])(
  'required validation rejects %p with element details',
  async (value) => {
    const field = new TextField();
    field.value = value;

    await expect(validate(field)).rejects.toMatchObject({
      name: 'ValidationError',
      status: 422,
      element: field
    });
    expect(field.appearance).toBe('error');
    expect(field.errorMessage).toBe('$pppErrors.E_REQUIRED_FIELD');
  }
);

test('validation accepts zero, checks URLs/dates and awaits custom predicates', async () => {
  const field = new TextField();

  field.value = 0;
  await validate(field);
  field.value = 'https://example.test/path';
  await validate(field, 'url');
  field.value = 'not-a-url';
  await expect(validate(field, 'url')).rejects.toThrow();
  field.value = '2025-01-02';
  await validate(field, 'date');
  field.value = 'not-a-date';
  await expect(validate(field, 'date')).rejects.toThrow();
  await expect(
    validate(field, { hook: async () => false, errorMessage: 'custom' })
  ).rejects.toThrow('custom');
  await validate(field, { hook: async () => true });
  expect(field.appearance).toBe('default');
});

test.each(['abc', '0%', '-1+'])(
  'distance validation rejects %s',
  async (value) => {
    const field = new TextField();

    field.value = value;
    await expect(validateDistanceElement(field)).rejects.toThrow();
  }
);

test('distance validation permits empty optional fields and positive distances', async () => {
  const field = new TextField();

  await validateDistanceElement(field);
  field.value = '2,5%';
  await validateDistanceElement(field);
});

test('validation reveals the containing folding and tab before focusing', () => {
  const tabs = document.createElement('div');
  const panel = document.createElement('div');
  const folding = document.createElement('div');
  const field = document.createElement('input');
  field.$fastController = { definition: { type: { name: 'TestInput' } } };

  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'settings-tab');
  folding.className = 'folding';
  tabs.append(panel);
  panel.append(folding);
  folding.append(field);
  document.body.append(tabs);
  openTabOrFolding(field, { doNotScrollIntoView: true });
  Updates.process();
  expect(folding.classList.contains('folding-open')).toBe(true);
  expect(tabs.activeid).toBe('settings-tab');
  expect(() =>
    invalidate(field, {
      errorMessage: 'invalid',
      raiseException: true,
      skipScrollIntoView: true
    })
  ).toThrow('invalid');
  expect(field.errorMessage).toBe('invalid');
});
