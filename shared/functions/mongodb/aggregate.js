exports = function ({ db = 'ppp', collection }, pipeline = []) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.aggregate(pipeline);
};
