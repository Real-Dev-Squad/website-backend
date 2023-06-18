const removeUnwantedProperties = (propertiesToRemove, data) => {
  let cleanData = Array.isArray(data) ? [] : {};

  if (Array.isArray(data)) {
    data.forEach((item) => {
      const cleanItem = Object.entries(item).reduce((acc, [key, value]) => {
        if (!propertiesToRemove.includes(key)) {
          return Object.assign(acc, { [key]: value });
        }
        return acc;
      }, {});
      cleanData.push(cleanItem);
    });
  } else if (typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      if (!propertiesToRemove.includes(key)) {
        cleanData = { ...cleanData, [key]: value };
      }
    });
  }

  return cleanData;
};

module.exports = {
  removeUnwantedProperties,
};
