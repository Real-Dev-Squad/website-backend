import { getRequestByKeyValues, updateRequest } from "../models/requests";
import {
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  LOG_ACTION,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_LOG_TYPE,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_STATE,
  REQUEST_TYPE,
} from "../constants/requests";
import { addLog } from "../models/logs";
import { createRequest } from "../models/requests";
import { fetchTask } from "../models/tasks";
import { CustomResponse } from "../typeDefinitions/global";
import { ExtensionRequest, ExtensionRequestCreateBody, ExtensionRequestRequest } from "../types/extensionRequests";
import { getUsernameElseUndefined } from "../utils/users";

export const createTaskExtensionRequest = async (req: ExtensionRequestRequest, res: CustomResponse) => {
  try {
    const { userData } = req;
    const { id: requestedBy, roles } = userData || {};
    const { body } = req;

    if (!requestedBy) {
      return res.boom.unauthorized();
    }

    const { taskId } = body;
    let extensionBody: ExtensionRequestCreateBody = { ...body, requestedBy };
    let assignee: string | undefined = undefined;

    const { taskData: task } = await fetchTask(taskId);
    if (!task) {
      return res.boom.badRequest("Task Not Found");
    }

    const { assigneeId, endsOn } = task;
    if (!assigneeId) {
      return res.boom.badRequest("Assignee is not present for this task");
    }

    assignee = await getUsernameElseUndefined(assigneeId);
    if (!assignee) {
      return res.boom.badRequest("Assignee is not present for this task");
    } else {
      extensionBody = { ...extensionBody, assignee };
    }

    if (requestedBy !== assigneeId && !roles?.super_user) {
      return res.boom.forbidden("Only assigned user and super user can create an extension request for this task.");
    }

    if (endsOn >= body.newEndsOn) {
      return res.boom.badRequest("New ETA must be greater than Old ETA");
    }

    if (body.oldEndsOn != endsOn) {
      return res.boom.badRequest("Old ETA does not match the task's ETA");
    }

    const latestExtensionRequest: ExtensionRequest | undefined = await getRequestByKeyValues({
      taskId,
      type: REQUEST_TYPE.EXTENSION,
    });

    if (latestExtensionRequest && latestExtensionRequest.state === REQUEST_STATE.PENDING) {
      return res.boom.badRequest("An extension request for this task already exists.");
    }
    const requestNumber: number =
      latestExtensionRequest?.requestedBy === requestedBy && latestExtensionRequest.requestNumber
        ? latestExtensionRequest.requestNumber + 1
        : 1;
    extensionBody = { ...extensionBody, requestNumber };

    const extensionRequest = await createRequest(extensionBody);
    if ("error" in extensionRequest) {
      return res.boom.badRequest(extensionRequest.error);
    }

    const extensionLog = {
      type: REQUEST_LOG_TYPE.REQUEST_CREATED,
      meta: {
        taskId,
        requestId: extensionRequest.id,
        action: LOG_ACTION.CREATE,
        createdBy: requestedBy,
        createdAt: Date.now(),
      },
      body: extensionBody,
    };

    await addLog(extensionLog.type, extensionLog.meta, extensionLog.body);

    return res.status(201).json({
      message: "Extension Request created successfully!",
      extensionRequest: { ...extensionBody, id: extensionRequest.id },
    });
  } catch (err) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_CREATING_REQUEST);
  }
};

export const updateTaskExtensionRequest = async (req: any, res: any) => {
  const requestBody = req.body;
  const userId = req?.userData?.id;
  const requestId = req.params.id;

  if (!userId) {
    return res.boom.unauthorized();
  }

  try {
    const requestResult = await updateRequest(requestId, requestBody, userId,REQUEST_TYPE.EXTENSION)
    if ("error" in requestResult) {
      return res.boom.badRequest(requestResult.error);
    }
    const [logType, returnMessage] =
      requestResult.state === REQUEST_STATE.APPROVED
        ? [REQUEST_LOG_TYPE.REQUEST_APPROVED, REQUEST_APPROVED_SUCCESSFULLY]
        : [REQUEST_LOG_TYPE.REQUEST_REJECTED, REQUEST_REJECTED_SUCCESSFULLY];

    const requestLog = {
      type: logType,
      meta: {
        requestId: requestId,
        action: LOG_ACTION.UPDATE,
        createdBy: userId,
        createdAt: Date.now(),
      },
      body: requestResult,
    };
    await addLog(requestLog.type, requestLog.meta, requestLog.body);

    return res.status(201).json({
      message: returnMessage,
      data: {
        id: requestResult.id,
        ...requestResult,
      },
    });
  } catch (err) {
    logger.error(ERROR_WHILE_UPDATING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_UPDATING_REQUEST);
  }
};
