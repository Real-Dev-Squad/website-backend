import { OooStatusRequest } from "../types/oooRequest";

/**
 * @description Map the OOO response data to the desired format
 * @param data - The OOO response data in the new format
 * @returns The mapped OOO response data in the old format
 */
export const mapOOOResponseData = (data: OooStatusRequest[]) => {
  return data.map((item) => ({
    id: item.id,
    from: item.from,
    until: item.until,
    type: item.type,
    message: item.reason,
    state: item.status,
    reason: item.reason,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    requestedBy: item.userId,
    lastModifiedBy: item.lastModifiedBy,
  }));
};