/**
 * Executes trusted JavaScript with the server function context in scope.
 * @param {string} [code] Function body, defaulting to an empty document result.
 * @returns {unknown} Script result; execution errors propagate to the caller.
 */
exports = function (code = 'return {};') {
  return new Function('context', code.toString())(context);
};
