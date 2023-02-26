exports = function ({ db = 'ppp', collection }, documents = []) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.insertMany(documents);
};
