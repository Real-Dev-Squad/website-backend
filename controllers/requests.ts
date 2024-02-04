import { OooRequestResponse, OooRequestCreateRequest, OooRequestUpdateRequest } from "../types/oooRequest";
import { REQUEST_TYPE } from "../constants/request";
import { createOooRequestController, updateOooRequestController, getOooRequestsController } from "./oooRequests";

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
  const type = req.query.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      const ooRequestData = await getOooRequestsController(req, res);
      return res.status(200).json({
        message: "OOO Request fetched successfully",
        data: ooRequestData,
      });
    default:
      const oooRequestData = await getOooRequestsController(req, res);
      return res.status(200).json({
        message: "Request fetched successfully",
        data: oooRequestData,
      });
  }
};