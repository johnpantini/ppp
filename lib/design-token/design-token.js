/** @decorator */

import { CSSDirective } from '../element/styles/css-directive.js';

import {
  defaultExecutionContext,
  observable,
  Observable
} from '../element/observation/observable.js';

import { PPPElement } from '../element/components/ppp-element.js';
import { composedParent } from '../utilities/composed-parent.js';
import { composedContains } from '../utilities/composed-contains.js';
import { PropertyTargetManager } from './custom-property-manager.js';

const defaultElement = document.body;

/**
 * Implementation of {@link (DesignToken:interface)}
 */
class DesignTokenImpl extends CSSDirective {
  constructor(configuration) {
    super();
    this.subscribers = new WeakMap();
    this._appliedTo = new Set();
    this.name = configuration.name;

    if (configuration.cssCustomPropertyName !== null) {
      this.cssCustomProperty = `--${configuration.cssCustomPropertyName}`;
      this.cssVar = `var(${this.cssCustomProperty})`;
    }

    this.id = DesignTokenImpl.uniqueId();
    DesignTokenImpl.tokensById.set(this.id, this);
    this.subscribe(this);
  }

  get appliedTo() {
    return [...this._appliedTo];
  }

  static from(nameOrConfig) {
    return new DesignTokenImpl({
      name: typeof nameOrConfig === 'string' ? nameOrConfig : nameOrConfig.name,
      cssCustomPropertyName:
        typeof nameOrConfig === 'string'
          ? nameOrConfig
          : nameOrConfig.cssCustomPropertyName === void 0
          ? nameOrConfig.name
          : nameOrConfig.cssCustomPropertyName
    });
  }

  static isCSSDesignToken(token) {
    return typeof token.cssCustomProperty === 'string';
  }

  static isDerivedDesignTokenValue(value) {
    return typeof value === 'function';
  }

  /**
   * Gets a token by ID. Returns undefined if the token was not found.
   * @param id - The ID of the token
   * @returns
   */
  static getTokenById(id) {
    return DesignTokenImpl.tokensById.get(id);
  }

  getOrCreateSubscriberSet(target = this) {
    return (
      this.subscribers.get(target) ||
      (this.subscribers.set(target, new Set()) && this.subscribers.get(target))
    );
  }

  createCSS() {
    return this.cssVar || '';
  }

  getValueFor(element) {
    const value = DesignTokenNode.getOrCreate(element).get(this);

    if (value !== undefined) {
      return value;
    }

    throw new Error(
      `Value could not be retrieved for token named "${this.name}". Ensure the value is set for ${element} or an ancestor of ${element}.`
    );
  }

  setValueFor(element, value) {
    this._appliedTo.add(element);

    if (value instanceof DesignTokenImpl) {
      value = this.alias(value);
    }

    DesignTokenNode.getOrCreate(element).set(this, value);

    return this;
  }

  deleteValueFor(element) {
    this._appliedTo.delete(element);

    if (DesignTokenNode.existsFor(element)) {
      DesignTokenNode.getOrCreate(element).delete(this);
    }

    return this;
  }

  withDefault(value) {
    this.setValueFor(defaultElement, value);

    return this;
  }

  subscribe(subscriber, target) {
    const subscriberSet = this.getOrCreateSubscriberSet(target);

    if (!subscriberSet.has(subscriber)) {
      subscriberSet.add(subscriber);
    }
  }

  unsubscribe(subscriber, target) {
    const list = this.subscribers.get(target || this);

    if (list && list.has(subscriber)) {
      list.delete(subscriber);
    }
  }

  /**
   * Notifies subscribers that the value for an element has changed.
   * @param element - The element to emit a notification for
   */
  notify(element) {
    const record = Object.freeze({ token: this, target: element });

    if (this.subscribers.has(this)) {
      this.subscribers.get(this).forEach((sub) => sub.handleChange(record));
    }

    if (this.subscribers.has(element)) {
      this.subscribers.get(element).forEach((sub) => sub.handleChange(record));
    }
  }

  /**
   * Proxy changes to Observable
   * @param record - The change record
   */
  handleChange(record) {
    const node = DesignTokenNode.getOrCreate(record.target);

    Observable.getNotifier(node).notify(record.token.id);
  }

  /**
   * Alias the token to the provided token.
   * @param token - the token to alias to
   */
  alias(token) {
    return (target) => token.getValueFor(target);
  }
}

DesignTokenImpl.uniqueId = (() => {
  let id = 0;

  return () => {
    id++;

    return id.toString(16);
  };
})();
/**
 * Token storage by token ID
 */
DesignTokenImpl.tokensById = new Map();

class CustomPropertyReflector {
  startReflection(token, target) {
    token.subscribe(this, target);
    this.handleChange({ token, target });
  }

  stopReflection(token, target) {
    token.unsubscribe(this, target);
    this.remove(token, target);
  }

  handleChange(record) {
    const { token, target } = record;

    this.add(token, target);
  }

  add(token, target) {
    PropertyTargetManager.getOrCreate(target).setProperty(
      token.cssCustomProperty,
      this.resolveCSSValue(DesignTokenNode.getOrCreate(target).get(token))
    );
  }

  remove(token, target) {
    PropertyTargetManager.getOrCreate(target).removeProperty(
      token.cssCustomProperty
    );
  }

  resolveCSSValue(value) {
    return value && typeof value.createCSS === 'function'
      ? value.createCSS()
      : value;
  }
}

/**
 * A light wrapper around BindingObserver to handle value caching and
 * token notification
 */
class DesignTokenBindingObserver {
  @observable
  _value;

  constructor(source, token, node) {
    this.source = source;
    this.token = token;
    this.node = node;
    this.dependencies = new Set();
    this.observer = Observable.binding(source, this);
    // This is a little bit hacky because it's using internal APIs of BindingObserverImpl.
    // BindingObserverImpl queues updates to batch it's notifications which doesn't work for this
    // scenario because the DesignToken.getValueFor API is not async. Without this, using DesignToken.getValueFor()
    // after DesignToken.setValueFor() when setting a dependency of the value being retrieved can return a stale
    // value. Assigning .handleChange to .call forces immediate invocation of this classes handleChange() method,
    // allowing resolution of values synchronously.
    // TODO: https://github.com/microsoft/fast/issues/5110
    this.observer.handleChange = this.observer.call;
    this.handleChange();

    for (const record of this.observer.records()) {
      const { propertySource } = record;

      if (propertySource instanceof DesignTokenNode) {
        const token = DesignTokenImpl.getTokenById(record.propertyName);

        // Tokens should not enumerate themselves as a dependency because
        // any setting of the token will override the value for that scope.
        if (token !== undefined && token !== this.token) {
          this.dependencies.add(token);
        }
      }
    }
  }

  disconnect() {
    this.observer.disconnect();
  }

  _valueChanged(prev, next) {
    // Only notify on changes, not initialization
    if (prev !== undefined) {
      this.token.notify(this.node.target);
    }
  }

  /**
   * The value of the binding
   */
  get value() {
    return this._value;
  }

  /**
   * @internal
   */
  handleChange() {
    this._value = this.observer.observe(
      this.node.target,
      defaultExecutionContext
    );
  }
}

const nodeCache = new WeakMap();
const childToParent = new WeakMap();

/**
 * A node responsible for setting and getting token values,
 * emitting values to CSS custom properties, and maintaining
 * inheritance structures.
 */
class DesignTokenNode {
  @observable
  children;

  constructor(target) {
    this.target = target;
    /**
     * All children assigned to the node
     */
    this.children = [];
    /**
     * All values explicitly assigned to the node in their raw form
     */
    this.rawValues = new Map();
    /**
     * Tokens currently being reflected to CSS custom properties
     */
    this.reflecting = new Set();
    /**
     * Binding observers for assigned and inherited derived values.
     */
    this.bindingObservers = new Map();
    /**
     * Tracks subscribers for tokens assigned a derived value for the node.
     */
    this.tokenSubscribers = new Map();
    nodeCache.set(target, this);

    if (target instanceof PPPElement) {
      target.$pppController.addBehaviors([this]);
    } else if (target.isConnected) {
      this.bind();
    }
  }

  /**
   * Returns a DesignTokenNode for an element.
   * Creates a new instance if one does not already exist for a node,
   * otherwise returns the cached instance
   *
   * @param target - The HTML element to retrieve a DesignTokenNode for
   */
  static getOrCreate(target) {
    return nodeCache.get(target) || new DesignTokenNode(target);
  }

  /**
   * Determines if a DesignTokenNode has been created for a target
   * @param target - The element to test
   */
  static existsFor(target) {
    return nodeCache.has(target);
  }

  /**
   * Searches for and return the nearest parent DesignTokenNode.
   * Null is returned if no node is found or the node provided is for a default element.
   */
  static findParent(node) {
    if (!(defaultElement === node.target)) {
      let parent = composedParent(node.target);

      while (parent !== null) {
        if (nodeCache.has(parent)) {
          return nodeCache.get(parent);
        }

        parent = composedParent(parent);
      }

      return DesignTokenNode.getOrCreate(defaultElement);
    }

    return null;
  }

  /**
   * Finds the closest node with a value explicitly assigned for a token, otherwise null.
   * @param token - The token to look for
   * @param start - The node to start looking for value assignment
   * @returns
   */
  static findClosestAssignedNode(token, start) {
    let current = start;

    do {
      if (current.has(token)) {
        return current;
      }

      current = current.parent
        ? current.parent
        : current.target !== defaultElement
        ? DesignTokenNode.getOrCreate(defaultElement)
        : null;
    } while (current !== null);

    return null;
  }

  get parent() {
    return childToParent.get(this) || null;
  }

  /**
   * Checks if a token has been assigned an explicit value the node.
   * @param token - the token to check.
   */
  has(token) {
    return this.rawValues.has(token);
  }

  /**
   * Gets the value of a token for a node
   * @param token - The token to retrieve the value for
   * @returns
   */
  get(token) {
    const raw = this.getRaw(token);

    Observable.track(this, token.id);

    if (raw !== undefined) {
      if (DesignTokenImpl.isDerivedDesignTokenValue(raw)) {
        return (
          this.bindingObservers.get(token) ||
          this.setupBindingObserver(token, raw)
        ).value;
      } else {
        return raw;
      }
    }

    return undefined;
  }

  /**
   * Retrieves the raw assigned value of a token from the nearest assigned node.
   * @param token - The token to retrieve a raw value for
   * @returns
   */
  getRaw(token) {
    if (this.rawValues.has(token)) {
      return this.rawValues.get(token);
    }

    return DesignTokenNode.findClosestAssignedNode(token, this)?.getRaw(token);
  }

  /**
   * Sets a token to a value for a node
   * @param token - The token to set
   * @param value - The value to set the token to
   */
  set(token, value) {
    // Disconnect any existing binding observer
    // And delete it
    if (DesignTokenImpl.isDerivedDesignTokenValue(this.rawValues.get(token))) {
      this.tearDownBindingObserver(token);
      this.children.forEach((x) => x.purgeInheritedBindings(token));
    }

    this.rawValues.set(token, value);

    if (this.tokenSubscribers.has(token)) {
      token.unsubscribe(this.tokenSubscribers.get(token));
      this.tokenSubscribers.delete(token);
    }

    if (DesignTokenImpl.isDerivedDesignTokenValue(value)) {
      const binding = this.setupBindingObserver(token, value);
      const { dependencies } = binding;
      const reflect = DesignTokenImpl.isCSSDesignToken(token);

      if (dependencies.size > 0) {
        const subscriber = {
          handleChange: (record) => {
            const node = DesignTokenNode.getOrCreate(record.target);

            if (this !== node && this.contains(node)) {
              token.notify(record.target);
              DesignTokenNode.getOrCreate(record.target).reflectToCSS(token);
            }
          }
        };

        this.tokenSubscribers.set(token, subscriber);
        dependencies.forEach((x) => {
          // Check all existing nodes for which a dependency has been applied
          // and determine if we need to update the token being set for that node
          if (reflect) {
            x.appliedTo.forEach((y) => {
              const node = DesignTokenNode.getOrCreate(y);

              if (this.contains(node) && node.getRaw(token) === value) {
                token.notify(node.target);
                node.reflectToCSS(token);
              }
            });
          }

          x.subscribe(subscriber);
        });
      }
    }

    if (DesignTokenImpl.isCSSDesignToken(token)) {
      this.reflectToCSS(token);
    }

    token.notify(this.target);
  }

  /**
   * Deletes a token value for the node.
   * @param token - The token to delete the value for
   */
  delete(token) {
    this.rawValues.delete(token);
    this.tearDownBindingObserver(token);
    this.children.forEach((x) => x.purgeInheritedBindings(token));
    token.notify(this.target);
  }

  /**
   * Invoked when the DesignTokenNode.target is attached to the document
   */
  bind() {
    const parent = DesignTokenNode.findParent(this);

    if (parent) {
      parent.appendChild(this);
    }

    for (const key of this.rawValues.keys()) {
      key.notify(this.target);
    }
  }

  /**
   * Invoked when the DesignTokenNode.target is detached from the document
   */
  unbind() {
    if (this.parent) {
      const parent = childToParent.get(this);

      parent.removeChild(this);
    }
  }

  /**
   * Appends a child to a parent DesignTokenNode.
   * @param child - The child to append to the node
   */
  appendChild(child) {
    if (child.parent) {
      childToParent.get(child).removeChild(child);
    }

    const reParent = this.children.filter((x) => child.contains(x));

    childToParent.set(child, this);
    this.children.push(child);
    reParent.forEach((x) => child.appendChild(x));
    Observable.getNotifier(this).subscribe(child);
  }

  /**
   * Removes a child from a node.
   * @param child - The child to remove.
   */
  removeChild(child) {
    const childIndex = this.children.indexOf(child);

    if (childIndex !== -1) {
      this.children.splice(childIndex, 1);
    }

    Observable.getNotifier(this).unsubscribe(child);

    return child.parent === this ? childToParent.delete(child) : false;
  }

  /**
   * Tests whether a provided node is contained by
   * the calling node.
   * @param test - The node to test
   */
  contains(test) {
    return composedContains(this.target, test.target);
  }

  /**
   * Instructs the node to reflect a design token for the provided token.
   * @param token - The design token to reflect
   */
  reflectToCSS(token) {
    if (!this.reflecting.has(token)) {
      this.reflecting.add(token);
      DesignTokenNode.cssCustomPropertyReflector.startReflection(
        token,
        this.target
      );
    }
  }

  /**
   * Handle changes to upstream tokens
   * @param source - The parent DesignTokenNode
   * @param property - The token ID that changed
   */
  handleChange(source, property) {
    const token = DesignTokenImpl.getTokenById(property);

    // Propagate change notifications down to children
    // Don't propagate changes for tokens with bindingObservers
    // because the bindings are responsible for notifying themselves
    if (token && !this.has(token) && !this.bindingObservers.has(token)) {
      token.notify(this.target);
    }
  }

  /**
   * Recursively purge binding observers for a token for descendent of the node.
   * Bindings will only be purged for trees of nodes where no explicit value for the node
   * is assigned.
   * @param token - the token to purge bindings on
   */
  purgeInheritedBindings(token) {
    if (!this.has(token)) {
      this.tearDownBindingObserver(token);

      if (this.children.length) {
        this.children.forEach((child) => child.purgeInheritedBindings(token));
      }
    }
  }

  /**
   * Sets up a binding observer for a derived token value that notifies token
   * subscribers on change.
   *
   * @param token - The token to notify when the binding updates
   * @param source - The binding source
   */
  setupBindingObserver(token, source) {
    const binding = new DesignTokenBindingObserver(source, token, this);

    this.bindingObservers.set(token, binding);

    return binding;
  }

  /**
   * Tear down a binding observer for a token.
   */
  tearDownBindingObserver(token) {
    if (this.bindingObservers.has(token)) {
      this.bindingObservers.get(token).disconnect();
      this.bindingObservers.delete(token);

      return true;
    }

    return false;
  }
}

/**
 * Responsible for reflecting tokens to CSS custom properties
 */
DesignTokenNode.cssCustomPropertyReflector = new CustomPropertyReflector();

function create(nameOrConfig) {
  return DesignTokenImpl.from(nameOrConfig);
}

/**
 * Factory object for creating {@link (DesignToken:interface)} instances.
 * @public
 */
export const DesignToken = Object.freeze({
  create,
  /**
   * Informs DesignToken that an HTMLElement for which tokens have
   * been set has been connected to the document.
   *
   * The browser does not provide a reliable mechanism to observe an HTMLElement's connectedness
   * in all scenarios, so invoking this method manually is necessary when:
   *
   * 1. Token values are set for an HTMLElement.
   * 2. The HTMLElement does not inherit from PPPElement.
   * 3. The HTMLElement is not connected to the document when token values are set.
   *
   * @param element - The element to notify
   * @returns - true if notification was successful, otherwise false.
   */
  notifyConnection(element) {
    if (!element.isConnected || !DesignTokenNode.existsFor(element)) {
      return false;
    }

    DesignTokenNode.getOrCreate(element).bind();

    return true;
  },
  /**
   * Informs DesignToken that an HTMLElement for which tokens have
   * been set has been disconnected to the document.
   *
   * The browser does not provide a reliable mechanism to observe an HTMLElement's connectedness
   * in all scenarios, so invoking this method manually is necessary when:
   *
   * 1. Token values are set for an HTMLElement.
   * 2. The HTMLElement does not inherit from PPPElement.
   *
   * @param element - The element to notify
   * @returns - true if notification was successful, otherwise false.
   */
  notifyDisconnection(element) {
    if (element.isConnected || !DesignTokenNode.existsFor(element)) {
      return false;
    }

    DesignTokenNode.getOrCreate(element).unbind();

    return true;
  }
});
