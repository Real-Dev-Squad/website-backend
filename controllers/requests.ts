import { OooRequestResponse, OooRequestCreateRequest, OooRequestUpdateRequest } from "../types/oooRequest";
import { REQUEST_TYPE } from "../constants/request";
import { createOooRequestController, updateOooRequestController } from "./oooRequests";
import {  ERROR_WHILE_FETCHING_REQUEST, REQUEST_DOES_NOT_EXIST, REQUEST_FETCHED_SUCCESSFULLY } from "../constants/oooRequest";
import {  getRequests } from "../models/oooRequests";

export const createRequestController = async (
  req: OooRequestCreateRequest,
  res: OooRequestResponse
) => {
  const type = req.body.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      return await createOooRequestController(req as OooRequestCreateRequest, res as OooRequestResponse);
    default:
      return res.boom.badRequest("Invalid request type");
  }
};

export const updateRequestController = async (
  req: OooRequestUpdateRequest,
  res: OooRequestResponse
) => {
  const type = req.body.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      return await updateOooRequestController(req as OooRequestUpdateRequest, res as OooRequestResponse);
    default:
      return res.boom.badRequest("Invalid request type");
  }
};

export const getRequestsController = async (req: any, res: any) => {
  const { query } = req;
  try {
      const requests = await getRequests(query);
      if (!requests) {
          return res.boom.notFound(REQUEST_DOES_NOT_EXIST);
      }
      return res.status(200).json({
          message: REQUEST_FETCHED_SUCCESSFULLY,
          data: requests,
      });
  } catch (err) {
      logger.error(ERROR_WHILE_FETCHING_REQUEST, err);
      return res.boom.badImplementation(ERROR_WHILE_FETCHING_REQUEST);
  }
};