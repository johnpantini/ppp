import { KernelServiceId } from './interfaces.js';
import { FAST } from './platform.js';

/**
 * The default UpdateQueue.
 * @public
 */
export const Updates = FAST.getById(KernelServiceId.updateQueue, () => {
  const tasks = [];
  const pendingErrors = [];
  const rAF = globalThis.requestAnimationFrame ?? globalThis.setImmediate;
  let updateAsync = true;

  function throwFirstError() {
    if (pendingErrors.length) {
      throw pendingErrors.shift();
    }
  }

  function tryRunTask(task) {
    try {
      task.call();
    } catch (error) {
      if (updateAsync) {
        pendingErrors.push(error);
        setImmediate(throwFirstError);
      } else {
        tasks.length = 0;
        throw error;
      }
    }
  }

  function process() {
    const capacity = 1024;
    let index = 0;

    while (index < tasks.length) {
      tryRunTask(tasks[index]);
      index++;

      // Prevent leaking memory for long chains of recursive calls to `enqueue`.
      // If we call `enqueue` within a task scheduled by `enqueue`, the queue will
      // grow, but to avoid an O(n) walk for every task we execute, we don't
      // shift tasks off the queue after they have been executed.
      // Instead, we periodically shift 1024 tasks off the queue.
      if (index > capacity) {
        // Manually shift all values starting at the index back to the
        // beginning of the queue.
        for (
          let scan = 0, newLength = tasks.length - index;
          scan < newLength;
          scan++
        ) {
          tasks[scan] = tasks[scan + index];
        }

        tasks.length -= index;
        index = 0;
      }
    }

    tasks.length = 0;
  }

  function enqueue(callable) {
    tasks.push(callable);

    if (tasks.length < 2) {
      updateAsync ? rAF(process) : process();
    }
  }

  return Object.freeze({
    enqueue,
    next: () => new Promise(enqueue),
    process,
    setMode: (isAsync) => (updateAsync = isAsync)
  });
});
