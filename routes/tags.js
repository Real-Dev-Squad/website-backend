import express from "express";
import { addTag, deleteTag, getAllTags, getTagsByType } from "../controllers/tags.js";
import { validTagBody } from "../middlewares/validators/tags.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();
const { SUPERUSER } = ROLES;

router.post("/", authenticate, authorizeRoles([SUPERUSER]), validTagBody, addTag);
router.delete("/:tagid", authenticate, authorizeRoles([SUPERUSER]), deleteTag);
router.get("/", getAllTags);
router.get("/:type", getTagsByType);

export default router;
