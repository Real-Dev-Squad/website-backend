export type CurrentStatus = {
    from: number,
    until: number,
    state: string,
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
