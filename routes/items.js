const express = require("express");
const { addTagsToItem, removeTagsFromItem, getItemBasedOnFilter } = require("../controllers/items");
const { validateItemsPayload, validateItemQuery } = require("../middlewares/validators/items");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

const router = express.Router();

router.post("/", authenticate, authorizeRoles([SUPERUSER]), validateItemsPayload, addTagsToItem);
router.delete("/", authenticate, authorizeRoles([SUPERUSER]), removeTagsFromItem);
router.get("/filter", authenticate, validateItemQuery, getItemBasedOnFilter);

module.exports = router;
