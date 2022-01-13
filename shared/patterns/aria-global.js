/** @decorator */

import { attr } from '../element/components/attributes.js';

/**
 * Some states and properties are applicable to all host language elements regardless of whether a role is applied.
 * The following global states and properties are supported by all roles and by all base markup elements.
 * {@link https://www.w3.org/TR/wai-aria-1.1/#global_states}
 *
 * This is intended to be used as a mixin. Be sure you extend PPPElement.
 *
 * @public
 */
export class ARIAGlobalStatesAndProperties {
  @attr({ attribute: 'aria-atomic', mode: 'fromView' })
  ariaAtomic;

  @attr({ attribute: 'aria-busy', mode: 'fromView' })
  ariaBusy;

  @attr({ attribute: 'aria-controls', mode: 'fromView' })
  ariaControls;

  @attr({ attribute: 'aria-current', mode: 'fromView' })
  ariaCurrent;

  @attr({ attribute: 'aria-describedby', mode: 'fromView' })
  ariaDescribedby;

  @attr({ attribute: 'aria-details', mode: 'fromView' })
  ariaDetails;

  @attr({ attribute: 'aria-disabled', mode: 'fromView' })
  aiaDisabled;

  @attr({ attribute: 'aria-errormessage', mode: 'fromView' })
  ariaErrormessage;

  @attr({ attribute: 'aria-flowto', mode: 'fromView' })
  ariaFlowto;

  @attr({ attribute: 'aria-haspopup', mode: 'fromView' })
  ariaHaspopup;

  @attr({ attribute: 'aria-hidden', mode: 'fromView' })
  ariaHidden;

  /**
   * Indicates the entered value does not conform to the format expected by the application.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-invalid}
   * @public
   * @remarks
   * HTML Attribute: aria-invalid
   */
  @attr({ attribute: 'aria-invalid', mode: 'fromView' })
  ariaInvalid;

  /**
   * Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-keyshortcuts}
   * @public
   * @remarks
   * HTML Attribute: aria-keyshortcuts
   */
  @attr({ attribute: 'aria-keyshortcuts', mode: 'fromView' })
  ariaKeyshortcuts;

  /**
   * Defines a string value that labels the current element.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-label}
   * @public
   * @remarks
   * HTML Attribute: aria-label
   */
  @attr({ attribute: 'aria-label', mode: 'fromView' })
  ariaLabel;

  /**
   * Identifies the element (or elements) that labels the current element.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby}
   * @public
   * @remarks
   * HTML Attribute: aria-labelledby
   */
  @attr({ attribute: 'aria-labelledby', mode: 'fromView' })
  ariaLabelledby;

  /**
   * Indicates that an element will be updated, and describes the types of updates the user agents,
   * assistive technologies, and user can expect from the live region.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-live}
   * @public
   * @remarks
   * HTML Attribute: aria-live
   */
  @attr({ attribute: 'aria-live', mode: 'fromView' })
  ariaLive;

  /**
   * Identifies an element (or elements) in order to define a visual,
   * functional, or contextual parent/child relationship between DOM elements
   * where the DOM hierarchy cannot be used to represent the relationship.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-owns}
   * @public
   * @remarks
   * HTML Attribute: aria-owns
   */
  @attr({ attribute: 'aria-owns', mode: 'fromView' })
  ariaOwns;

  /**
   * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-relevant}
   * @public
   * @remarks
   * HTML Attribute: aria-relevant
   */
  @attr({ attribute: 'aria-relevant', mode: 'fromView' })
  ariaRelevant;

  /**
   * Defines a human-readable, author-localized description for the role of an element.
   *
   * {@link https://www.w3.org/TR/wai-aria-1.1/#aria-roledescription}
   * @public
   * @remarks
   * HTML Attribute: aria-roledescription
   */
  @attr({ attribute: 'aria-roledescription', mode: 'fromView' })
  ariaRoledescription;
}
