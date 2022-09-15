const express = require("express");
const app = express();

app.use("/auctions", require("./auctions.js"));
app.use("/arts", require("./arts.js"));
app.use("/auth", require("./auth.js"));
app.use("/badges", require("./badges.js"));
app.use("/challenges", require("./challenges.js"));
app.use("/contributions", require("./contributions.js"));
app.use("/healthcheck", require("./healthCheck.js"));
app.use("/logs", require("./logs.js"));
app.use("/members", require("./members.js"));
app.use("/pullrequests", require("./pullrequests.js"));
app.use("/stocks", require("./stocks.js"));
app.use("/tasks", require("./tasks.js"));
app.use("/trade", require("./trading.js"));
app.use("/users", require("./users.js"));
app.use("/profileDiffs", require("./profileDiffs.js"));
app.use("/wallet", require("./wallets.js"));

module.exports = app;
