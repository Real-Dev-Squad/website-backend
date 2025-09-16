import { REQUEST_STATE, TASK_REQUEST_MESSAGES } from "../constants/requests.js";
import { TASK_REQUEST_TYPE } from "../constants/taskRequests.js";
import { addLog } from "../models/logs.js";
import { createRequest, getRequestByKeyValues } from "../models/requests.js";
import taskModel from "../models/tasks.js";
import { fetchUser } from "../models/users.js";
import { fetchIssuesById } from "../services/githubService.js";
import { CustomResponse } from "../typeDefinitions/global.js";
import { userData } from "../types/global.js";
import { TaskRequestRequest } from "../types/taskRequests.js";
import logger from "../utils/logger.js";

export const createTaskRequestController = async (req: TaskRequestRequest, res: CustomResponse) => {
  const taskRequestData = req.body;
  const requestedBy = req?.userData?.id;

  if (!requestedBy) {
    return res.boom.unauthorized();
  }

  if (req.userData.id !== taskRequestData.userId && !req.userData.roles?.super_user) {
    return res.boom.forbidden(TASK_REQUEST_MESSAGES.NOT_AUTHORIZED_TO_CREATE_REQUEST);
  }

  const userPromise: any = await fetchUser({ userId: taskRequestData.userId });
  const userData: userData = userPromise.user;
  if (!userData.id || !userData.username) {
    return res.boom.notFound(TASK_REQUEST_MESSAGES.USER_NOT_FOUND);
  }
  try {
    switch (taskRequestData.requestType) {
      case TASK_REQUEST_TYPE.ASSIGNMENT: {
        if (!req.userData.roles?.super_user) {
          return res.boom.unauthorized(TASK_REQUEST_MESSAGES.NOT_AUTHORIZED_TO_CREATE_REQUEST);
        }
        const { taskData } = await taskModel.fetchTask(taskRequestData.taskId);
        if (!taskData) {
          return res.boom.badRequest(TASK_REQUEST_MESSAGES.TASK_NOT_EXIST);
        }
        taskRequestData.taskTitle = taskData?.title;
        break;
      }
      case TASK_REQUEST_TYPE.CREATION: {
        let issueData: any;
        try {
          const url = new URL(taskRequestData.externalIssueUrl);
          const issueUrlPaths = url.pathname.split("/");
          const repositoryName = issueUrlPaths[3];
          const issueNumber = issueUrlPaths[5];
          issueData = await fetchIssuesById(repositoryName, issueNumber);
        } catch (error) {
          return res.boom.badRequest(TASK_REQUEST_MESSAGES.INVALID_EXTERNAL_ISSUE_URL);
        }
        if (!issueData) {
          return res.boom.badRequest(TASK_REQUEST_MESSAGES.ISSUE_NOT_EXIST);
        }
        taskRequestData.taskTitle = issueData?.title;
        break;
      }
    }
    const existingRequest = await getRequestByKeyValues({
      externalIssueUrl: taskRequestData.externalIssueUrl,
      requestType: taskRequestData.requestType,
    });

    if (
      existingRequest &&
      existingRequest.state === REQUEST_STATE.PENDING &&
      existingRequest.requestors.includes(requestedBy)
    ) {
      return res.boom.badRequest(TASK_REQUEST_MESSAGES.TASK_REQUEST_EXISTS);
    } else if (
      existingRequest &&
      existingRequest.state === REQUEST_STATE.PENDING &&
      !existingRequest.requestors.includes(requestedBy)
    ) {
      existingRequest.requestors.push(requestedBy);
      existingRequest.users.push({
        userId: userData.id,
        username: userData.username,
        proposedStartDate: taskRequestData.proposedStartDate,
        proposedDeadline: taskRequestData.proposedDeadline,
        description: taskRequestData.description,
        markdownEnabled: taskRequestData.markdownEnabled,
        firstName: userData.first_name,
        lastName: userData.last_name,
        state: REQUEST_STATE.PENDING,
        requestedAt: Date.now(),
      });
      const updatedRequest = await createRequest(existingRequest);
      const taskRequestLog = {
        type: "taskRequests",
        meta: {
          taskRequestId: updatedRequest.id,
          action: "update",
          userId: req.userData.id,
          createdAt: Date.now(),
          lastModifiedBy: req.userData.id,
          lastModifiedAt: Date.now(),
        },
        body: updatedRequest,
      };
      await addLog(taskRequestLog.type, taskRequestLog.meta, taskRequestLog.body);
      const data = {
        message: TASK_REQUEST_MESSAGES.TASK_REQUEST_UPDATED_SUCCESS,
        data: {
          id: updatedRequest.id,
          ...updatedRequest,
        },
      };
      return res.status(200).json(data);
    }

    taskRequestData.requestedBy = requestedBy;
    const createtaskRequestData = {
      externalIssueUrl: taskRequestData.externalIssueUrl,
      externalIssueHtmlUrl: taskRequestData.externalIssueHtmlUrl,
      requestType: taskRequestData.requestType,
      type: taskRequestData.type,
      state: REQUEST_STATE.PENDING,
      requestedBy: requestedBy,
      taskTitle: taskRequestData.taskTitle,
      users: [
        {
          userId: userData.id,
          username: userData.username,
          proposedStartDate: taskRequestData.proposedStartDate,
          proposedDeadline: taskRequestData.proposedDeadline,
          description: taskRequestData.description,
          markdownEnabled: taskRequestData.markdownEnabled,
          firstName: userData.first_name,
          lastName: userData.last_name,
          state: REQUEST_STATE.PENDING,
          requestedAt: Date.now(),
        },
      ],

      requestors: [requestedBy],
    };
    const newTaskRequest = await createRequest(createtaskRequestData);

    if (newTaskRequest.isCreationRequestApproved) {
      return res.boom.badRequest(TASK_REQUEST_MESSAGES.TASK_EXISTS_FOR_GIVEN_ISSUE);
    }
    if (newTaskRequest.alreadyRequesting) {
      return res.boom.badRequest(TASK_REQUEST_MESSAGES.TASK_ALREADY_REQUESTED);
    }

    const taskRequestLog = {
      type: "taskRequests",
      meta: {
        taskRequestId: newTaskRequest.id,
        action: "create",
        userId: req.userData.id,
        createdAt: Date.now(),
        lastModifiedBy: req.userData.id,
        lastModifiedAt: Date.now(),
      },
      body: newTaskRequest,
    };
    await addLog(taskRequestLog.type, taskRequestLog.meta, taskRequestLog.body);

    const data = {
      message: TASK_REQUEST_MESSAGES.TASK_REQUEST_CREATED_SUCCESS,
      data: {
        id: newTaskRequest.id,
        ...newTaskRequest,
      },
    };
    return res.status(201).json(data);
  } catch (err) {
    logger.error(`${TASK_REQUEST_MESSAGES.ERROR_CREATING_TASK_REQUEST} : ${err}`);
    return res.boom.serverUnavailable(TASK_REQUEST_MESSAGES.ERROR_CREATING_TASK_REQUEST);
  }
};
