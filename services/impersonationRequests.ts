import { ERROR_WHILE_CREATING_REQUEST, LOG_ACTION, REQUEST_ALREADY_APPROVED, REQUEST_ALREADY_REJECTED, REQUEST_APPROVED_SUCCESSFULLY, REQUEST_DOES_NOT_EXIST, REQUEST_LOG_TYPE, REQUEST_REJECTED_SUCCESSFULLY, REQUEST_STATE, TASK_REQUEST_MESSAGES, UNAUTHORIZED_TO_UPDATE_REQUEST } from "../constants/requests";
import { getImpersonationRequestById, updateImpersonationRequest } from "../models/impersonationRequests";
import { addLog } from "./logService";
import { NotFound, Forbidden } from "http-errors";
import {  UpdateImpersonationRequestModelDto, UpdateImpersonationStatusModelResponse } from "../types/impersonationRequest";
const logger = require("../utils/logger");


export const validateUpdateImpersonationRequestService = async(
  requestId:string,
  lastModifiedBy:string
)=>{
    try{
      const request=await getImpersonationRequestById(requestId);
      if(!request){
       throw new NotFound(REQUEST_DOES_NOT_EXIST)
      }

      if(request.status === REQUEST_STATE.APPROVED){
       throw new Forbidden(REQUEST_ALREADY_APPROVED)
      }

      if(request.status === REQUEST_STATE.REJECTED){
        throw new Forbidden(REQUEST_ALREADY_REJECTED)
      }

      if(request.impersonatedUserId!== lastModifiedBy){
       throw new Forbidden(UNAUTHORIZED_TO_UPDATE_REQUEST)
      }
    }catch(error){
        logger.error("Error while validating update request", error);
        throw error;
    }
  }


  export const updateImpersonationRequestServie = async(body: UpdateImpersonationRequestModelDto)=>{
    try{
    const updatedRequest=await updateImpersonationRequest(body) as UpdateImpersonationStatusModelResponse;
      
      
    const [logType, returnMessage] = updatedRequest.status === REQUEST_STATE.APPROVED 
                  ? [REQUEST_LOG_TYPE.REQUEST_APPROVED, REQUEST_APPROVED_SUCCESSFULLY]
                  : [REQUEST_LOG_TYPE.REQUEST_REJECTED, REQUEST_REJECTED_SUCCESSFULLY];
      
    const requestLog = {
      type: logType,
      meta: {
        requestId: body.id,
        action: LOG_ACTION.UPDATE,
        createdBy: body.lastModifiedBy,
            },
      body: updatedRequest,
      };
      
   await addLog(requestLog.type, requestLog.meta, requestLog.body);
   const response = {
    returnMessage,
    updatedRequest
   }
   return response;
  }catch(error){
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
  }