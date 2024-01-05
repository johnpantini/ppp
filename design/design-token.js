import { observable, Observable } from '../lib/fast/observable.js';
import { Updates } from '../lib/fast/update-queue.js';
import {
  ElementStyles,
  htmlDirective,
  cssDirective,
  FASTElement,
  SubscriberSet
} from '../vendor/fast-element.min.js';

import { composedParent, composedContains } from '../vendor/fast-utilities.js';

const __decorate = function (decorators, target, key, desc) {
  let c = arguments.length,
    r =
      c < 3
        ? target
        : desc === null
        ? (desc = Object.getOwnPropertyDescriptor(target, key))
        : desc,
    d;

  for (let i = decorators.length - 1; i >= 0; i--)
    if ((d = decorators[i]))
      r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;

  // noinspection CommaExpressionJS
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * A constructable style target that can be registered
 * for DesignToken default style emission.
 *
 * Useful for controlling where CSS is emitted to, or when needing
 * to collect styles for SSR processes.
 *
 * @public
 */
class DesignTokenStyleTarget {
  constructor() {
    this.properties = new Map();
  }

  setProperty(name, value) {
    this.properties.set(name, value);
  }

  removeProperty(name) {
    this.properties.delete(name);
  }

  /**
   * The CSS text for the style target.
   * The text does *not* contain [CSS selector text](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors).
   */

  get cssText() {
    let css = '';

    for (const [key, value] of this.properties) {
      css += `${key}: ${value};`;
    }

    return css;
  }

  /**
   * The values set for the target as an array of key/value pairs.
   */

  get values() {
    return Array.from(this.properties);
  }
}

const parentLocatorEventName = '$$designToken__locate__parent$$';
const containsEventName = '$$designToken__contains$$';

function parentLocatorHandler(event) {
  if (event.target !== this) {
    event.detail.parent = this;
    event.stopImmediatePropagation();
  }
}

function containsHandler(event) {
  if (event.detail !== this) {
    event.detail.contains = true;
    event.stopImmediatePropagation();
  }
}

/**
 * A DesignToken resolution strategy that uses custom events to resolve
 * node hierarchies.
 *
 * @public
 */

const DesignTokenEventResolutionStrategy = {
  addedCallback(controller) {
    controller.source.addEventListener(
      parentLocatorEventName,
      parentLocatorHandler
    );
  },

  removedCallback(controller) {
    controller.source.removeEventListener(
      parentLocatorEventName,
      parentLocatorHandler
    );
  },

  contains(parent, child) {
    parent.addEventListener(containsEventName, containsHandler);

    const event = new CustomEvent(containsEventName, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        contains: false
      }
    });

    child.dispatchEvent(event);
    parent.removeEventListener(containsEventName, containsHandler);

    return event.detail.contains;
  },

  parent(element) {
    const event = new CustomEvent(parentLocatorEventName, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        parent: null
      }
    });

    element.dispatchEvent(event);

    return event.detail.parent;
  }
};

class DerivedValueEvaluator {
  constructor(value) {
    this.value = value;
    this.notifier = Observable.getNotifier(this);
    this.dependencies = new Set();
    this.binding = Observable.binding(value, this);
    this.binding.setMode(false);
  }

  static getOrCreate(value) {
    let v = DerivedValueEvaluator.cache.get(value);

    if (v) {
      return v;
    }

    v = new DerivedValueEvaluator(value);
    DerivedValueEvaluator.cache.set(value, v);

    return v;
  }

  evaluate(node, tokenContext) {
    const resolve = (token) => {
      this.dependencies.add(token);

      if (tokenContext === token) {
        if (node.parent) {
          return node.parent.getTokenValue(token);
        }

        throw new Error(
          'DesignTokenNode has encountered a circular token reference. Avoid this by setting the token value for an ancestor node.'
        );
      } else {
        return node.getTokenValue(token);
      }
    };

    return this.binding.observe(resolve);
  }

  handleChange() {
    this.notifier.notify(undefined);
  }
}

DerivedValueEvaluator.cache = new WeakMap();

class DerivedValue {
  constructor(token, evaluator, node, subscriber) {
    this.token = token;
    this.evaluator = evaluator;
    this.node = node;
    this.subscriber = subscriber;
    this.value = evaluator.evaluate(node, token);

    if (this.subscriber) {
      Observable.getNotifier(this.evaluator).subscribe(this.subscriber);
    }
  }

  dispose() {
    if (this.subscriber) {
      Observable.getNotifier(this.evaluator).unsubscribe(this.subscriber);
    }
  }

  update() {
    this.value = this.evaluator.evaluate(this.node, this.token);

    return this;
  }
}

/**
 * @internal
 */

class DesignTokenChangeRecordImpl {
  constructor(target, type, token, value) {
    this.target = target;
    this.type = type;
    this.token = token;
    this.value = value;
  }

  notify() {
    Observable.getNotifier(this.token).notify(this);
  }
}

/**
 * @public
 */

class DesignTokenNode {
  constructor() {
    this._parent = null;
    this._children = new Set();
    this._values = new Map();
    this._derived = new Map();
    this.dependencyGraph = new Map();
  }

  /**
   * Determines if a value is a {@link DerivedDesignTokenValue}
   * @param value - The value to test
   */

  static isDerivedTokenValue(value) {
    return typeof value === 'function';
  }

  /**
   * Determines if a token has a derived value for a node.
   */

  static isDerivedFor(node, token) {
    return node._derived.has(token);
  }

  /**
   * Collects token/value pairs for all derived token / values set on upstream nodes.
   */

  static collectDerivedContext(node) {
    const collected = new Map(); // Exit early if  there is no parent

    if (node.parent === null) {
      return collected;
    }

    let ignored = DesignTokenNode.getAssignedTokensForNode(node);
    let current = node.parent;

    do {
      const assigned = DesignTokenNode.getAssignedTokensForNode(current);

      for (let i = 0, l = assigned.length; i < l; i++) {
        const token = assigned[i];

        if (
          !ignored.includes(token) &&
          DesignTokenNode.isDerivedFor(current, token)
        ) {
          collected.set(token, current._derived.get(token));
        }
      }

      ignored = Array.from(new Set(ignored.concat(assigned)));
      current = current.parent;
    } while (current !== null);

    return collected;
  }

  /**
   * Resolves the local value for a token if it is assigned, otherwise returns undefined.
   */

  static getLocalTokenValue(node, token) {
    return !DesignTokenNode.isAssigned(node, token)
      ? undefined
      : DesignTokenNode.isDerivedFor(node, token)
      ? node._derived.get(token).value
      : node._values.get(token);
  }

  static getOrCreateDependencyGraph(node, token) {
    let dependents = node.dependencyGraph.get(token);

    if (dependents) {
      return dependents;
    }

    dependents = new Set();
    node.dependencyGraph.set(token, dependents);

    return dependents;
  }

  /**
   * Emit all queued notifications
   */

  static notify() {
    const notifications = this._notifications;

    this._notifications = [];

    for (const record of notifications) {
      record.notify();
    }
  }

  static queueNotification(...records) {
    this._notifications.push(...records);
  }

  /**
   * Retrieves all tokens assigned directly to a node.
   * @param node - the node to retrieve assigned tokens for
   * @returns
   */

  static getAssignedTokensForNode(node) {
    return Array.from(node._values.keys());
  }

  /**
   * Retrieves all tokens assigned to the node and ancestor nodes.
   * @param node - the node to compose assigned tokens for
   */

  static composeAssignedTokensForNode(node) {
    const tokens = new Set(DesignTokenNode.getAssignedTokensForNode(node));
    let current = node.parent;

    while (current !== null) {
      const assignedTokens = DesignTokenNode.getAssignedTokensForNode(current);

      for (const token of assignedTokens) {
        tokens.add(token);
      }

      current = current.parent;
    }

    return Array.from(tokens);
  }

  /**
   * Tests if a token is assigned directly to a node
   * @param node - The node to test
   * @param token  - The token to test
   * @returns
   */

  static isAssigned(node, token) {
    return node._values.has(token);
  }

  /**
   * The parent node
   */

  get parent() {
    return this._parent;
  }

  get children() {
    return Array.from(this._children);
  }

  /**
   * Appends a child to the node, notifying for any tokens set for the node's context.
   */

  appendChild(child) {
    var _a, _b;

    let prevContext = null; // If this node is already attached, get it's context so change record
    // types can be determined

    if (child.parent !== null) {
      prevContext = DesignTokenNode.composeAssignedTokensForNode(child.parent);

      child.parent._children.delete(child);
    }

    const context = DesignTokenNode.composeAssignedTokensForNode(this);
    const derivedContext = DesignTokenNode.collectDerivedContext(this);

    child._parent = this;

    this._children.add(child);

    for (const token of context) {
      let type = 0;
      /* DesignTokenMutationType.add */

      if (prevContext !== null) {
        const prevContextIndex = prevContext.indexOf(token);

        if (prevContextIndex !== -1) {
          type = 1;
          /* DesignTokenMutationType.change */

          prevContext.splice(prevContextIndex, 1);
        }
      }

      child.dispatch(
        new DesignTokenChangeRecordImpl(
          this,
          type,
          token,
          (_a = derivedContext.get(token)) === null || _a === void 0
            ? void 0
            : _a.evaluator.value
        )
      );
    }

    if (prevContext !== null && prevContext.length > 0) {
      for (const token of prevContext) {
        child.dispatch(
          new DesignTokenChangeRecordImpl(
            this,
            2,
            /* DesignTokenMutationType.delete */
            token,
            (_b = derivedContext.get(token)) === null || _b === void 0
              ? void 0
              : _b.evaluator.value
          )
        );
      }
    }

    DesignTokenNode.notify();
  }

  /**
   * Appends a child to the node, notifying for any tokens set for the node's context.
   */

  removeChild(child) {
    if (child.parent === this) {
      const context = DesignTokenNode.composeAssignedTokensForNode(this);

      child._parent = null;

      this._children.delete(child);

      for (const token of context) {
        child.dispatch(
          new DesignTokenChangeRecordImpl(
            this,
            2,
            /* DesignTokenMutationType.delete */
            token
          )
        );
      }

      DesignTokenNode.notify();
    }
  }

  /**
   * Dispose of the node, removing parent/child relationships and
   * unsubscribing all observable binding subscribers. Does not emit
   * notifications.
   */

  dispose() {
    if (this.parent) {
      this.parent._children.delete(this);

      this._parent = null;
    }

    for (const [, derived] of this._derived) {
      derived.dispose();
    }
  }

  /**
   * Sets a token to a value
   */

  setTokenValue(token, value) {
    const changeType =
      DesignTokenNode.isAssigned(this, token) ||
      DesignTokenNode.isDerivedFor(this, token)
        ? 1
        : /* DesignTokenMutationType.change */
          0;
    /* DesignTokenMutationType.add */

    const prev = DesignTokenNode.getLocalTokenValue(this, token);

    this._values.set(token, value);

    if (DesignTokenNode.isDerivedFor(this, token)) {
      this.tearDownDerivedTokenValue(token);
    }

    const isDerived = DesignTokenNode.isDerivedTokenValue(value);
    const derivedContext = DesignTokenNode.collectDerivedContext(this);
    let result;

    if (isDerived) {
      const evaluator = this.setupDerivedTokenValue(token, value, true);

      result = evaluator.value;
    } else {
      result = value;
    }

    if (prev !== result) {
      DesignTokenNode.queueNotification(
        new DesignTokenChangeRecordImpl(this, changeType, token, value)
      );
    }

    this.dispatch(
      new DesignTokenChangeRecordImpl(this, changeType, token, value)
    );
    derivedContext.forEach((derivedValue, token) => {
      // Skip over any derived values already established locally, because
      // those will get updated via this.notifyDerived and this.notifyStatic
      if (!DesignTokenNode.isDerivedFor(this, token)) {
        const prev = DesignTokenNode.getLocalTokenValue(this, token);

        derivedValue = this.setupDerivedTokenValue(
          token,
          derivedValue.evaluator.value
        );

        const result = derivedValue.value;

        if (prev !== result) {
          DesignTokenNode.queueNotification(
            new DesignTokenChangeRecordImpl(
              this,
              1,
              /* DesignTokenMutationType.change */
              token,
              derivedValue.evaluator.value
            )
          );
        }

        this.dispatch(
          new DesignTokenChangeRecordImpl(
            this,
            0,
            /* DesignTokenMutationType.add */
            token,
            derivedValue.evaluator.value
          )
        );
      }
    });
    DesignTokenNode.notify();
  }

  /**
   * Returns the resolve value for a token
   */

  getTokenValue(token) {
    /* eslint-disable-next-line */
    let node = this;
    let value;

    while (node !== null) {
      if (DesignTokenNode.isDerivedFor(node, token)) {
        value = node._derived.get(token).value;

        break;
      }

      if (DesignTokenNode.isAssigned(node, token)) {
        value = node._values.get(token);

        break;
      }

      node = node._parent;
    }

    if (value !== undefined) {
      return value;
    } else {
      throw new Error(`No value set for token ${token} in node tree.`);
    }
  }

  /**
   * Deletes the token value for a node
   */

  deleteTokenValue(token) {
    if (DesignTokenNode.isAssigned(this, token)) {
      const prev = DesignTokenNode.getLocalTokenValue(this, token);

      this._values.delete(token);

      this.tearDownDerivedTokenValue(token);

      let newValue;

      try {
        newValue = this.getTokenValue(token);
      } catch (e) {
        newValue = undefined;
      }

      DesignTokenNode.queueNotification(
        new DesignTokenChangeRecordImpl(
          this,
          2,
          /* DesignTokenMutationType.delete */
          token
        )
      );

      if (prev !== newValue) {
        this.dispatch(
          new DesignTokenChangeRecordImpl(
            this,
            2,
            /* DesignTokenMutationType.delete */
            token
          )
        );
      }

      DesignTokenNode.notify();
    }
  }

  /**
   * Notifies that a token has been mutated
   */

  dispatch(record) {
    var _a, _b, _c;

    if (this !== record.target) {
      const { token } = record; // If the node is assigned the token being dispatched and the assigned value does not depend on the token
      // (circular token reference) then terminate the dispatch.

      const isAssigned = DesignTokenNode.isAssigned(this, token);
      const containsCircularForToken =
        isAssigned &&
        ((_a = this._derived.get(token)) === null || _a === void 0
          ? void 0
          : _a.evaluator.dependencies.has(token));

      if (isAssigned && !containsCircularForToken) {
        return;
      } // Delete token evaluations if the token is not assigned explicitly but is derived for the node and
      // the record is a delete type.

      if (
        record.type === 2 &&
        /* DesignTokenMutationType.delete */
        !isAssigned &&
        DesignTokenNode.isDerivedFor(this, token)
      ) {
        this.tearDownDerivedTokenValue(token);
        DesignTokenNode.queueNotification(
          new DesignTokenChangeRecordImpl(
            this,
            2,
            /* DesignTokenMutationType.delete */
            token
          )
        );
      }

      if (containsCircularForToken) {
        record = new DesignTokenChangeRecordImpl(
          this,
          1,
          /* DesignTokenMutationType.change */
          token,
          (_b = this._derived.get(token)) === null || _b === void 0
            ? void 0
            : _b.evaluator.value
        );
      }

      const { value } = record;

      if (value && DesignTokenNode.isDerivedTokenValue(value)) {
        const dependencies =
          DerivedValueEvaluator.getOrCreate(value).dependencies; // If this is not the originator, check to see if this node
        // has any dependencies of the token value. If so, we need to evaluate for this node

        let evaluate = false;

        for (const dependency of dependencies) {
          if (DesignTokenNode.isAssigned(this, dependency)) {
            evaluate = true;

            break;
          }
        }

        if (evaluate) {
          const prev =
            (_c = this._derived.get(token)) === null || _c === void 0
              ? void 0
              : _c.value;
          const derivedValue = this.setupDerivedTokenValue(token, value);

          if (prev !== derivedValue.value) {
            const type =
              prev === undefined ? 0 : /* DesignTokenMutationType.add */ 1;
            /* DesignTokenMutationType.change */

            const notification = new DesignTokenChangeRecordImpl(
              this,
              type,
              token,
              derivedValue.evaluator.value
            );

            DesignTokenNode.queueNotification(notification);
            record = notification;
          }
        }
      }
    }

    this.collectLocalChangeRecords(record).forEach((_record) => {
      DesignTokenNode.queueNotification(_record);
      this.dispatch(_record);
    });
    this.notifyChildren(record);
  }

  /**
   * Generate change-records for local dependencies of a change record
   */

  collectLocalChangeRecords(record) {
    const collected = new Map();

    for (const dependent of DesignTokenNode.getOrCreateDependencyGraph(
      this,
      record.token
    )) {
      if (dependent.value !== dependent.update().value) {
        collected.set(
          dependent.token,
          new DesignTokenChangeRecordImpl(
            this,
            1,
            /* DesignTokenMutationType.change */
            dependent.token,
            dependent.evaluator.value
          )
        );
      }
    }

    return collected;
  }

  /**
   *
   * Notify children of changes to the node
   */

  notifyChildren(...records) {
    if (this.children.length) {
      for (let i = 0, l = this.children.length; i < l; i++) {
        for (let j = 0; j < records.length; j++) {
          this.children[i].dispatch(records[j]);
        }
      }
    }
  }

  tearDownDerivedTokenValue(token) {
    if (DesignTokenNode.isDerivedFor(this, token)) {
      const value = this._derived.get(token);

      value.dispose();

      this._derived.delete(token);

      value.evaluator.dependencies.forEach((dependency) => {
        DesignTokenNode.getOrCreateDependencyGraph(this, dependency).delete(
          value
        );
      });
    }
  }

  setupDerivedTokenValue(token, value, subscribeNode = false) {
    const deriver = new DerivedValue(
      token,
      DerivedValueEvaluator.getOrCreate(value),
      this,
      subscribeNode
        ? {
            handleChange: () => {
              if (deriver.value !== deriver.update().value) {
                const record = new DesignTokenChangeRecordImpl(
                  this,
                  1,
                  /* DesignTokenMutationType.change */
                  deriver.token,
                  deriver.evaluator.value
                );

                DesignTokenNode.queueNotification(record);
                this.dispatch(record);
                DesignTokenNode.notify();
              }
            }
          }
        : undefined
    );

    this._derived.set(token, deriver);

    deriver.evaluator.dependencies.forEach((dependency) => {
      if (dependency !== token) {
        DesignTokenNode.getOrCreateDependencyGraph(this, dependency).add(
          deriver
        );
      }
    });

    return deriver;
  }
}

DesignTokenNode._notifications = [];

class QueuedStyleSheetTarget {
  setProperty(name, value) {
    Updates.enqueue(() => this.target.setProperty(name, value));
  }

  removeProperty(name) {
    Updates.enqueue(() => this.target.removeProperty(name));
  }
}

/**
 * Handles setting properties for a FASTElement using Constructable Stylesheets
 */

class ConstructableStyleSheetTarget extends QueuedStyleSheetTarget {
  constructor(source) {
    super();

    const sheet = new CSSStyleSheet();

    this.target = sheet.cssRules[sheet.insertRule(':host{}')].style;
    source.$fastController.addStyles(new ElementStyles([sheet]));
  }
}

class DocumentStyleSheetTarget extends QueuedStyleSheetTarget {
  constructor() {
    super();

    const sheet = new CSSStyleSheet();

    this.target = sheet.cssRules[sheet.insertRule(':root{}')].style;
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
}

class HeadStyleElementStyleSheetTarget extends QueuedStyleSheetTarget {
  constructor() {
    super();
    this.style = document.createElement('style');
    document.head.appendChild(this.style);

    const { sheet } = this.style; // Because the HTMLStyleElement has been appended,
    // there shouldn't exist a case where `sheet` is null,
    // but if-check it just in case.

    if (sheet) {
      // https://github.com/jsdom/jsdom uses https://github.com/NV/CSSOM for it's CSSOM implementation,
      // which implements the DOM Level 2 spec for CSSStyleSheet where insertRule() requires an index argument.
      const index = sheet.insertRule(':root{}', sheet.cssRules.length);

      this.target = sheet.cssRules[index].style;
    }
  }
}

/**
 * Handles setting properties for a FASTElement using an HTMLStyleElement
 */

class StyleElementStyleSheetTarget {
  constructor(target) {
    this.store = new Map();
    this.target = null;

    const controller = target.$fastController;

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
    Updates.enqueue(() => {
      if (this.target !== null) {
        this.target.setProperty(name, value);
      }
    });
  }

  removeProperty(name) {
    this.store.delete(name);
    Updates.enqueue(() => {
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
      // https://github.com/jsdom/jsdom uses https://github.com/NV/CSSOM for it's CSSOM implementation,
      // which implements the DOM Level 2 spec for CSSStyleSheet where insertRule() requires an index argument.
      const index = sheet.insertRule(':host{}', sheet.cssRules.length);

      this.target = sheet.cssRules[index].style;
    } else {
      this.target = null;
    }
  }
}

__decorate(
  [observable],
  StyleElementStyleSheetTarget.prototype,
  'target',
  void 0
);

/**
 * Controls emission for default values. This control is capable
 * of emitting to multiple {@link PropertyTarget | PropertyTargets},
 * and only emits if it has at least one root.
 *
 * @internal
 */

class RootStyleSheetTarget {
  setProperty(name, value) {
    RootStyleSheetTarget.properties[name] = value;

    for (const target of RootStyleSheetTarget.roots.values()) {
      target.setProperty(name, value);
    }
  }

  removeProperty(name) {
    delete RootStyleSheetTarget.properties[name];

    for (const target of RootStyleSheetTarget.roots.values()) {
      target.removeProperty(name);
    }
  }

  static registerRoot(root) {
    const { roots } = RootStyleSheetTarget;

    if (!roots.has(root)) {
      roots.add(root);

      for (const key in RootStyleSheetTarget.properties) {
        root.setProperty(key, RootStyleSheetTarget.properties[key]);
      }
    }
  }

  static unregisterRoot(root) {
    const { roots } = RootStyleSheetTarget;

    if (roots.has(root)) {
      roots.delete(root);

      for (const key in RootStyleSheetTarget.properties) {
        root.removeProperty(key);
      }
    }
  }
}

RootStyleSheetTarget.roots = new Set();
RootStyleSheetTarget.properties = {}; // Caches PropertyTarget instances

const propertyTargetCache = new WeakMap(); // Use Constructable StyleSheets for FAST elements when supported, otherwise use
// HTMLStyleElement instances

const propertyTargetCtor = ElementStyles.supportsAdoptedStyleSheets
  ? ConstructableStyleSheetTarget
  : StyleElementStyleSheetTarget;
/**
 * Manages creation and caching of PropertyTarget instances.
 *
 * @internal
 */

const PropertyTargetManager = Object.freeze({
  getOrCreate(source) {
    if (propertyTargetCache.has(source)) {
      return propertyTargetCache.get(source);
    }

    let target;

    if (source instanceof Document) {
      target = ElementStyles.supportsAdoptedStyleSheets
        ? new DocumentStyleSheetTarget()
        : new HeadStyleElementStyleSheetTarget();
    } else {
      target = new propertyTargetCtor(source);
    }

    propertyTargetCache.set(source, target);

    return target;
  }
});

/**
 * @public
 */

class DesignToken {
  constructor(configuration) {
    this.subscriberNotifier = {
      handleChange: (source, change) => {
        const record = {
          target:
            change.target === FASTDesignTokenNode.defaultNode
              ? 'default'
              : change.target.target,
          token: this
        };

        this.subscribers.notify(record);
      }
    };
    this.name = configuration.name;
    Observable.getNotifier(this).subscribe(this.subscriberNotifier);
  }

  /**
   * The default value of the token (alias of {@link DesignToken.default})
   */

  get $value() {
    return this.default;
  }

  /**
   * The default value of the token, or undefined if it has not been set.
   */

  get default() {
    return FASTDesignTokenNode.defaultNode.getTokenValue(this);
  }

  get subscribers() {
    if (this._subscribers) {
      return this._subscribers;
    }

    this._subscribers = new SubscriberSet(this);

    return this._subscribers;
  }

  static isCSSDesignTokenConfiguration(config) {
    return typeof config.cssCustomPropertyName === 'string';
  }

  static create(config) {
    if (typeof config === 'string') {
      return new CSSDesignToken({
        name: config,
        cssCustomPropertyName: config
      });
    } else {
      return DesignToken.isCSSDesignTokenConfiguration(config)
        ? new CSSDesignToken(config)
        : new DesignToken(config);
    }
  }

  /**
   * Configures the strategy for resolving hierarchical relationships between FASTElement targets.
   */

  static withStrategy(strategy) {
    FASTDesignTokenNode.withStrategy(strategy);
  }

  /**
   * Registers a target for emitting default style values.
   * {@link CSSDesignToken | CSSDesignTokens} with default values assigned via
   * {@link DesignToken.withDefault} will emit CSS custom properties to all
   * registered targets.
   * @param target - The target to register, defaults to the document
   */

  static registerDefaultStyleTarget(target = document) {
    if (target instanceof FASTElement || target instanceof Document) {
      target = PropertyTargetManager.getOrCreate(target);
    }

    RootStyleSheetTarget.registerRoot(target);
  }

  /**
   * Unregister a target for default style emission.
   * @param target - The root to deregister, defaults to the document
   */

  static unregisterDefaultStyleTarget(target = document) {
    if (target instanceof FASTElement || target instanceof Document) {
      target = PropertyTargetManager.getOrCreate(target);
    }

    RootStyleSheetTarget.unregisterRoot(target);
  }

  /**
   * Retrieves the value of the token for a target element.
   */

  getValueFor(target) {
    return FASTDesignTokenNode.getOrCreate(target).getTokenValue(this);
  }

  /**
   * Sets the value of the token for a target element.
   */

  setValueFor(target, value) {
    FASTDesignTokenNode.getOrCreate(target).setTokenValue(
      this,
      this.normalizeValue(value)
    );

    return this;
  }

  /**
   * Deletes the value of the token for a target element.
   */

  deleteValueFor(target) {
    FASTDesignTokenNode.getOrCreate(target).deleteTokenValue(this);

    return this;
  }

  /**
   * Sets the default value of the token.
   */

  withDefault(value) {
    FASTDesignTokenNode.defaultNode.setTokenValue(
      this,
      this.normalizeValue(value)
    );

    return this;
  }

  /**
   * Subscribes a subscriber to notifications for the token.
   */

  subscribe(subscriber) {
    this.subscribers.subscribe(subscriber);
  }

  /**
   * Unsubscribes a subscriber to notifications for the token.
   */

  unsubscribe(subscriber) {
    this.subscribers.unsubscribe(subscriber);
  }

  /**
   * Alias the token to the provided token.
   * @param token - the token to alias to
   */

  alias(token) {
    return (resolve) => resolve(token);
  }

  normalizeValue(value) {
    if (value instanceof DesignToken) {
      value = this.alias(value);
    }

    return value;
  }
}

/**
 * @public
 */

let CSSDesignToken = class CSSDesignToken extends DesignToken {
  constructor(configuration) {
    super(configuration);
    this.cssReflector = {
      handleChange: (source, record) => {
        const target =
          record.target === FASTDesignTokenNode.defaultNode
            ? FASTDesignTokenNode.rootStyleSheetTarget
            : record.target instanceof FASTDesignTokenNode
            ? PropertyTargetManager.getOrCreate(record.target.target)
            : null;

        if (target) {
          if (
            record.type === 2
            /* DesignTokenMutationType.delete */
          ) {
            target.removeProperty(this.cssCustomProperty);
          } else {
            target.setProperty(
              this.cssCustomProperty,
              this.resolveCSSValue(record.target.getTokenValue(this))
            );
          }
        }
      }
    };
    this.cssCustomProperty = `--${configuration.cssCustomPropertyName}`;
    this.cssVar = `var(${this.cssCustomProperty})`;
    Observable.getNotifier(this).subscribe(this.cssReflector);
  }

  /**
   * The DesignToken represented as a string that can be used in CSS.
   */

  createCSS() {
    return this.cssVar;
  }

  /**
   * Creates HTML to be used within a template.
   */

  createHTML() {
    return this.cssVar;
  }

  resolveCSSValue(value) {
    return value && typeof value.createCSS === 'function'
      ? value.createCSS()
      : value;
  }
};

CSSDesignToken = __decorate([cssDirective(), htmlDirective()], CSSDesignToken);

const defaultDesignTokenResolutionStrategy = {
  contains: composedContains,

  parent(element) {
    let parent = composedParent(element);

    while (parent !== null) {
      if (parent instanceof FASTElement) {
        return parent;
      }

      parent = composedParent(parent);
    }

    return null;
  }
};

class FASTDesignTokenNode extends DesignTokenNode {
  constructor(target) {
    super();
    this.target = target; // By default, nodes are not attached to the defaultNode for performance
    // reasons. However, that behavior can throw if retrieval for a node
    // happens before the bind() method is called. To guard against that,
    //  lazily attach to the defaultNode when get/set/delete methods are called.

    this.setTokenValue = this.lazyAttachToDefault(super.setTokenValue);
    this.getTokenValue = this.lazyAttachToDefault(super.getTokenValue);
    this.deleteTokenValue = this.lazyAttachToDefault(super.deleteTokenValue);
  }

  static get strategy() {
    if (this._strategy === undefined) {
      FASTDesignTokenNode.withStrategy(defaultDesignTokenResolutionStrategy);
    }

    return this._strategy;
  }

  connectedCallback(controller) {
    let parent = FASTDesignTokenNode.findParent(controller.source);

    if (parent === null) {
      parent = FASTDesignTokenNode.defaultNode;
    }

    if (parent !== this.parent) {
      const reparent = [];

      for (const child of parent.children) {
        if (
          child instanceof FASTDesignTokenNode &&
          FASTDesignTokenNode.strategy.contains(controller.source, child.target)
        ) {
          reparent.push(child);
        }
      }

      parent.appendChild(this);

      for (const child of reparent) {
        this.appendChild(child);
      }
    }
  }

  disconnectedCallback(controller) {
    FASTDesignTokenNode.cache.delete(this.target);
    this.dispose();
  }

  static getOrCreate(target) {
    let found = FASTDesignTokenNode.cache.get(target);

    if (found) {
      return found;
    }

    found = new FASTDesignTokenNode(target);
    FASTDesignTokenNode.cache.set(target, found);
    target.$fastController.addBehavior(FASTDesignTokenNode.strategy);
    target.$fastController.addBehavior(found);

    return found;
  }

  static withStrategy(strategy) {
    this._strategy = strategy;
  }

  static findParent(target) {
    let current = FASTDesignTokenNode.strategy.parent(target);

    while (current !== null) {
      const node = FASTDesignTokenNode.cache.get(current);

      if (node) {
        return node;
      }

      current = FASTDesignTokenNode.strategy.parent(current);
    }

    return null;
  }

  /**
   * Creates a function from a function that lazily attaches the node to the default node.
   */

  lazyAttachToDefault(fn) {
    return (...args) => {
      if (this.parent === null) {
        FASTDesignTokenNode.defaultNode.appendChild(this);
      }

      return fn.apply(this, args);
    };
  }
}

FASTDesignTokenNode.defaultNode = new DesignTokenNode();
FASTDesignTokenNode.rootStyleSheetTarget = new RootStyleSheetTarget();
FASTDesignTokenNode.cache = new WeakMap();

export { DesignTokenStyleTarget };
export { DesignTokenEventResolutionStrategy };
export { CSSDesignToken, DesignToken };
