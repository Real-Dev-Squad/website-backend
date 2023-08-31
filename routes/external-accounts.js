const express = require("express");
const router = express.Router();
const authorizeBot = require("../middlewares/authorizeBot");
const validator = require("../middlewares/validators/external-accounts");
const externalAccount = require("../controllers/external-accounts");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { fetchAllUsers } = require("../models/users");
router.post("/", validator.externalAccountData, authorizeBot.verifyDiscordBot, externalAccount.addExternalAccountData);
router.get("/:token", authenticate, externalAccount.getExternalAccountData);
router.patch("/discord-sync", authenticate, authorizeRoles([SUPERUSER]), externalAccount.syncExternalAccountData);
router.patch(
  "/users",
  // authenticate, authorizeRoles([SUPERUSER]),
  externalAccount.newSyncExternalAccountData
);

router.patch("/abc", async (req, res) => {
  // console.log('hello');

  // const arr = []
  // for(let i = 0; i < 10; i++){
  //         const user = {
  //           incompleteUserDetails: false,
  //           discordId: "19867666" + Math.floor(Math.random() * 100000),
  //           github_display_name: "",
  //           last_name: "",
  //           github_id: "13244883" + Math.floor(Math.random() * 100000),
  //           first_name: "",
  //           username: "",
  //           updated_at: 1692917441814,
  //           roles: { archived: false, in_discord: true },
  //         };
  //     const result =  addOrUpdate(user);
  //     arr.push(result);
  // }
  // console.log("hello sd");

  // return res.json({result : await Promise.all(arr)});
  return res.json(await fetchAllUsers());
});

module.exports = router;
// znu827pHdMOrYW2dWNcT
