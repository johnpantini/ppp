import { html as baseHtml } from './element/templating/template.js';
import ppp from '../ppp.js';

/**
 * This helper asynchronously automatically registers web components.
 * @public
 */
export async function requireComponent(tagName, path, exportName) {
  const [_, component] = tagName.split(/ppp-/i);

  if (component) {
    const module = await import(
      path ?? `../${ppp.appType}/${ppp.theme}/${component}.js`
    );
    const name =
      exportName ?? component.replace(/-./g, (x) => x[1].toUpperCase());

    ppp.DesignSystem.getOrCreate().register(module[name]());
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
        void requireComponent(v);
      }
    }
  });

  return baseHtml(strings, ...values);
}
