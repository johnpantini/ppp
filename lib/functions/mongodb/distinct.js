/**
 * Returns distinct values of a field in matching documents.
 * Runs in the MongoDB server-function environment with an injected context.
 * @param {{db?: string, collection: string}} target Database (default ppp) and collection.
 * @param {string} key Field path whose distinct values are requested.
 * @param {object} [query={}] MongoDB query predicate.
 * @param {object} [options={}] Driver distinct options.
 * @returns {unknown} The original driver result, cursor or promise.
 */
exports = function ({ db = 'ppp', collection }, key, query = {}, options = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.distinct(key, query, options);
};
