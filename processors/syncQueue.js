const userQuery = require("../models/users");

const syncQueueProcessor = (job, done) => {
  userQuery.addOrUpdate(job.data.user, job.data.user.id);
  done();
};

module.exports = syncQueueProcessor;
