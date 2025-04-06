import express from "express";
import authenticate from "../middlewares/authenticate";
import { createArt } from "../middlewares/validators/arts";
import { addArt, getArts, getUserArts } from "../controllers/arts";

const router = express.Router();

router.get("/", getArts);
router.get("/user/self", authenticate, getUserArts); // this route is soon going to be deprecated soon, please use /arts/:userId endpoint.
router.get("/user/:userId", authenticate, getUserArts); // this route is soon going to be deprecated soon, please use /arts/:userId endpoint.
router.get("/:userId", authenticate, getUserArts);
router.post("/user/add", authenticate, createArt, addArt);

export default router;
