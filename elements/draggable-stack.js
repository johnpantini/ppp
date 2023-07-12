/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  css,
  html,
  observable,
  slotted,
  elements,
  attr
} from '../vendor/fast-element.min.js';
import { normalize } from '../design/styles.js';

export const draggableStackTemplate = html`
  <template>
    <slot
      ${slotted({
        property: 'defaultSlottedNodes',
        filter: elements('.draggable')
      })}
    ></slot>
  </template>
`;

export const draggableStackStyles = css`
  ${normalize()}
  :host([dragging]) {
    cursor: grabbing;
  }
`;

function getPoint(e) {
  const doc = document.documentElement;
  const scrollX = Math.max(0, window.scrollX ?? 0) - (doc.clientLeft || 0);
  const scrollY = Math.max(0, window.scrollY ?? 0) - (doc.clientTop || 0);
  const pointX = e ? Math.max(0, e.pageX || e.clientX || 0) - scrollX : 0;
  const pointY = e ? Math.max(0, e.pageY || e.clientY || 0) - scrollY : 0;

  return { x: pointX, y: pointY };
}

export class DraggableStack extends PPPElement {
  @attr({ mode: 'boolean' })
  dragging;

  @observable
  defaultSlottedNodes;

  #dragLists = [this];

  #dragItem = null;

  constructor() {
    super();

    this.onPress = this.onPress.bind(this);
    this.onRelease = this.onRelease.bind(this);
    this.onMove = this.onMove.bind(this);
    this.dragging = false;
  }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener('pointerdown', this.onPress, true);
    window.addEventListener('touchstart', this.onPress, true);
    window.addEventListener('pointerup', this.onRelease, true);
    window.addEventListener('pointercancel', this.onRelease, true);
    window.addEventListener('touchend', this.onRelease, true);
    window.addEventListener('pointermove', this.onMove, true);
    window.addEventListener('touchmove', this.onMove, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('pointerdown', this.onPress, true);
    window.removeEventListener('touchstart', this.onPress, true);
    window.removeEventListener('pointerup', this.onRelease, true);
    window.removeEventListener('pointercancel', this.onRelease, true);
    window.removeEventListener('touchend', this.onRelease, true);
    window.removeEventListener('pointermove', this.onMove, true);
    window.removeEventListener('touchmove', this.onMove, true);
  }

  #isOnTop(item, x, y) {
    const box = item.getBoundingClientRect();

    const isx = x > box.left && x < box.left + box.width;
    const isy = y > box.top && y < box.top + box.height;

    return isx && isy;
  }

  #swapItems(item1, item2) {
    const parent1 = item1.parentNode;
    const parent2 = item2.parentNode;

    if (parent1 !== parent2) {
      parent2.insertBefore(item1, item2);
    } else {
      const temp = document.createElement('div');

      parent1.insertBefore(temp, item1);
      parent2.insertBefore(item1, item2);
      parent1.insertBefore(item2, temp);
      parent1.removeChild(temp);
    }
  }

  #makeDragItem(item) {
    this.#trashDragItem();
    this.#dragLists = [this];
    this.#dragItem = item;
    this.#dragItem.classList.add('dragging');
  }

  #trashDragItem() {
    if (this.#dragItem) {
      this.#dragItem.classList.remove('dragging');
      this.#dragItem = null;
    }
  }

  onPress(e) {
    const cp = e.composedPath();
    let dragHandle;

    if (
      (dragHandle = cp.find((n) => n?.classList?.contains?.('drag-handle')))
    ) {
      e.preventDefault();

      this.dragging = true;
      this.#makeDragItem(dragHandle.closest('.draggable'));
      this.onMove(e);
      this.$emit('dragstart');
    }
  }

  onRelease() {
    const wasDragging = this.dragging;

    this.dragging = false;
    this.#trashDragItem();

    if (wasDragging) {
      this.$emit('pppdragend');
    }
  }

  onMove(e) {
    if (this.dragging) {
      e.preventDefault();

      const point = getPoint(e);
      let container = this;

      for (let a = 0; a < this.#dragLists.length; ++a) {
        const subContainer = this.#dragLists[a];

        if (this.#isOnTop(subContainer, point.x, point.y)) {
          container = subContainer;
        }
      }

      if (
        this.#isOnTop(container, point.x, point.y) &&
        container.children.length === 0
      ) {
        container.appendChild(this.#dragItem);

        return;
      }

      for (let b = 0; b < container.children.length; ++b) {
        const subItem = container.children[b];

        if (subItem === this.#dragItem) {
          continue;
        }

        if (this.#isOnTop(subItem, point.x, point.y)) {
          this.#swapItems(this.#dragItem, subItem);
        }
      }
    }
  }

  nodes() {
    return Array.from(this.defaultSlottedNodes);
  }
}

export default DraggableStack.compose({
  template: draggableStackTemplate,
  styles: draggableStackStyles
}).define();
