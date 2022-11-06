const express = require("express");
const { createValidator } = require("express-joi-validation");
const {
  addTagsToItem,
  removeTagsFromItem,
  getItemsBasedOnType,
  getItemsBasedOnTagId,
  getAllItems,
  getItemsBasedOnitemId,
  getItemsBasedOnTagType,
} = require("../controllers/items");
const { itemTagPayload } = require("../middlewares/validators/items");

const router = express.Router();
const validator = createValidator();

router.post("/", validator.body(itemTagPayload), addTagsToItem);
router.delete("/", removeTagsFromItem);
router.get("/bytype/:type", getItemsBasedOnType);
router.get("/bytag/:tagid", getItemsBasedOnTagId);
router.get("/byitem/:itemid", getItemsBasedOnitemId);
router.get("/bytagtype/:tagtype", getItemsBasedOnTagType);
router.get("/", getAllItems);

module.exports = {
  routes: router,
};
