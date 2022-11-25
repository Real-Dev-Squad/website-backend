const buildExtensionRequests = (extensionRequests, initialArray = []) => {
  if (!extensionRequests.empty) {
    extensionRequests.forEach((extensionRequests) => {
      initialArray.push({
        id: extensionRequests.id,
        ...extensionRequests.data(),
      });
    });
  }

  return initialArray;
};

module.exports = {
  buildExtensionRequests,
};
