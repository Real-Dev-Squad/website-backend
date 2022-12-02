const extensionRequestsQuery = require("../models/extensionRequests");
const { addLog } = require("../models/logs");
const tasks = require("../models/tasks");
const { getUsername } = require("../utils/users");

/**
 * Create ETA extension Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createTaskExtensionRequest = async (req, res) => {
  try {
    const extensionBody = req.body;

    if (req.userData.id !== extensionBody.assignee && !req.userData.roles?.super_user) {
      return res.boom.forbidden("Only Super User can create an extension request for this task.");
    }

    const assigneeUsername = await getUsername(extensionBody.assignee);
    const { taskData: task } = await tasks.fetchTask(extensionBody.taskId);
    if (!task) {
      return res.boom.badRequest("Task with taskId doesn't exist");
    }
    if (task.assignee !== assigneeUsername) {
      return res.boom.badRequest("This task is assigned to some different user");
    }
    if (task.endsOn >= extensionBody.newEndsOn) {
      return res.boom.badRequest("The value for newEndsOn should be greater than the previous ETA");
    }
    if (extensionBody.oldEndsOn !== task.endsOn) {
      extensionBody.oldEndsOn = task.endsOn;
    }

    const prevExtensionRequest = await extensionRequestsQuery.fetchExtensionRequests({
      taskId: extensionBody.taskId,
      assignee: extensionBody.assignee,
    });
    if (prevExtensionRequest.length) {
      return res.boom.forbidden("An extension request for this task already exists.");
    }

    const extensionRequest = await extensionRequestsQuery.createETAExtension(extensionBody);

    const extensionLog = {
      type: "extensionRequest",
      meta: {
        taskId: extensionBody.taskId,
        createdBy: req.userData.id,
      },
      body: {
        extensionRequestId: extensionRequest.id,
        oldEndsOn: task.endsOn,
        newEndsOn: extensionBody.newEndsOn,
        assignee: extensionBody.assignee,
      },
    };

    await addLog(extensionLog.type, extensionLog.meta, extensionLog.body);

    return res.json({
      message: "Extension Request created successfully!",
      extensionRequestData: { ...extensionBody, id: extensionRequest.id },
    });
  } catch (err) {
    logger.error(`Error while creating new extension request: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Fetches all the Extension Requests
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchExtensionRequests = async (req, res) => {
  try {
    const { status, taskId, assignee } = req.query;
    const allExtensionRequests = await extensionRequestsQuery.fetchExtensionRequests({ taskId, status, assignee });

    return res.json({
      message: "Extension Requests returned successfully!",
      extensionRequestData: allExtensionRequests.length ? allExtensionRequests : [],
    });
  } catch (err) {
    logger.error(`Error while fetching Extension Requests ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const getExtensionRequest = async (req, res) => {
  try {
    const extensionRequestId = req.params.id;
    const { extensionRequestData } = await extensionRequestsQuery.fetchExtensionRequest(extensionRequestId);

    if (!extensionRequestData) {
      return res.boom.notFound("Extension Request not found");
    }
    extensionRequestData.id = extensionRequestId;
    return res.json({ message: "Extension Requests returned successfully!", extensionRequestData });
  } catch (err) {
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  createTaskExtensionRequest,
  fetchExtensionRequests,
  getExtensionRequest,
};
