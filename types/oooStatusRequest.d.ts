import {REQUEST_STATE} from "../constants/request";
import {userState} from "../constants/userStatus";

export type OooStatusRequest = {
    userId: string;
    from: number;
    until?: number;
    message?: string;
    status: userState;
    state?: REQUEST_STATE;
    processedBy?: string;
    createdAt?: admin.firestore.Timestamp;
    updatedAt?: admin.firestore.Timestamp;
    reason?: string;
    };

export type OooStatusRequestResponse = Response & { boom: Boom };
export type OooStatusRequestRequest = Request & { OooStatusRequest };
