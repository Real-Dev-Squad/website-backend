import express from "express";
import { addTagsToItem, removeTagsFromItem, getItemBasedOnFilter } from "../controllers/items.js";
import { validateItemsPayload, validateItemQuery } from "../middlewares/validators/items.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();
const { SUPERUSER } = ROLES;

router.post("/", authenticate, authorizeRoles([SUPERUSER]), validateItemsPayload, addTagsToItem);
router.delete("/", authenticate, authorizeRoles([SUPERUSER]), removeTagsFromItem);
router.get("/filter", authenticate, validateItemQuery, getItemBasedOnFilter);

export default router;
