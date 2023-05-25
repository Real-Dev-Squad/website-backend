const userQuery = require("../models/users");

const syncQueueProcessor = (job, done) => {
  const { id, ...user } = job.data.user;
  userQuery.addOrUpdate(user, id);
  done();
};

module.exports = syncQueueProcessor;
