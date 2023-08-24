const extensionRequestsQuery = require("../models/extensionRequests");
const { addLog } = require("../models/logs");
const tasks = require("../models/tasks");
const { getUsername } = require("../utils/users");
const { EXTENSION_REQUEST_STATUS } = require("../constants/extensionRequests");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { transformQuery } = require("../utils/extensionRequests");
const { parseQueryParams } = require("../utils/queryParser");
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
      return res.boom.badRequest("Task with this id or taskid doesn't exist.");
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

    const extensionRequest = await extensionRequestsQuery.createExtensionRequest(extensionBody);

    const extensionLog = {
      type: "extensionRequests",
      meta: {
        taskId: extensionBody.taskId,
        createdBy: req.userData.id,
      },
      body: {
        extensionRequestId: extensionRequest.id,
        oldEndsOn: task.endsOn,
        newEndsOn: extensionBody.newEndsOn,
        assignee: extensionBody.assignee,
        status: EXTENSION_REQUEST_STATUS.PENDING,
      },
    };

    await addLog(extensionLog.type, extensionLog.meta, extensionLog.body);

    return res.json({
      message: "Extension Request created successfully!",
      extensionRequest: { ...extensionBody, id: extensionRequest.id },
    });
  } catch (err) {
    logger.error(`Error while creating new extension request: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    const { status, taskId, assignee, dev, cursor, size, order } = parseQueryParams(req._parsedUrl.search);

    const { transformedDev, transformedSize } = transformQuery(dev, size);

    let allExtensionRequests;

    if (transformedDev) {
      allExtensionRequests = await extensionRequestsQuery.fetchPaginatedExtensionRequests(
        { taskId, status, assignee },
        { cursor, order, size: transformedSize, dev }
      );
      return res.json({
        message: "Extension Requests returned successfully!",
        ...allExtensionRequests,
      });
    } else {
      allExtensionRequests = await extensionRequestsQuery.fetchExtensionRequests({ taskId, status, assignee });
    }

    return res.json({
      message: "Extension Requests returned successfully!",
      allExtensionRequests: allExtensionRequests.length ? allExtensionRequests : [],
    });
  } catch (err) {
    logger.error(`Error while fetching Extension Requests ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    return res.json({ message: "Extension Requests returned successfully!", extensionRequest: extensionRequestData });
  } catch (err) {
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Fetches all the extension requests of the logged in user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getSelfExtensionRequests = async (req, res) => {
  try {
    const { id: userId } = req.userData;
    const { taskId, status } = req.query;

    if (userId) {
      const allExtensionRequests = await extensionRequestsQuery.fetchExtensionRequests({
        status,
        taskId,
        assignee: userId,
      });
      return res.json({ message: "Extension Requests returned successfully!", allExtensionRequests });
    }
    return res.boom.notFound("User doesn't exist");
  } catch (error) {
    logger.error(`Error while fetching extension requests: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Updates the Extension Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateExtensionRequest = async (req, res) => {
  try {
    const extensionRequest = await extensionRequestsQuery.fetchExtensionRequest(req.params.id);
    if (!extensionRequest.extensionRequestData) {
      return res.boom.notFound("Extension Request not found");
    }

    if (req.body.assignee) {
      const { taskData: task } = await tasks.fetchTask(extensionRequest.extensionRequestData.taskId);
      if (task.assignee !== (await getUsername(req.body.assignee))) {
        return res.boom.badRequest("This task is assigned to some different user");
      }
    }

    await extensionRequestsQuery.updateExtensionRequest(req.body, req.params.id);
    return res.status(204).send();
  } catch (err) {
    logger.error(`Error while updating extension request: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Updates the Extension Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateExtensionRequestStatus = async (req, res) => {
  try {
    const extensionRequest = await extensionRequestsQuery.fetchExtensionRequest(req.params.id);
    if (!extensionRequest.extensionRequestData) {
      return res.boom.notFound("Extension Request not found");
    }
    const { status: extensionStatus } = req.body;

    const extensionLog = {
      type: "extensionRequests",
      meta: {
        taskId: extensionRequest.extensionRequestData.taskId,
        username: req.userData.username,
        userId: req.userData.id,
      },
      body: {
        status: extensionStatus,
      },
    };

    const promises = [
      extensionRequestsQuery.updateExtensionRequest(req.body, req.params.id),
      addLog(extensionLog.type, extensionLog.meta, extensionLog.body),
    ];

    if (extensionStatus === EXTENSION_REQUEST_STATUS.APPROVED) {
      const taskLog = {
        type: "task",
        meta: {
          taskId: extensionRequest.extensionRequestData.taskId,
          username: req.userData.username,
          userId: req.userData.id,
        },
        body: {
          subType: "update",
          new: {
            endsOn: extensionRequest.extensionRequestData.newEndsOn,
          },
        },
      };
      promises.push(
        tasks.updateTask(
          { endsOn: extensionRequest.extensionRequestData.newEndsOn },
          extensionRequest.extensionRequestData.taskId
        )
      );
      promises.push(addLog(taskLog.type, taskLog.meta, taskLog.body));
    }

    const [, extensionLogResult] = await Promise.all(promises);
    extensionLog.id = extensionLogResult.id;

    return res.json({ message: `Extension request ${extensionStatus} succesfully`, extensionLog });
  } catch (err) {
    logger.error(`Error while updating extension request: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createTaskExtensionRequest,
  fetchExtensionRequests,
  getExtensionRequest,
  getSelfExtensionRequests,
  updateExtensionRequest,
  updateExtensionRequestStatus,
};
