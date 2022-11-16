import { FoundationElement } from './foundation-element.js';

export class TopLoader extends FoundationElement {
  clamp(n, min, max) {
    if (n < min) return min;

    if (n > max) return max;

    return n;
  }

  isStarted() {
    return typeof this.status === 'number';
  }

  set(n) {
    const self = this;

    n = this.clamp(n, 0.08, 1);

    this.status = n === 1 ? null : n;

    // noinspection BadExpressionStatementJS
    this.offsetWidth;

    this.queue &&
      this.queue(function (next) {
        // Update percentage
        self.classList.add('visible');
        self.bar.setAttribute(
          'style',
          `transform: translate(${(-1 + n) * 100}%, 0)`
        );

        if (n === 1) {
          // Fade out
          self.classList.add('visible');

          // noinspection BadExpressionStatementJS
          self.offsetWidth;

          setTimeout(function () {
            self.classList.remove('visible');

            setTimeout(function () {
              self.bar.setAttribute('style', `transform: translate(-100%, 0)`);
            }, 400);

            next();
          }, 400);
        } else {
          setTimeout(next, 400);
        }
      });

    return this;
  }

  start() {
    if (!this.status) this.set(0);

    const that = this;

    // trickleSpeed = 400;
    const work = function () {
      setTimeout(function () {
        if (!that.status) return;

        that.trickle();
        work();
      }, 400);
    };

    work();

    return this;
  }

  trickle() {
    return this.inc();
  }

  inc(amount) {
    let n = this.status;

    if (!n) {
      return this.start();
    } else if (n > 1) {
      return this;
    } else {
      if (typeof amount !== 'number') {
        if (n >= 0 && n < 0.2) {
          amount = 0.1;
        } else if (n >= 0.2 && n < 0.5) {
          amount = 0.04;
        } else if (n >= 0.5 && n < 0.8) {
          amount = 0.02;
        } else if (n >= 0.8 && n < 0.99) {
          amount = 0.005;
        } else {
          amount = 0;
        }
      }

      n = this.clamp(n + amount, 0, 0.994);

      return this.set(n);
    }
  }

  stop(force) {
    if (!force && !this.status) return this;

    return this.inc(0.3 + 0.5 * Math.random()).set(1);
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    this.status = null;
    this.queue = (function () {
      const pending = [];

      function next() {
        const fn = pending.shift();

        if (fn) {
          fn(next);
        }
      }

      return function (fn) {
        pending.push(fn);

        if (pending.length === 1) next();
      };
    })();
  }
}
