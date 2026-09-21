/**
 * Finds the first matching document.
 * Runs in the MongoDB server-function environment with an injected context.
 * @param {{db?: string, collection: string}} target Database (default ppp) and collection.
 * @param {object} [filter={}] MongoDB query predicate.
 * @param {object} [options={}] Driver projection/query options.
 * @returns {unknown} The original driver result, cursor or promise.
 */
exports = function ({ db = 'ppp', collection }, filter = {}, options = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.findOne(filter, options);
};
