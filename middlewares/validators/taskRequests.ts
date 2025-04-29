import joi from "joi";
import { TaskRequestResponse, TaskRequestRequest } from "../../types/taskRequests";
import { NextFunction } from "express";
import { REQUEST_TYPE, REQUEST_STATUS } from "../../constants/requests";
import { GITHUB_URL } from "../../constants/urls";

import config from "config";
import { TASK_REQUEST_TYPE } from "../../constants/taskRequests";
const githubOrg = config.get("githubApi.org");
const githubBaseUrl = config.get("githubApi.baseUrl");
const githubIssuerUrlPattern = new RegExp(`^${githubBaseUrl}/repos/${githubOrg}/.+/issues/\\d+$`);
const githubIssueHtmlUrlPattern = new RegExp(`^${GITHUB_URL}/${githubOrg}/.+/issues/\\d+$`); // Example: https://github.com/Real-Dev-Squad/website-status/issues/1050

export const createTaskRequestValidator = async (
    req: TaskRequestRequest,
    res: TaskRequestResponse,
    next: NextFunction
) => {
    const schema = joi
        .object()
        .strict()
        .keys({
            requestType: joi.string().valid(TASK_REQUEST_TYPE.CREATION, TASK_REQUEST_TYPE.ASSIGNMENT).required().messages({
                "string.empty": "requestType cannot be empty",
                "any.required": "requestType is required",
            }),
            externalIssueUrl: joi.string().required().regex(githubIssuerUrlPattern).required().messages({
                "string.empty": "externalIssueUrl cannot be empty",
                "any.required": "externalIssueUrl is required",
            }),
            externalIssueHtmlUrl: joi.string().required().regex(githubIssueHtmlUrlPattern).messages({
                "string.empty": "externalIssueHtmlUrl cannot be empty",
                "any.required": "externalIssueHtmlUrl is required",
            }),
            type: joi.string().valid(REQUEST_TYPE.TASK).required().messages({
                "string.empty": "type cannot be empty",
                "any.required": "type is required",
            }),
            state: joi.string().valid(REQUEST_STATUS.PENDING).required().messages({
                "string.empty": "state cannot be empty",
                "any.required": "state is required",
            }),
            proposedStartDate: joi.number().required().messages({
                "number.base": "proposedStartDate must be a number",
                "any.required": "proposedStartDate is required",
            }),
            proposedDeadline: joi.number().required().greater(joi.ref("proposedStartDate")).
            messages({
                "number.base": "proposedDeadline must be a number",
                "any.required": "proposedDeadline is required",
            }),
            description: joi.string().optional().messages({
                "string.empty": "description cannot be empty",
            }),
            markdownEnabled: joi.boolean().optional().messages({
                "boolean.base": "markdownEnabled must be a boolean",
            }),
            taskId: joi.when('requestType', {
                is: TASK_REQUEST_TYPE.ASSIGNMENT,
                then: joi.string().required().messages({
                    "string.empty": "taskId cannot be empty",
                    "any.required": "taskId is required when requestType is ASSIGNMENT",
                }),
                otherwise: joi.forbidden()
            }),
            userId: joi.when('requestType', {
                is: TASK_REQUEST_TYPE.CREATION,
                then: joi.string().required().messages({
                    "string.empty": "userId cannot be empty",
                    "any.required": "userId is required when requestType is CREATION",
                }),
                otherwise: joi.forbidden()
            }),
        });
    await schema.validateAsync(req.body, { abortEarly: false });
};
