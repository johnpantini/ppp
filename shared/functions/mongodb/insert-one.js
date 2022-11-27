exports = function ({ db = 'ppp', collection }, document = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.insertOne(document);
};
