const { getUsername } = require("./users");

const modifyEvent = async (event) => {
  if (!event) {
    return event;
  }

  // for now I am doing it only for username we can add more field in future

  let { user } = event; // user will be the Id of the user

  if (user) {
    user = await getUsername(user);
  }

  return {
    ...event,
    user,
  };
};

const buildEventObject = (events, initialEventArray = []) => {
  if (!events.empty) {
    events.forEach((event) => {
      initialEventArray.push({
        id: event.id,
        ...event.data(),
      });
    });
  }

  return initialEventArray;
};
module.exports = {
  modifyEvent,
  buildEventObject,
};
