import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';

const require = createRequire(import.meta.url);
const bindings = require(`./${process.platform}-${process.arch}/bcrypt_lib.node`);

export async function genSalt(rounds = 10, minor = 'b') {
  return new Promise((resolve, reject) => {
    randomBytes(16, function (error, randomBytes) {
      if (error) {
        reject(error);
      } else {
        bindings.gen_salt(minor, rounds, randomBytes, (err, salt) => {
          if (err) {
            reject(err);
          } else {
            resolve(salt);
          }
        });
      }
    });
  });
}

export async function hash(data, salt = 10) {
  if (typeof salt === 'number') {
    salt = await genSalt(salt);
  }

  return new Promise((resolve, reject) => {
    bindings.encrypt(data, salt, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

export async function compare(data, hash) {
  return new Promise((resolve, reject) => {
    bindings.compare(data, hash, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function getRounds(hash) {
  return bindings.get_rounds(hash);
}
