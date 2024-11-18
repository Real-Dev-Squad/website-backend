import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import arts from "../controllers/arts";
import artValidator from "../middlewares/validators/arts";

router.get("/", arts.fetchArts);
router.get("/user/self", authenticate, arts.getSelfArts); // this route is soon going to be deprecated soon, please use /arts/:userId endpoint.
router.get("/user/:userId", authenticate, arts.getUserArts); // this route is soon going to be deprecated soon, please use /arts/:userId endpoint.
router.get("/:userId", authenticate, arts.getUserArts);
router.post("/user/add", authenticate, artValidator.createArt, arts.addArt);

module.exports = router;
