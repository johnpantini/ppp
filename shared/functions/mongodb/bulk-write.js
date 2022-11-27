exports = function ({ db = 'ppp', collection }, operations = [], options = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.bulkWrite(operations, options);
};
