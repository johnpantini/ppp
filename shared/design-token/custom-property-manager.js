/** @decorator */

import { DOM } from '../element/dom.js';
import { ElementStyles } from '../element/styles/element-styles.js';
import { PPPElement } from '../element/components/ppp-element.js';
import { observable, Observable } from '../element/observation/observable.js';

function isPPPElement(element) {
  return element instanceof PPPElement;
}

/**
 * Handles setting properties for a PPPElement using Constructable Stylesheets
 */
class ConstructableStyleSheetTarget {
  constructor(source) {
    const sheet = new CSSStyleSheet();

    this.target = sheet.cssRules[sheet.insertRule(':host{}')].style;
    source.$pppController.addStyles(ElementStyles.create([sheet]));
  }

  setProperty(name, value) {
    DOM.queueUpdate(() => this.target.setProperty(name, value));
  }

  removeProperty(name) {
    DOM.queueUpdate(() => this.target.removeProperty(name));
  }
}

/**
 * Handles setting properties for a PPPElement using an HTMLStyleElement
 */
class StyleElementStyleSheetTarget {
  @observable
  target;

  constructor(target) {
    this.store = new Map();
    this.target = null;

    const controller = target.$pppController;

    this.style = document.createElement('style');
    controller.addStyles(this.style);
    Observable.getNotifier(controller).subscribe(this, 'isConnected');
    this.handleChange(controller, 'isConnected');
  }

  targetChanged() {
    if (this.target !== null) {
      for (const [key, value] of this.store.entries()) {
        this.target.setProperty(key, value);
      }
    }
  }

  setProperty(name, value) {
    this.store.set(name, value);
    DOM.queueUpdate(() => {
      if (this.target !== null) {
        this.target.setProperty(name, value);
      }
    });
  }

  removeProperty(name) {
    this.store.delete(name);
    DOM.queueUpdate(() => {
      if (this.target !== null) {
        this.target.removeProperty(name);
      }
    });
  }

  handleChange(source, key) {
    // HTMLStyleElement.sheet is null if the element isn't connected to the DOM,
    // so this method reacts to changes in DOM connection for the element hosting
    // the HTMLStyleElement.
    //
    // All rules applied via the CSSOM also get cleared when the element disconnects,
    // so we need to add a new rule each time and populate it with the stored properties
    const { sheet } = this.style;

    if (sheet) {
      // Safari will throw if we try to use the return result of insertRule()
      // to index the rule inline, so store as a const prior to indexing.
      const index = sheet.insertRule(':host{}');

      this.target = sheet.rules[index].style;
    } else {
      this.target = null;
    }
  }
}

/**
 * Handles setting properties for a normal HTMLElement
 */
class ElementStyleSheetTarget {
  constructor(source) {
    this.target = source.style;
  }

  setProperty(name, value) {
    DOM.queueUpdate(() => this.target.setProperty(name, value));
  }

  removeProperty(name) {
    DOM.queueUpdate(() => this.target.removeProperty(name));
  }
}

// Caches PropertyTarget instances
const propertyTargetCache = new WeakMap();
// Use Constructable StyleSheets for PPP elements when supported, otherwise use
// HTMLStyleElement instances
const propertyTargetCtor = DOM.supportsAdoptedStyleSheets
  ? ConstructableStyleSheetTarget
  : StyleElementStyleSheetTarget;

/**
 * Manages creation and caching of PropertyTarget instances.
 *
 * @internal
 */
export const PropertyTargetManager = Object.freeze({
  getOrCreate(source) {
    if (propertyTargetCache.has(source)) {
      return propertyTargetCache.get(source);
    }

    const target = isPPPElement(source)
      ? new propertyTargetCtor(source)
      : new ElementStyleSheetTarget(source);

    propertyTargetCache.set(source, target);

    return target;
  }
});
