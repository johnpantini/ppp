import { PPPElementDefinition } from '../element/components/ppp-definitions.js';
import { DI, Registration } from '../di/di.js';
import { ComponentPresentation } from './component-presentation.js';

/**
 * Design system contextual APIs and configuration usable within component
 * registries.
 * @public
 */
export const DesignSystemRegistrationContext = DI.createInterface();
/**
 * Indicates what to do with an ambiguous (duplicate) element.
 * @public
 */
export const ElementDisambiguation = Object.freeze({
  /**
   * Skip defining the element but still call the provided callback passed
   * to DesignSystemRegistrationContext.tryDefineElement
   */
  definitionCallbackOnly: null,
  /**
   * Ignore the duplicate element entirely.
   */
  ignoreDuplicate: Symbol()
});

const elementTypesByTag = new Map();
const elementTagsByType = new Map();
const designSystemKey = DI.createInterface((x) =>
  x.cachedCallback((handler) => {
    const element = document.body;
    const owned = element.$$designSystem$$;

    if (owned) {
      return owned;
    }

    return new DefaultDesignSystem(element, handler);
  })
);

/**
 * An API gateway to design system features.
 * @public
 */
export const DesignSystem = Object.freeze({
  /**
   * Returns the HTML element name that the type is defined as.
   * @param type - The type to lookup.
   * @public
   */
  tagFor(type) {
    return elementTagsByType.get(type);
  },
  /**
   * Searches the DOM hierarchy for the design system that is responsible
   * for the provided element.
   * @param element - The element to locate the design system for.
   * @returns The located design system.
   * @public
   */
  responsibleFor(element) {
    const owned = element.$$designSystem$$;

    if (owned) {
      return owned;
    }

    const container = DI.findResponsibleContainer(element);

    return container.get(designSystemKey);
  },
  /**
   * Gets the DesignSystem if one is explicitly defined on the provided element;
   * otherwise creates a design system defined directly on the element.
   * @param element - The element to get or create a design system for.
   * @returns The design system.
   * @public
   */
  getOrCreate(element = document.body) {
    const owned = element.$$designSystem$$;

    if (owned) {
      return owned;
    }

    const container = DI.getOrCreateDOMContainer(element);

    if (!container.has(designSystemKey, false)) {
      container.register(
        Registration.instance(
          designSystemKey,
          new DefaultDesignSystem(element, container)
        )
      );
    }

    return container.get(designSystemKey);
  }
});

class DefaultDesignSystem {
  constructor(host, container) {
    this.host = host;
    this.container = container;
    this.prefix = 'ppp';
    this.shadowRootMode = undefined;
    this.disambiguate = () => ElementDisambiguation.definitionCallbackOnly;
    host.$$designSystem$$ = this;
    container.register(
      Registration.callback(DesignSystemRegistrationContext, () => this.context)
    );
  }

  withPrefix(prefix) {
    this.prefix = prefix;

    return this;
  }

  withShadowRootMode(mode) {
    this.shadowRootMode = mode;

    return this;
  }

  withElementDisambiguation(callback) {
    this.disambiguate = callback;

    return this;
  }

  register(...registrations) {
    const container = this.container;
    const elementDefinitionEntries = [];
    const disambiguate = this.disambiguate;
    const shadowRootMode = this.shadowRootMode;

    this.context = {
      elementPrefix: this.prefix,
      tryDefineElement(name, type, callback) {
        let elementName = name;
        let typeFoundByName = elementTypesByTag.get(elementName);
        let needsDefine = true;

        while (typeFoundByName) {
          const result = disambiguate(elementName, type, typeFoundByName);

          switch (result) {
            case ElementDisambiguation.ignoreDuplicate:
              return;
            case ElementDisambiguation.definitionCallbackOnly:
              needsDefine = false;
              typeFoundByName = void 0;

              break;
            default:
              elementName = result;
              typeFoundByName = elementTypesByTag.get(elementName);

              break;
          }
        }

        if (needsDefine) {
          if (elementTagsByType.has(type)) {
            type = class extends type {};
          }

          elementTypesByTag.set(elementName, type);
          elementTagsByType.set(type, elementName);
        }

        elementDefinitionEntries.push(
          new ElementDefinitionEntry(
            container,
            elementName,
            type,
            shadowRootMode,
            callback,
            needsDefine
          )
        );
      }
    };
    container.register(...registrations);

    for (const entry of elementDefinitionEntries) {
      entry.callback(entry);

      if (entry.willDefine && entry.definition !== null) {
        entry.definition.define();
      }
    }

    return this;
  }
}

class ElementDefinitionEntry {
  constructor(container, name, type, shadowRootMode, callback, willDefine) {
    this.container = container;
    this.name = name;
    this.type = type;
    this.shadowRootMode = shadowRootMode;
    this.callback = callback;
    this.willDefine = willDefine;
    this.definition = null;
  }

  definePresentation(presentation) {
    ComponentPresentation.define(this.name, presentation, this.container);
  }

  defineElement(definition) {
    this.definition = new PPPElementDefinition(
      this.type,
      Object.assign(Object.assign({}, definition), { name: this.name })
    );
  }

  tagFor(type) {
    return DesignSystem.tagFor(type);
  }
}
