const isObjectOrClass = (v) =>
  v &&
  ((typeof v === 'object' && !Array.isArray(v)) ||
    (typeof v === 'function' && v.prototype && v.prototype.constructor));

export function merge(target, source, options = {}) {
  if (!isObjectOrClass(target))
    throw new TypeError('Property "target" requires object type');

  if (!source) return target;

  if (!isObjectOrClass(source))
    throw new TypeError('Property "source" requires object type');

  if (source === target) return target;

  const keys = Object.getOwnPropertyNames(source);

  keys.push(...Object.getOwnPropertySymbols(source));

  for (const key of keys) {
    if (key === '__proto__') continue;

    if (options.filter && !options.filter(source, key)) continue;

    if ((options.combine || options.adjunct) && target.hasOwnProperty(key))
      continue;

    const descriptor = Object.getOwnPropertyDescriptor(source, key);

    if (options.descriptor && (descriptor.get || descriptor.set)) {
      Object.defineProperty(target, key, descriptor);
      continue;
    }

    let srcVal = source[key];

    if (srcVal === undefined) continue;

    delete descriptor.get;
    delete descriptor.set;

    if (!options.descriptor) {
      descriptor.enumerable = true;
      descriptor.configurable = true;
      descriptor.writable = true;
    }

    let trgVal = target[key];

    if (isObjectOrClass(srcVal)) {
      if (options.deep) {
        if (!isObjectOrClass(trgVal)) {
          descriptor.value = trgVal = {};
          Object.defineProperty(target, key, descriptor);
        }

        merge(trgVal, srcVal, options);
        continue;
      }

      if (options.clone) srcVal = merge({}, srcVal, options);
    } else if (Array.isArray(srcVal)) {
      if (options.arrayMerge && Array.isArray(trgVal)) {
        if (typeof options.arrayMerge === 'function')
          srcVal = options.arrayMerge(trgVal, srcVal);
        else srcVal = merge.arrayCombine(trgVal, srcVal);
      } else if (options.clone) srcVal = srcVal.slice();
    }

    descriptor.value = srcVal;
    Object.defineProperty(target, key, descriptor);
  }

  return target;
}

merge.all = function all(objects, options = {}) {
  const target = objects[0];

  for (const [i, o] of objects.entries()) {
    if (i > 0) merge(target, o, options);
  }

  return target;
};

merge.arrayCombine = function (target, source) {
  return target.concat(source.filter((v) => !target.includes(v)));
};
