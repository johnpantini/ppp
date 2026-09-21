/**
 * Inserts a collection of new documents.
 * Runs in the MongoDB server-function environment with an injected context.
 * @param {{db?: string, collection: string}} target Database (default ppp) and collection.
 * @param {object[]} [documents=[]] Documents to insert.
 * @returns {unknown} The original driver result, cursor or promise.
 */
exports = function ({ db = 'ppp', collection }, documents = []) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.insertMany(documents);
};
