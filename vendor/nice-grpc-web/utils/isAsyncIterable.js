/** @internal */
export function isAsyncIterable(value) {
  return value != null && Symbol.asyncIterator in value;
}
