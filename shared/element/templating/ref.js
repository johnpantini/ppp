import { AttachedBehaviorHTMLDirective } from './html-directive.js';

/**
 * The runtime behavior for template references.
 * @public
 */
export class RefBehavior {
  /**
   * Creates an instance of RefBehavior.
   * @param target - The element to reference.
   * @param propertyName - The name of the property to assign the reference to.
   */
  constructor(target, propertyName) {
    this.target = target;
    this.propertyName = propertyName;
  }

  /**
   * Bind this behavior to the source.
   * @param source - The source to bind to.
   */
  bind(source) {
    source[this.propertyName] = this.target;
  }

  /**
   * Unbinds this behavior from the source.
   */
  unbind() {}
}

/**
 * A directive that observes the updates a property with a reference to the element.
 * @param propertyName - The name of the property to assign the reference to.
 * @public
 */
export function ref(propertyName) {
  return new AttachedBehaviorHTMLDirective(
    'ppp-ref',
    RefBehavior,
    propertyName
  );
}
