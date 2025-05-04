import { ERROR_WHILE_FETCHING_REQUEST } from "../constants/requests";
import { fetchUser } from "../models/users";
import { userData } from "../types/global";
import { OldOooRequest, OooStatusRequest } from "../types/oooRequest";

/**
 * Calculates the new deadline based on the current date, the old end date, and the additional duration in milliseconds.
 *
 * @param {number} currentDate - The current date as a timestamp in milliseconds.
 * @param {number} oldEndsOn - The previous end date as a timestamp in milliseconds.
 * @param {number} numberOfDaysInMillisecond - The duration to extend the deadline, in milliseconds.
 * @returns {number} The new deadline as a timestamp in milliseconds.
*/
export const getNewDeadline = (currentDate: number, oldEndsOn: number, numberOfDaysInMillisecond: number): number => {
    if (currentDate > oldEndsOn) {
        return currentDate + numberOfDaysInMillisecond;
    }
    return oldEndsOn + numberOfDaysInMillisecond;
};

/**
 * Converts a date string into a timestamp in milliseconds.
 * Validates whether the provided string is a valid date format.
 *
 * @param {string} date - The date string to convert (e.g., "2024-10-17T16:10:52.668Z").
 * @returns {{ isDate: boolean, milliseconds?: number }} An object indicating validity and the timestamp if valid.
 */
export const convertDateStringToMilliseconds = (date: string): { isDate: boolean; milliseconds?: number; } => {
    const milliseconds = Date.parse(date);
    if (!milliseconds) {
        return {
            isDate: false,
        };
    }
    return {
        isDate: true,
        milliseconds,
    };
};

export const transformGetOooRequest = async (dev, allRequests) => {
    const oooRequests = [];

    if (dev) {
        for (const request of allRequests) {
            if (request.status) {
                const modifiedRequest: OldOooRequest = {
                    id: request.id,
                    type: request.type,
                    from: request.from,
                    until: request.until,
                    message: request.reason,
                    state: request.status,
                    lastModifiedBy: request.lastModifiedBy ?? "",
                    requestedBy: request.userId,
                    reason: request.comment ?? "",
                    createdAt: request.createdAt,
                    updatedAt: request.updatedAt
                };
                oooRequests.push(modifiedRequest);
            } else {
                oooRequests.push(request);
            }
        }
    } else {
        for (const request of allRequests) {
            if (request.state) {
                try {
                    const userResponse: any = await fetchUser({ userId: request.requestedBy });
                    const username = userResponse.user.username;

                    const modifiedRequest: OooStatusRequest = {
                        id: request.id,
                        type: request.type,
                        from: request.from,
                        until: request.until,
                        reason: request.message,
                        status: request.state,
                        lastModifiedBy: request.lastModifiedBy ?? null,
                        requestedBy: username,
                        comment: request.reason ?? null,
                        createdAt: request.createdAt,
                        updatedAt: request.updatedAt,
                        userId: request.requestedBy
                    };

                    oooRequests.push(modifiedRequest);
                } catch (error) {
                    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
                    throw error;
                }
            } else {
                oooRequests.push(request);
            }
        }
    }

    return oooRequests;
};