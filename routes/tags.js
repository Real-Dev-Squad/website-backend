const express = require("express");

const { addTag, deleteTag, getAllTags } = require("../controllers/tags");
const { validTagBody } = require("../middlewares/validators/tags");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

const router = express.Router();

router.post("/", authenticate, authorizeRoles([SUPERUSER]), validTagBody, addTag);
router.delete("/:tagid", authenticate, authorizeRoles([SUPERUSER]), deleteTag);
router.get("/", getAllTags);

module.exports = router;
