import { css } from '../element/styles/css.js';
import { DOM } from '../element/dom.js';
import { PPPElement } from '../element/components/ppp-element.js';

/**
 * Caching mechanism for CSS custom properties
 */
class CustomPropertyManagerImpl {
  /**
   * {@inheritdoc CustomPropertyManager.get}
   */
  getElementStyles(key, value) {
    let keyCache = CustomPropertyManagerImpl.cache.get(key.cssCustomProperty);

    if (!keyCache) {
      keyCache = new Map();
      CustomPropertyManagerImpl.cache.set(key.cssCustomProperty, keyCache);
    }

    let v = keyCache.get(value);

    if (!v) {
      v = this.createElementStyles(key, value);
      keyCache.set(value, v);
    }

    return v;
  }

  getOrCreateAppliedCache(element) {
    if (CustomPropertyManagerImpl.appliedCache.has(element)) {
      return CustomPropertyManagerImpl.appliedCache.get(element);
    }

    return (
      CustomPropertyManagerImpl.appliedCache.set(element, new Map()) &&
      CustomPropertyManagerImpl.appliedCache.get(element)
    );
  }

  /**
   * Creates an ElementStyles with the key/value CSS custom property
   * on the host
   */
  createElementStyles(token, value) {
    return css`
      :host {
        ${token.cssCustomProperty}: ${value};
      }
    `;
  }

  addTo(element, token, value) {
    if (isPPPElement(element)) {
      const styles = this.getElementStyles(token, value);

      element.$pppController.addStyles(styles);
      this.getOrCreateAppliedCache(element).set(
        token.cssCustomProperty,
        styles
      );
    } else {
      DOM.queueUpdate(() =>
        element.style.setProperty(token.cssCustomProperty, value)
      );
    }
  }

  removeFrom(element, token) {
    if (isPPPElement(element)) {
      const cache = this.getOrCreateAppliedCache(element);
      const styles = cache.get(token.cssCustomProperty);

      if (styles) {
        element.$pppController.removeStyles(styles);
        cache.delete(token.cssCustomProperty);
      }
    } else {
      DOM.queueUpdate(() =>
        element.style.removeProperty(token.cssCustomProperty)
      );
    }
  }
}

CustomPropertyManagerImpl.cache = new Map();
CustomPropertyManagerImpl.appliedCache = new WeakMap();

function isPPPElement(element) {
  return element instanceof PPPElement;
}

/**
 * @internal
 */
export const CustomPropertyManager = new CustomPropertyManagerImpl();
