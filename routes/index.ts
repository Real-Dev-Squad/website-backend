import express from "express";
const app = express.Router();

app.use("/answers", require("./answers"));
app.use("/auctions", require("./auctions"));
app.use("/arts", require("./arts"));
app.use("/auth", require("./auth"));
app.use("/badges", require("./badges.js"));
app.use("/challenges", require("./challenges"));
app.use("/contributions", require("./contributions"));
app.use("/healthcheck", require("./healthCheck"));
app.use("/logs", require("./logs.js"));
app.use("/members", require("./members.js"));
app.use("/pullrequests", require("./pullrequests"));
app.use("/questions", require("./questions"));
app.use("/stocks", require("./stocks.js"));
app.use("/tasks", require("./tasks.js"));
app.use("/taskRequests", require("./taskRequests"));
app.use("/trade", require("./trading"));
app.use("/users/status", require("./userStatus.js"));
app.use("/users", require("./users.js"));
app.use("/profileDiffs", require("./profileDiffs.js"));
app.use("/wallet", require("./wallets.js"));
app.use("/extension-requests", require("./extensionRequests"));
app.use("/tags", require("./tags.js"));
app.use("/levels", require("./levels.js"));
app.use("/items", require("./items.js"));
app.use("/cache", require("./cloudflareCache"));
app.use("/external-accounts", require("./external-accounts.js"));
app.use("/events", require("./events.js"));
app.use("/discord-actions", require("./discordactions.js"));
app.use("/issues", require("./issues"));
app.use("/progresses", require("./progresses"));
app.use("/monitor", require("./monitor.js"));
app.use("/staging", require("./staging"));
app.use("/applications", require("./applications"));
app.use("/v1/fcm-tokens", require("./fcmToken.js"));
app.use("/v1/notifications", require("./notify"));
app.use("/goals", require("./goals"));
app.use("/invites", require("./invites"));
module.exports = app;
