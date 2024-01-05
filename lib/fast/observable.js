import {
  isFunction,
  isString,
  KernelServiceId,
  Message
} from './interfaces.js';
import {
  createMetadataLocator,
  FAST,
  makeSerializationNoop
} from './platform.js';
import { Updates } from './update-queue.js';
import { PropertyChangeNotifier, SubscriberSet } from './notifier.js';
/**
 * Describes how the source's lifetime relates to its controller's lifetime.
 * @public
 */
export const SourceLifetime = Object.freeze({
  /**
   * The source to controller lifetime relationship is unknown.
   */
  unknown: void 0,
  /**
   * The source and controller lifetimes are coupled to one another.
   * They can/will be GC'd together.
   */
  coupled: 1
});
/**
 * Common Observable APIs.
 * @public
 */
export const Observable = FAST.getById(KernelServiceId.observable, () => {
  const queueUpdate = Updates.enqueue;
  const volatileRegex = /(:|&&|\|\||if|\?\.)/;
  const notifierLookup = new WeakMap();
  let watcher = void 0;
  let createArrayObserver = (array) => {
    throw FAST.error(Message.needsArrayObservation);
  };

  function getNotifier(source) {
    let found = source.$fastController ?? notifierLookup.get(source);

    if (found === void 0) {
      Array.isArray(source)
        ? (found = createArrayObserver(source))
        : notifierLookup.set(
            source,
            (found = new PropertyChangeNotifier(source))
          );
    }

    return found;
  }

  const getAccessors = createMetadataLocator();

  class DefaultObservableAccessor {
    constructor(name) {
      this.name = name;
      this.field = `_${name}`;
      this.callback = `${name}Changed`;
    }

    getValue(source) {
      if (watcher !== void 0) {
        watcher.watch(source, this.name);
      }

      return source[this.field];
    }

    setValue(source, newValue) {
      const field = this.field;
      const oldValue = source[field];

      if (oldValue !== newValue) {
        source[field] = newValue;

        const callback = source[this.callback];

        if (isFunction(callback)) {
          callback.call(source, oldValue, newValue);
        }

        getNotifier(source).notify(this.name);
      }
    }
  }

  class ExpressionNotifierImplementation extends SubscriberSet {
    constructor(expression, initialSubscriber, isVolatileBinding = false) {
      super(expression, initialSubscriber);
      this.expression = expression;
      this.isVolatileBinding = isVolatileBinding;
      this.needsRefresh = true;
      this.needsQueue = true;
      this.isAsync = true;
      this.first = this;
      this.last = null;
      this.propertySource = void 0;
      this.propertyName = void 0;
      this.notifier = void 0;
      this.next = void 0;
    }

    setMode(isAsync) {
      this.isAsync = this.needsQueue = isAsync;
    }

    bind(controller) {
      this.controller = controller;

      const value = this.observe(controller.source, controller.context);

      if (!controller.isBound && this.requiresUnbind(controller)) {
        controller.onUnbind(this);
      }

      return value;
    }

    requiresUnbind(controller) {
      return (
        controller.sourceLifetime !== SourceLifetime.coupled ||
        this.first !== this.last ||
        this.first.propertySource !== controller.source
      );
    }

    unbind(controller) {
      this.dispose();
    }

    observe(source, context) {
      if (this.needsRefresh && this.last !== null) {
        this.dispose();
      }

      const previousWatcher = watcher;

      watcher = this.needsRefresh ? this : void 0;
      this.needsRefresh = this.isVolatileBinding;

      let result;

      try {
        result = this.expression(source, context);
      } finally {
        watcher = previousWatcher;
      }

      return result;
    }

    // backwards compat with v1 kernel
    disconnect() {
      this.dispose();
    }

    dispose() {
      if (this.last !== null) {
        let current = this.first;

        while (current !== void 0) {
          current.notifier.unsubscribe(this, current.propertyName);
          current = current.next;
        }

        this.last = null;
        this.needsRefresh = this.needsQueue = this.isAsync;
      }
    }

    watch(propertySource, propertyName) {
      const prev = this.last;
      const notifier = getNotifier(propertySource);
      const current = prev === null ? this.first : {};

      current.propertySource = propertySource;
      current.propertyName = propertyName;
      current.notifier = notifier;
      notifier.subscribe(this, propertyName);

      if (prev !== null) {
        if (!this.needsRefresh) {
          let prevValue;

          watcher = void 0;
          /* eslint-disable-next-line */
          prevValue = prev.propertySource[prev.propertyName];
          /* eslint-disable-next-line */
          watcher = this;

          if (propertySource === prevValue) {
            this.needsRefresh = true;
          }
        }

        prev.next = current;
      }

      this.last = current;
    }

    handleChange() {
      if (this.needsQueue) {
        this.needsQueue = false;
        queueUpdate(this);
      } else if (!this.isAsync) {
        this.call();
      }
    }

    call() {
      if (this.last !== null) {
        this.needsQueue = this.isAsync;
        this.notify(this);
      }
    }

    *records() {
      let next = this.first;

      while (next !== void 0) {
        yield next;
        next = next.next;
      }
    }
  }

  makeSerializationNoop(ExpressionNotifierImplementation);

  return Object.freeze({
    /**
     * @internal
     * @param factory - The factory used to create array observers.
     */
    setArrayObserverFactory(factory) {
      createArrayObserver = factory;
    },
    /**
     * Gets a notifier for an object or Array.
     * @param source - The object or Array to get the notifier for.
     */
    getNotifier,
    /**
     * Records a property change for a source object.
     * @param source - The object to record the change against.
     * @param propertyName - The property to track as changed.
     */
    track(source, propertyName) {
      watcher && watcher.watch(source, propertyName);
    },
    /**
     * Notifies watchers that the currently executing property getter or function is volatile
     * with respect to its observable dependencies.
     */
    trackVolatile() {
      watcher && (watcher.needsRefresh = true);
    },
    /**
     * Notifies subscribers of a source object of changes.
     * @param source - the object to notify of changes.
     * @param args - The change args to pass to subscribers.
     */
    notify(source, args) {
      getNotifier(source).notify(args);
    },
    /**
     * Defines an observable property on an object or prototype.
     * @param target - The target object to define the observable on.
     * @param nameOrAccessor - The name of the property to define as observable;
     * or a custom accessor that specifies the property name and accessor implementation.
     */
    defineProperty(target, nameOrAccessor) {
      if (isString(nameOrAccessor)) {
        nameOrAccessor = new DefaultObservableAccessor(nameOrAccessor);
      }

      getAccessors(target).push(nameOrAccessor);
      Reflect.defineProperty(target, nameOrAccessor.name, {
        enumerable: true,
        get() {
          return nameOrAccessor.getValue(this);
        },
        set(newValue) {
          nameOrAccessor.setValue(this, newValue);
        }
      });
    },
    /**
     * Finds all the observable accessors defined on the target,
     * including its prototype chain.
     * @param target - The target object to search for accessor on.
     */
    getAccessors,
    /**
     * Creates a {@link ExpressionNotifier} that can watch the
     * provided {@link Expression} for changes.
     * @param expression - The binding to observe.
     * @param initialSubscriber - An initial subscriber to changes in the binding value.
     * @param isVolatileBinding - Indicates whether the binding's dependency list must be re-evaluated on every value evaluation.
     */
    binding(
      expression,
      initialSubscriber,
      isVolatileBinding = this.isVolatileBinding(expression)
    ) {
      return new ExpressionNotifierImplementation(
        expression,
        initialSubscriber,
        isVolatileBinding
      );
    },
    /**
     * Determines whether a binding expression is volatile and needs to have its dependency list re-evaluated
     * on every evaluation of the value.
     * @param expression - The binding to inspect.
     */
    isVolatileBinding(expression) {
      return volatileRegex.test(expression.toString());
    }
  });
});
/**
 * Decorator: Defines an observable property on the target.
 * @param target - The target to define the observable on.
 * @param nameOrAccessor - The property name or accessor to define the observable as.
 * @public
 */
export function observable(target, nameOrAccessor) {
  Observable.defineProperty(target, nameOrAccessor);
}
/**
 * Decorator: Marks a property getter as having volatile observable dependencies.
 * @param target - The target that the property is defined on.
 * @param name - The property name.
 * @param name - The existing descriptor.
 * @public
 */
export function volatile(target, name, descriptor) {
  return Object.assign({}, descriptor, {
    get() {
      Observable.trackVolatile();

      return descriptor.get.apply(this);
    }
  });
}

const contextEvent = FAST.getById(KernelServiceId.contextEvent, () => {
  let current = null;

  return {
    get() {
      return current;
    },
    set(event) {
      current = event;
    }
  };
});

/**
 * Provides additional contextual information available to behaviors and expressions.
 * @public
 */
export const ExecutionContext = Object.freeze({
  /**
   * A default execution context.
   */
  default: {
    index: 0,
    length: 0,
    get event() {
      return ExecutionContext.getEvent();
    },
    eventDetail() {
      return this.event.detail;
    },
    eventTarget() {
      return this.event.target;
    }
  },
  /**
   * Gets the current event.
   * @returns An event object.
   */
  getEvent() {
    return contextEvent.get();
  },
  /**
   * Sets the current event.
   * @param event - An event object.
   */
  setEvent(event) {
    contextEvent.set(event);
  }
});
