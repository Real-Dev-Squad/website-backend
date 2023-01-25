const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const badgesValidator = require("../middlewares/validators/badges");
const { upload } = require("../utils/multer");
const badgesController = require("../controllers/badges");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

router.get("/", badgesController.getBadges);
// INFO: upload(muter-middelware) looks for form-data key named file
router.post(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  upload.single("file"),
  badgesValidator.createBadge,
  badgesController.postBadge
);
router.post(
  "/assign",
  authenticate,
  authorizeRoles([SUPERUSER]),
  badgesValidator.assignOrRemoveBadges,
  badgesController.postUserBadges
);
router.delete(
  "/remove",
  authenticate,
  authorizeRoles([SUPERUSER]),
  badgesValidator.assignOrRemoveBadges,
  badgesController.deleteUserBadges
);

module.exports = router;
