import { FASTElementDefinition, attr, html, ref } from './fast-element.min.js';
import { staticallyCompose } from './fast-utilities.js';

var __decorate = function (decorators, target, key, desc) {
  var c = arguments.length,
    r =
      c < 3
        ? target
        : desc === null
        ? (desc = Object.getOwnPropertyDescriptor(target, key))
        : desc,
    d;

  if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if ((d = decorators[i]))
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;

  // noinspection CommaExpressionJS
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = function (k, v) {
  if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
    return Reflect.metadata(k, v);
};

/**
 * Determines what HTML tag name to use for the dependency.
 * @param dependency - The dependency the template is dependent on.
 * @returns The tag name to use in markup.
 * @beta
 */
export function tagFor(dependency) {
  if (typeof dependency === 'string') {
    return dependency;
  }

  if (typeof dependency === 'function') {
    dependency = FASTElementDefinition.getByType(dependency);

    if (!dependency) {
      throw new Error('Missing FASTElement definition.');
    }
  }

  return dependency.name;
}

/**
 * Some states and properties are applicable to all host language elements regardless of whether a role is applied.
 * The following global states and properties are supported by all roles and by all base markup elements.
 * {@link https://www.w3.org/TR/wai-aria-1.1/#global_states}
 *
 * This is intended to be used as a mixin. Be sure you extend FASTElement.
 *
 * @public
 */
export class ARIAGlobalStatesAndProperties {
  /**
   * Synchronize the `aria-disabled` property when the `disabled` property changes.
   */
  disabledChanged(prev, next) {
    if (super.disabledChanged) {
      super.disabledChanged(prev, next);
    }

    this.ariaDisabled = this.disabled ? 'true' : 'false';
  }
}

__decorate(
  [attr({ attribute: 'aria-atomic' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaAtomic',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-busy' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaBusy',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-controls' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaControls',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-current' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaCurrent',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-describedby' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaDescribedby',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-details' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaDetails',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-disabled' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaDisabled',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-errormessage' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaErrormessage',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-flowto' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaFlowto',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-haspopup' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaHaspopup',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-hidden' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaHidden',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-invalid' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaInvalid',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-keyshortcuts' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaKeyshortcuts',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-label' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaLabel',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-labelledby' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaLabelledby',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-live' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaLive',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-owns' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaOwns',
  void 0
);
__decorate(
  [attr({ attribute: 'aria-relevant' }), __metadata('design:type', Object)],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaRelevant',
  void 0
);
__decorate(
  [
    attr({ attribute: 'aria-roledescription' }),
    __metadata('design:type', Object)
  ],
  ARIAGlobalStatesAndProperties.prototype,
  'ariaRoledescription',
  void 0
);

/**
 * The template for the end slot.
 * For use with {@link StartEnd}
 *
 * @public
 */
export function endSlotTemplate(options = {}) {
  return html`
    <slot name="end" ${ref('end')}>${staticallyCompose(options.end)}</slot>
  `.inline();
}

/**
 * The template for the start slots.
 * For use with {@link StartEnd}
 *
 * @public
 */
export function startSlotTemplate(options = {}) {
  return html`
    <slot name="start" ${ref('start')}
      >${staticallyCompose(options.start)}
    </slot>
  `.inline();
}
