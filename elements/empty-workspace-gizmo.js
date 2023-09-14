/** @decorator */

import {
  paletteGreenDark2,
  paletteGreenLight1,
  paletteWhite,
  paletteBlack,
  themeConditional,
  paletteGrayBase,
  paletteGrayLight1,
  paletteGrayLight3,
  paletteRedDark2,
  paletteRedLight1,
  palettePurpleLight3,
  palettePurpleLight2,
  palettePurpleBase,
  paletteYellowLight3,
  paletteYellowDark2,
  palettePurpleDark3,
  palettePurpleDark2,
  paletteGreenLight2,
  paletteGreenLight3,
  paletteGreenBase
} from '../design/design-tokens.js';
import { debounce } from '../lib/ppp-decorators.js';
import { PPPElement } from '../lib/ppp-element.js';
import { Observable, css, html, ref } from '../vendor/fast-element.min.js';
import '../vendor/matter.min.js';

export const emptyWorkspaceGizmoTemplate = html`
  <template>
    <div class="holder" ${ref('holder')}></div>
  </template>
`;

export const emptyWorkspaceGizmoStyles = css`
  :host {
    display: flex;
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
  }

  .holder {
    overflow: hidden;
    position: relative;
    height: 100%;
    width: 100%;
  }

  canvas {
    padding: 0;
    border: 0;
    margin: 0;
    vertical-align: baseline;
  }
`;

export class EmptyWorkspaceGizmo extends PPPElement {
  render;

  @debounce(100)
  recalculateDimensions() {
    const width = this.holder.clientWidth;
    const height = this.holder.clientHeight;

    this.render.bounds.max.x = width;
    this.render.bounds.max.y = height;
    this.render.options.width = width;
    this.render.options.height = height;
    this.render.canvas.width = width;
    this.render.canvas.height = height;

    Matter.Render.setPixelRatio(this.render, window.devicePixelRatio);
  }

  onResize() {
    return this.recalculateDimensions();
  }

  onSideNavExpandedChange = {
    handleChange() {
      return this.recalculateDimensions();
    }
  };

  connectedCallback() {
    super.connectedCallback();

    this.onResize = this.onResize.bind(this);
    this.onSideNavExpandedChange.handleChange =
      this.onSideNavExpandedChange.handleChange.bind(this);

    Observable.getNotifier(ppp.app.sideNav).subscribe(
      this.onSideNavExpandedChange,
      'expanded'
    );

    window.addEventListener('resize', this.onResize);

    const Common = Matter.Common;

    Common.logLevel = 0;

    Matter.use('matter-attractors');
    Matter.use('matter-wrap');

    const dims = {
      width: this.holder.clientWidth,
      height: this.holder.clientHeight
    };

    const Engine = Matter.Engine;
    const Events = Matter.Events;
    const Runner = Matter.Runner;
    const Render = Matter.Render;
    const World = Matter.World;
    const Body = Matter.Body;
    const Mouse = Matter.Mouse;
    const Bodies = Matter.Bodies;
    const engine = Engine.create();

    const render = Render.create({
      element: this.holder,
      engine: engine,
      options: {
        showVelocity: false,
        width: dims.width,
        height: dims.height,
        wireframes: false,
        background: false,
        pixelRatio: window.devicePixelRatio
      }
    });

    this.render = render;

    const runner = Runner.create();
    const world = engine.world;

    engine.gravity.scale = 0;

    const circle = Bodies.circle(
      render.options.width / 4,
      render.options.height / 4,
      Math.max(dims.width / 8, dims.height / 8) / 2,
      {
        render: {
          fillStyle: themeConditional(paletteGrayLight3, paletteBlack).$value,
          strokeStyle: themeConditional(paletteGrayBase, paletteGrayLight1)
            .$value,
          lineWidth: 3
        },
        isStatic: true,
        plugin: {
          attractors: [
            function (a, b) {
              return {
                x: 1e-6 * (a.position.x - b.position.x),
                y: 1e-6 * (a.position.y - b.position.y)
              };
            }
          ]
        }
      }
    );

    World.add(world, circle);

    for (let i = 0; i < 20; i += 1) {
      const width = Common.random(0, render.options.width);
      const height = Common.random(0, render.options.height);
      const radius =
        Common.random() > 0.6 ? Common.random(10, 80) : Common.random(4, 60);
      const sides = Common.random(3, 6);
      const x = Bodies.polygon(width, height, sides, radius, {
        mass: radius / 5,
        friction: 0,
        frictionAir: 0.02,
        angle: Math.round(360 * Math.random()),
        render: {
          fillStyle: themeConditional(paletteWhite, paletteBlack).$value,
          strokeStyle: themeConditional(paletteGrayBase, paletteGrayLight1)
            .$value,
          lineWidth: 1
        }
      });

      World.add(world, x);

      let smallCircle;

      smallCircle = Bodies.circle(width, height, Common.random(2, 8), {
        mass: 0.1,
        friction: 0,
        frictionAir: 0.01,
        render: {
          fillStyle: themeConditional(paletteWhite, paletteBlack).$value,
          strokeStyle: themeConditional(palettePurpleDark2, paletteYellowLight3)
            .$value,
          lineWidth: 1
        }
      });

      World.add(world, smallCircle);

      smallCircle = Bodies.circle(width, height, Common.random(2, 20), {
        mass: 4,
        friction: 0,
        frictionAir: 0,
        render: {
          fillStyle: themeConditional(paletteGreenBase, paletteBlack).$value,
          strokeStyle: themeConditional(paletteGrayBase, paletteGreenLight1)
            .$value,
          lineWidth: 3
        }
      });

      World.add(world, smallCircle);

      smallCircle = Bodies.circle(width, height, Common.random(2, 30), {
        mass: 0.1,
        friction: 0.6,
        frictionAir: 0.8,
        render: {
          fillStyle: themeConditional(paletteWhite, paletteBlack).$value,
          strokeStyle: themeConditional(paletteGrayBase, paletteGrayLight1)
            .$value,
          lineWidth: 2
        }
      });

      World.add(world, smallCircle);
    }

    const mouse = Mouse.create(render.canvas);

    Events.on(engine, 'afterUpdate', function () {
      if (mouse.position.x) {
        Body.translate(circle, {
          x: 0.12 * (mouse.position.x - circle.position.x),
          y: 0.12 * (mouse.position.y - circle.position.y)
        });

        mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
        mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
        mouse.element.removeEventListener('touchmove', mouse.mousewheel);
        mouse.element.removeEventListener('touchmove', mouse.mousemove);
        mouse.element.removeEventListener('touchstart', mouse.mousedown);
        mouse.element.removeEventListener('touchend', mouse.mouseup);
      }
    });

    Runner.run(runner, engine);
    Render.run(render);
  }

  disconnectedCallback() {
    this.holder.firstElementChild.remove();

    window.removeEventListener('resize', this.onResize);
    Observable.getNotifier(ppp.app.sideNav).unsubscribe(
      this.onSideNavExpandedChange,
      'expanded'
    );

    super.disconnectedCallback();
  }
}

export default EmptyWorkspaceGizmo.compose({
  template: emptyWorkspaceGizmoTemplate,
  styles: emptyWorkspaceGizmoStyles
}).define();
