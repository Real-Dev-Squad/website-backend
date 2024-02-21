import { getUserStatus as getUserStatusFromModel } from "../models/usersStatus";

/**
 * Collects single User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserStatus = async (req: any, res: any) => {
    try {
      let userId: string;
      if (req.route.path === "/self") {
        userId = req.userData.id;
      } else {
        userId = req.params.userId;
      }
      if (userId) {
        const userData: any = await getUserStatusFromModel(userId);
        const { userStatusExists, id, data } = userData;
        const responseObject = { id, userId, data: null, message: "" };
        if (data) responseObject.data = data;
        let statusCode: number;
        if (userStatusExists) {
          statusCode = 200;
          responseObject.message = "User Status found successfully.";
        } else {
          statusCode = 404;
          responseObject.message = "User Status couldn't be found.";
        }
        return res.status(statusCode).json(responseObject);
      }
      return res.boom.notFound("User Status doesn't exist.");
    } catch (err) {
      logger.error(`Error while fetching the User Status: ${err}`);
      return res.boom.notFound("The User Status could not be found as an internal server error occurred.");
    }
  };

export default {
    getUserStatus,
}