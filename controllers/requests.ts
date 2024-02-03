import { OooRequestResponse, OooRequestCreateRequest } from "../types/oooRequest";
import { REQUEST_TYPE } from "../constants/request";
import { createOooRequestController } from "./oooRequests";

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