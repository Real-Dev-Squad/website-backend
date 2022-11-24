const { getUsername, getUserId } = require("./users");

const fromFirestoreData = async (extensionRequest) => {
  if (!extensionRequest) {
    return extensionRequest;
  }

  let { assignee } = extensionRequest;

  if (assignee) {
    assignee = await getUsername(assignee);
  }

  return {
    ...extensionRequest,
    assignee,
  };
};

const toFirestoreData = async (extensionRequest) => {
  if (!extensionRequest) {
    return extensionRequest;
  }
  const updatedExtensionRequest = { ...extensionRequest };
  const { assignee } = extensionRequest;
  if (assignee) {
    updatedExtensionRequest.assignee = await getUserId(assignee);
  }
  return updatedExtensionRequest;
};

const buildExtensionRequests = (extensionRequests, initialExtensionRequestsArray = []) => {
  if (!extensionRequests.empty) {
    extensionRequests.forEach((extensionRequest) => {
      initialExtensionRequestsArray.push({
        id: extensionRequest.id,
        ...extensionRequest.data(),
      });
    });
  }

  return initialExtensionRequestsArray;
};

module.exports = {
  buildExtensionRequests,
  fromFirestoreData,
  toFirestoreData,
};
