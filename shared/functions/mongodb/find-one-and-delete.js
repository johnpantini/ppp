exports = function ({ db = 'ppp', collection }, filter = {}, options = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.findOneAndDelete(filter, options);
};
