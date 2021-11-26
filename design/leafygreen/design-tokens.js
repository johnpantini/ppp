import { DesignToken } from '../../lib/design-token/design-token.js';

const { create } = DesignToken;

/** @public */
export const bodyFont = create('body-font').withDefault(
  '-apple-system, BlinkMacSystemFont, Roboto, Segoe UI, "Trebuchet MS", Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, Icons16, sans-serif'
);
/** @public */
export const baseHeightMultiplier = create(
  'base-height-multiplier'
).withDefault(9);
/** @public */
export const density = create('density').withDefault(0);
/** @public */
export const designUnit = create('design-unit').withDefault(4);
