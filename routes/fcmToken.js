const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const { fcmTokenController } = require("../controllers/fcmToken");
const { fcmTokenValidator } = require("../middlewares/validators/fcmToken");

// the route should be authenticated
router.post("/", fcmTokenValidator, authenticate, fcmTokenController);
module.exports = router;

// controller
/*
* 2 -> fcm token -> userId in /fcm-token route.
* multiple fcm token will store in different db : {userId:, fcmTokens: []}

 * should store fcm token in a different collection with user-id and the role-ids
 * route - /notify -> POST: data:{group-role, user-id, title, description} [mobile-app ]
 *
 * * PATCH call for fcm token modification
 */
