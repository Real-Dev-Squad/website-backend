const extensionRequestsQuery = require("../models/extensionRequest");
const tasks = require("../models/tasks");

/**
 * Create ETA extension Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createETAExtension = async (req, res) => {
  try {
    const { id: assignee } = req.userData;
    const body = {
      ...req.body,
      assignee,
    };
    const task = await tasks.fetchTask(body.taskId);
    if (!task) {
      return res.boom.badRequest("Task with taskId doesn't exist");
    }
    if (task.assignee !== assignee) {
      return res.boom.badRequest("This task is assigned to some different user");
    }
    if (body.oldEndsOn >= body.newEndsOn) {
      return res.boom.badRequest("The value for newEndsOn should be greater than the previous ETA");
    }
    const extensionRequest = await extensionRequestsQuery.createETAExtension(body);

    return res.json({
      message: "Extension Request created successfully!",
      task: body,
      id: extensionRequest.id,
    });
  } catch (err) {
    logger.error(`Error while creating new extension request: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  createETAExtension,
};
