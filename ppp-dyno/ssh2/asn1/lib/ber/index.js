// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.
const errors = require('./errors');
const types = require('./types');

const Reader = require('./reader');
const Writer = require('./writer');

module.exports = {
  Reader: Reader,
  Writer: Writer
};

for (const t in types) {
  if (types.hasOwnProperty(t)) module.exports[t] = types[t];
}

for (const e in errors) {
  if (errors.hasOwnProperty(e)) module.exports[e] = errors[e];
}
