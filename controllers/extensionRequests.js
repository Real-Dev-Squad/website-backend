const extensionRequestsQuery = require("../models/extensionRequests");
const { addLog } = require("../models/logs");
const tasks = require("../models/tasks");
const { getUsername, getUsernameElseUndefined, getUserIdElseUndefined } = require("../utils/users");
const { EXTENSION_REQUEST_STATUS } = require("../constants/extensionRequests");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { transformQuery } = require("../utils/extensionRequests");
const { parseQueryParams } = require("../utils/queryParser");
const logsQuery = require("../models/logs");
const { getFullName } = require("../utils/users");

/**
 * Create ETA extension Request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createTaskExtensionRequest = async (req, res) => {
  try {
    let extensionBody = req.body;

    let assigneeUsername = await getUsernameElseUndefined(extensionBody.assignee);
    let assigneeId = extensionBody.assignee;
    if (!assigneeUsername) {
      assigneeId = await getUserIdElseUndefined(extensionBody.assignee);
      assigneeUsername = extensionBody.assignee;
      extensionBody.assignee = assigneeId;
    }

    if (!assigneeId) {
      return res.boom.badRequest("User Not Found");
    }

    if (req.userData.id !== extensionBody.assignee && !req.userData.roles?.super_user) {
      return res.boom.forbidden("Only assigned user and super user can create an extension request for this task.");
    }

    const { taskData: task } = await tasks.fetchTask(extensionBody.taskId);
    if (!task) {
      return res.boom.badRequest("Task Not Found");
    }
    if (task.assignee !== assigneeUsername) {
      return res.boom.badRequest("This task is assigned to some different user.");
    }
    if (task.endsOn >= extensionBody.newEndsOn) {
      return res.boom.badRequest("New ETA must be greater than Old ETA");
    }
    if (extensionBody.oldEndsOn !== task.endsOn) {
      extensionBody.oldEndsOn = task.endsOn;
    }

    const latestExtensionRequest = await extensionRequestsQuery.fetchLatestExtensionRequest({
      taskId: extensionBody.taskId,
    });

    if (latestExtensionRequest && latestExtensionRequest.status === EXTENSION_REQUEST_STATUS.PENDING) {
      return res.boom.badRequest("An extension request for this task already exists.");
    }

    let requestNumber;
    if (latestExtensionRequest && latestExtensionRequest.assigneeId === assigneeId) {
      if (latestExtensionRequest.requestNumber && latestExtensionRequest.requestNumber > 0) {
        requestNumber = latestExtensionRequest.requestNumber + 1;
        extensionBody = { ...extensionBody, requestNumber };
      } else {
        extensionBody = { ...extensionBody, requestNumber: 2 };
      }
    } else {
      extensionBody = { ...extensionBody, requestNumber: 1 };
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
    const { cursor, size, order } = req.query;
    const { status, taskId, assignee } = parseQueryParams(req._parsedUrl.search);
    const { transformedSize, transformedStatus } = transformQuery(size, status);

    const allExtensionRequests = await extensionRequestsQuery.fetchPaginatedExtensionRequests(
      { taskId, status: transformedStatus, assignee },
      { cursor, order, size: transformedSize }
    );
    return res.json({
      message: "Extension Requests returned successfully!",
      ...allExtensionRequests,
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
      let allExtensionRequests;
      if (taskId) {
        const latestExtensionRequest = await extensionRequestsQuery.fetchLatestExtensionRequest({
          taskId,
        });

        if (latestExtensionRequest && latestExtensionRequest.assigneeId !== userId) {
          allExtensionRequests = [];
        } else {
          // Add reviewer's name if status is not PENDING
          if (latestExtensionRequest.status === "APPROVED" || latestExtensionRequest.status === "DENIED") {
            const logs = await logsQuery.fetchLogs(
              { "meta.extensionRequestId": latestExtensionRequest.id, limit: 1 },
              "extensionRequests"
            );

            if (
              logs.length === 1 &&
              logs[0]?.meta?.userId &&
              (logs[0]?.body?.status === "APPROVED" || logs[0]?.body?.status === "DENIED") // Make sure log is only related to status change
            ) {
              const superUserId = logs[0].meta.userId;
              const name = await getFullName(superUserId);
              latestExtensionRequest.reviewedBy = `${name?.first_name} ${name?.last_name}`;
              latestExtensionRequest.reviewedAt = logs[0].timestamp._seconds;
            }
          }
          allExtensionRequests = [latestExtensionRequest];
        }
      } else {
        allExtensionRequests = await extensionRequestsQuery.fetchExtensionRequests({
          assignee: userId,
          status: status || undefined,
        });
      }
      return res.json({ message: "Extension Requests returned successfully!", allExtensionRequests });
    } else {
      return res.boom.notFound("User doesn't exist");
    }
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
  const { dev } = req.query;
  const isDev = dev === "true";
  try {
    const extensionRequest = await extensionRequestsQuery.fetchExtensionRequest(req.params.id);
    if (!extensionRequest.extensionRequestData) {
      return res.boom.notFound("Extension Request not found");
    }

    if (
      isDev &&
      !req.userData?.roles.super_user &&
      (extensionRequest.extensionRequestData.status === EXTENSION_REQUEST_STATUS.APPROVED ||
        extensionRequest.extensionRequestData.status === EXTENSION_REQUEST_STATUS.DENIED)
    ) {
      return res.boom.badRequest("Only pending extension request can be updated");
    }

    if (req.body.assignee) {
      const { taskData: task } = await tasks.fetchTask(extensionRequest.extensionRequestData.taskId);
      if (task.assignee !== (await getUsername(req.body.assignee))) {
        return res.boom.badRequest("This task is assigned to some different user");
      }
    }

    const promises = [extensionRequestsQuery.updateExtensionRequest(req.body, req.params.id)];
    // If flag is present, then only create log for change in ETA/reason by SU
    let body = {};
    // Check if reason has been changed
    if (req.body.reason && req.body.reason !== extensionRequest.extensionRequestData.reason) {
      body = { ...body, oldReason: extensionRequest.extensionRequestData.reason, newReason: req.body.reason };
    }
    // Check if newEndsOn has been changed
    if (req.body.newEndsOn && req.body.newEndsOn !== extensionRequest.extensionRequestData.newEndsOn) {
      body = { ...body, oldEndsOn: extensionRequest.extensionRequestData.newEndsOn, newEndsOn: req.body.newEndsOn };
    }
    // Check if title has been changed
    if (req.body.title && req.body.title !== extensionRequest.extensionRequestData.title) {
      body = { ...body, oldTitle: extensionRequest.extensionRequestData.title, newTitle: req.body.title };
    }

    // Validate if there's any update that actually happened, then only create the log
    if (Object.keys(body).length > 0) {
      const extensionLog = {
        type: "extensionRequests",
        meta: {
          extensionRequestId: req.params.id,
          taskId: extensionRequest.extensionRequestData.taskId,
          userId: req.userData.id,
        },
        body,
      };
      promises.push(addLog(extensionLog.type, extensionLog.meta, extensionLog.body));
    }
    await Promise.all(promises);

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
        extensionRequestId: req.params.id,
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
