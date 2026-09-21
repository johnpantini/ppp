/**
 * Inserts a new document.
 * Runs in the MongoDB server-function environment with an injected context.
 * @param {{db?: string, collection: string}} target Database (default ppp) and collection.
 * @param {object} [document={}] Document to insert.
 * @returns {unknown} The original driver result, cursor or promise.
 */
exports = function ({ db = 'ppp', collection }, document = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.insertOne(document);
};
