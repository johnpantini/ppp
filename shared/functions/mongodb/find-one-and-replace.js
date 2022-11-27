exports = function (
  { db = 'ppp', collection },
  filter = {},
  replacement = {},
  options = {}
) {
  const col = context.services
    .get('mongodb-atlas')
    .db(db)
    .collection(collection);

  return col.findOneAndReplace(filter, replacement, options);
};
