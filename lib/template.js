import { html as baseHtml } from './element/templating/template.js';
import { $global } from './element/platform.js';

/**
 * This helper asynchronously automatically registers web components.
 * @public
 */
export function requireComponent(tagName, path) {
  const [_, component] = tagName.split(/ppp-/i);

  if (component) {
    import(
      path ?? `../design/${globalThis.ppp.theme}/${component}/${component}.js`
    ).then((module) => {
      const name = component.replace(/-./g, (x) => x[1].toUpperCase());

      $global.ppp.DesignSystem.getOrCreate().register(module[name]());
    });
  }

  return true;
}

/**
 * Transforms a template literal string into a renderable ViewTemplate.
 * @param strings - The string fragments that are interpolated with the values.
 * @param values - The values that are interpolated with the string fragments.
 * @remarks
 * The html helper supports interpolation of strings, numbers, binding expressions,
 * other template instances, and Directive instances.
 *
 * This html helper asynchronously automatically registers web components with
 * `ppp` prefix into a design system.
 * @public
 */
export function html(strings, ...values) {
  values.forEach((v) => {
    if (/^ppp-/.test(v)) {
      if (v) {
        requireComponent(v);
      }
    }
  });

  return baseHtml(strings, ...values);
}
