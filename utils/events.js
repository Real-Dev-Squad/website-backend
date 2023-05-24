const removeUnwantedProperties = (propertiesToRemove, data) => {
  const cleanData = Array.isArray(data) ? [] : {};

  if (Array.isArray(data)) {
    data.forEach((item) => {
      const cleanItem = {};
      Object.keys(item).forEach((key) => {
        if (!propertiesToRemove.includes(key)) {
          cleanItem[key] = item[key];
        }
      });
      cleanData.push(cleanItem);
    });
  } else if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      if (!propertiesToRemove.includes(key)) {
        cleanData[key] = data[key];
      }
    });
  }

  return cleanData;
};

module.exports = {
  removeUnwantedProperties,
};
