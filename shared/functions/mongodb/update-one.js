exports = function (
  { db = 'ppp', collection },
  filter = {},
  update = {},
  options = {}
) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.updateOne(filter, update, options);
};
