exports.copyProperties = function(source, desctination, excludeProperties) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
          if (!excludeProperties.hasOwnProperty(key)) {
            desctination[key] = source[key];
          }
        }
    }
}