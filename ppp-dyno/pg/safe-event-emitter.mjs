import { EventEmitter } from 'events';

export class SafeEventEmitter extends EventEmitter {
  emit(event, ...args) {
    try {
      if (event === 'error' && !this.listenerCount('error')) return false;

      return super.emit(event, ...args);
    } catch (ignored) {
      return false;
    }
  }
}
