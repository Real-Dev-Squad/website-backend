import { userState } from "../constants/userStatus";

export type CurrentStatus = {
    from: number,
    until: number,
    state: userState,
    message: string,
    updatedAt: number,
};

export type UserStatus = {
    id: string,
    data: {
        currentStatus: CurrentStatus
    },
    userStatusExists: boolean
};
