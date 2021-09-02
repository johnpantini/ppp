/** @decorator */

import { PPPElement } from '../element/components/ppp-element.js';
import { observable } from '../element/observation/observable.js';
import { DesignSystemRegistrationContext } from '../design-system/design-system.js';
import {
  ComponentPresentation,
  DefaultComponentPresentation
} from '../design-system/component-presentation.js';

/**
 * Defines a foundation element class that:
 * 1. Connects the element to its ComponentPresentation
 * 2. Allows resolving the element template from the instance or ComponentPresentation
 * 3. Allows resolving the element styles from the instance or ComponentPresentation
 *
 * @public
 */
export class FoundationElement extends PPPElement {
  constructor() {
    super(...arguments);
    this._presentation = void 0;
  }

  /**
   * Sets the template of the element instance. When undefined,
   * the element will attempt to resolve the template from
   * the associated presentation or custom element definition.
   * @public
   */
  @observable
  template;

  /**
   * Sets the default styles for the element instance. When undefined,
   * the element will attempt to resolve default styles from
   * the associated presentation or custom element definition.
   * @public
   */
  @observable
  styles;

  /**
   * A property which resolves the ComponentPresentation instance
   * for the current component.
   * @public
   */
  get $presentation() {
    if (this._presentation === void 0) {
      this._presentation = ComponentPresentation.forTag(this.tagName, this);
    }

    return this._presentation;
  }

  templateChanged() {
    if (this.template !== undefined) {
      this.$pppController.template = this.template;
    }
  }

  stylesChanged() {
    if (this.styles !== undefined) {
      this.$pppController.styles = this.styles;
    }
  }

  /**
   * The connected callback for this PPPElement.
   * @remarks
   * This method is invoked by the platform whenever this FoundationElement
   * becomes connected to the document.
   * @public
   */
  connectedCallback() {
    if (this.$presentation !== null) {
      this.$presentation.applyTo(this);
    }

    super.connectedCallback();
  }

  /**
   * Defines an element registry function with a set of element definition defaults.
   * @param elementDefinition - The definition of the element to create the registry
   * function for.
   * @public
   */
  static compose(elementDefinition) {
    return (overrideDefinition = {}) =>
      new FoundationElementRegistry(
        this === FoundationElement ? class extends FoundationElement {} : this,
        elementDefinition,
        overrideDefinition
      );
  }
}

function resolveOption(option, context, definition) {
  if (typeof option === 'function') {
    return option(context, definition);
  }

  return option;
}

/**
 * Registry capable of defining presentation properties for a DOM Container hierarchy.
 *
 * @internal
 */
export class FoundationElementRegistry {
  constructor(type, elementDefinition, overrideDefinition) {
    this.type = type;
    this.elementDefinition = elementDefinition;
    this.overrideDefinition = overrideDefinition;
    this.definition = Object.assign(
      Object.assign({}, this.elementDefinition),
      this.overrideDefinition
    );
  }

  register(container) {
    const definition = this.definition;
    const overrideDefinition = this.overrideDefinition;
    const context = container.get(DesignSystemRegistrationContext);
    const prefix = definition.prefix || context.elementPrefix;
    const name = `${prefix}-${definition.baseName}`;

    context.tryDefineElement(name, this.type, (x) => {
      const presentation = new DefaultComponentPresentation(
        resolveOption(definition.template, x, definition),
        resolveOption(definition.styles, x, definition)
      );

      x.definePresentation(presentation);

      let shadowOptions = resolveOption(
        definition.shadowOptions,
        x,
        definition
      );

      if (x.shadowRootMode) {
        // If the design system has overridden the shadow root mode, we need special handling.
        if (shadowOptions) {
          // If there are shadow options present in the definition, then
          // either the component itself has specified an option or the
          // registry function has overridden it.
          if (!overrideDefinition.shadowOptions) {
            // There were shadow options provided by the component and not overridden by
            // the registry.
            shadowOptions.mode = x.shadowRootMode;
          }
        } else if (shadowOptions !== null) {
          // If the component author did not provide shadow options,
          // and did not null them out (light dom opt-in) then they
          // were relying on the PPPElement default. So, if the
          // design system provides a mode, we need to create the options
          // to override the default.
          shadowOptions = { mode: x.shadowRootMode };
        }
      }

      x.defineElement({
        elementOptions: resolveOption(definition.elementOptions, x, definition),
        shadowOptions,
        attributes: resolveOption(definition.attributes, x, definition)
      });
    });
  }
}
