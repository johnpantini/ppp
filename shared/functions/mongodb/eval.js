exports = function (code = 'return {};') {
  return new Function('context', code.toString())(context);
};
