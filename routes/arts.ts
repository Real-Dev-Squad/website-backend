import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import arts from "../controllers/arts";
import artValidator from "../middlewares/validators/arts";

router.get("/", arts.fetchArts);
router.get("/user/self", authenticate, arts.getSelfArts);
router.get("/user/:userId", authenticate, arts.getUserArts);
router.post("/user/add", authenticate, artValidator.createArt, arts.addArt);

module.exports = router;
