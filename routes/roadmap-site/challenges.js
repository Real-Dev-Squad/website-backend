const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/authenticate");
const challengesController = require("../../controllers/roadmap-site/challengeController");

router
  .route("/")
  .get(authenticate, challengesController.sendChallengeResponse)
  .post(authenticate, challengesController.sendChallengeResponse);

router.post("/subscribe", authenticate, challengesController.subscribeToChallenge);

module.exports = router;
