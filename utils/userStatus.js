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

module.exports = { getUserIdBasedOnRoute };
