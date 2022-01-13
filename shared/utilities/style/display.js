/**
 * A CSS fragment to set `display: none;` when the host is hidden using the [hidden] attribute.
 * @public
 */
export const hidden = `:host([hidden]){display:none !important;}`;

/**
 * A CSS fragment to set `visibility:hidden;` to all undefined children.
 * @public
 */
export const notDefined = '*:not(:defined){visibility:hidden;}';

/**
 * Applies a CSS display property.
 * Also adds CSS rules to not display the element when the [hidden] attribute is applied to the element.
 * @param displayValue - The CSS display property value
 * @public
 */
export function display(displayValue) {
  return `${notDefined}${hidden}:host{display:${displayValue}}`;
}
