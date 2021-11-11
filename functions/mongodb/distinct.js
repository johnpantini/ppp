exports = function ({ db = 'ppp', collection }, key, query = {}, options = {}) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.distinct(key, query, options);
};
