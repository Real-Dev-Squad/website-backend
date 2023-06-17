const { userState } = require("../constants/userStatus");

/* returns the User Id based on the route path
 *  @param req {Object} : Express request object
 *  @returns userId {Number | undefined} : the user id incase it exists
 */
const getUserIdBasedOnRoute = (req) => {
  let userId;
  if (req.route.path === "/self") {
    userId = req.userData.id;
  } else {
    userId = req.params.userId;
  }
  return userId;
};

/* returns the timestamp for the next day at midnight
 *  @param None
 *  @returns timeStamp : timestamp for the next day at midnight
 */
const getTommorowTimeStamp = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/* returns the timestamp for today at midnight
 *  @param None
 *  @returns timeStamp : timestamp for today at midnight
 */
const getTodayTimeStamp = () => {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today.getTime();
};

/* modifies the data in the newStatusData object based on current State
 *  @param newStatusData : object containing the currentStatus object
 *  @returns None
 */
const filterStatusData = (newStatusData) => {
  const newUserState = newStatusData.currentStatus.state;
  const isNewStateOOO = newUserState === userState.OOO;
  const isNewStateActive = newUserState === userState.ACTIVE;
  if (!isNewStateOOO) {
    newStatusData.currentStatus.until = "";
  }
  if (isNewStateActive) {
    newStatusData.currentStatus.message = "";
  }
};

const filterUsersWithOnboardingState = (data) => {
  return data.filter((item) => item.currentStatus.state === userState.ONBOARDING);
};

module.exports = {
  getUserIdBasedOnRoute,
  getTommorowTimeStamp,
  getTodayTimeStamp,
  filterStatusData,
  filterUsersWithOnboardingState,
};
