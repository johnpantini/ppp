import { Controller } from './controller.js';
import { PPPElementDefinition } from './ppp-definitions.js';

function createPPPElement(BaseType) {
  return class extends BaseType {
    constructor() {
      super();

      Controller.forCustomElement(this);
    }

    $emit(type, detail, options) {
      return this.$pppController.emit(type, detail, options);
    }

    connectedCallback() {
      this.$pppController.onConnectedCallback();
    }

    disconnectedCallback() {
      this.$pppController.onDisconnectedCallback();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.$pppController.onAttributeChangedCallback(name, oldValue, newValue);
    }
  };
}

/**
 * A minimal base class for PPPElements that also provides
 * static helpers for working with PPPElements.
 * @public
 */
export const PPPElement = Object.assign(createPPPElement(HTMLElement), {
  /**
   * Creates a new PPPElement base class inherited from the
   * provided base type.
   * @param BaseType - The base element type to inherit from.
   */
  from(BaseType) {
    return createPPPElement(BaseType);
  },
  /**
   * Defines a platform custom element based on the provided type and definition.
   * @param type - The custom element type to define.
   * @param nameOrDef - The name of the element to define or a definition object
   * that describes the element to define.
   */
  define(type, nameOrDef) {
    return new PPPElementDefinition(type, nameOrDef).define().type;
  }
});

/**
 * Decorator: Defines a platform custom element based on `PPPElement`.
 * @param nameOrDef - The name of the element to define or a definition object
 * that describes the element to define.
 * @public
 */
export function customElement(nameOrDef) {
  return function (type) {
    new PPPElementDefinition(type, nameOrDef).define();
  };
}
