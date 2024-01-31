import { OooStatusRequestResponse, OooStatusRequestRequest } from "../types/oooRequest";
import { REQUEST_TYPE } from "../constants/request";
import { createOooRequestController } from "./oooRequests";

export const createRequestController = async (
  req: OooStatusRequestRequest,
  res: OooStatusRequestResponse
) => {
  const type = req.body.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      return await createOooRequestController(req as OooStatusRequestRequest, res as OooStatusRequestResponse);
    default:
      return res.boom.badRequest("Invalid request type");
  }
};