const { getUsername } = require("./users");

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

const formatExtensionRequest = async (extensionRequest) => {
  if (!extensionRequest) return extensionRequest;

  let { timestamp, id, assignee, ...body } = extensionRequest;

  if (assignee) {
    assignee = await getUsername(assignee);
  }

  return { ...body, id, timestamp, assignee };
};

module.exports = {
  buildExtensionRequests,
  formatExtensionRequest,
};
