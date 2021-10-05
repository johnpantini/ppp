exports = function ({ db = 'ppp', collection }, filter = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.deleteMany(filter);
};
