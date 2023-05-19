const Queue = require("bull");
const path = require("path");
const { REDIS_PORT, REDIS_URI } = require("../redisCredentials");

const syncQueue = new Queue("syncQueue", {
  redis: {
    port: REDIS_PORT,
    host: REDIS_URI,
  },
});

syncQueue.process(path.join(__dirname, "syncQueue.js"));
