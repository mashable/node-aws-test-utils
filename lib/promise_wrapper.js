function wrapFn(destObj, sourceObj, key) {
  return function() {
    var args = Array.from(arguments);
    return new Promise((resolve, reject) => {
      args[args.length] = (err, data) => (err) ? reject(err) : resolve(data);
      sourceObj[key].apply(sourceObj, args);
    });
  }
};

module.exports = {
  wrap: (destObj, sourceObj, excludes) => {
      excludes = excludes || [];
      for(var key in sourceObj) {
        if (typeof(sourceObj[key]) !== 'function') {
          continue;
        }
        if (excludes.indexOf(key) >= 0 || key === 'promise') {
          continue;
        }
        destObj[key] = wrapFn(destObj, sourceObj, key);
      }
      return destObj;
    },
};