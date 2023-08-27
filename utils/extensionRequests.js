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

const transformQuery = (size, dev = false) => {
  const transformedDev = JSON.parse(dev);

  let transformedSize;
  if (size) {
    transformedSize = parseInt(size);
  }

  return { transformedSize: transformedSize, transformedDev: transformedDev };
};

const generateNextLink = (nextPageParams) => {
  const queryStringList = [];
  const searchQueries = ["assignee", "taskId", "status"];
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(nextPageParams)) {
    if (!value) continue;

    if (searchQueries.includes(key)) {
      let queryString;
      if (Array.isArray(value)) {
        queryString = key + ":" + value.join("+");
      } else {
        queryString = key + ":" + value;
      }
      queryStringList.push(queryString);
    } else {
      urlSearchParams.append(key, value);
    }
  }
  urlSearchParams.append("q", queryStringList.join(","));
  const nextLink = `/extension-requests?${urlSearchParams.toString()}`;
  return nextLink;
};

module.exports = {
  buildExtensionRequests,
  formatExtensionRequest,
  transformQuery,
  generateNextLink,
};
