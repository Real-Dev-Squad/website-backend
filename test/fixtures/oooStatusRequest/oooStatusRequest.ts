import { REQUEST_STATE } from "../../../constants/request";

export const createOooStatusRequests = {
    userId: "user123",
    from: Date.now() + 100000,
    until: Date.now() + 200000,
    message: "Out of office for personal reasons.",
    state: REQUEST_STATE.PENDING,
    createdAt: 1234567890,
    updatedAt: 1234567890,
};
export const oooStatusRequests = [
    {
        id: "MpykhM8sT1Tlid4Y6Y0d",
        userId: "user456",
        state: REQUEST_STATE.APPROVED,
        from: 1709525300000,
        until: 1709870800000,
        message: "Attending a work conference.",
        createdAt: 1709525400000,
        updatedAt: 1709827800000,
        lastUpdatedBy: "adminUser",
        reason: "Welcome back! Enjoy the conference.",
    },
    {
        id: "Me8sT1Tlid4Y6Y0d",
        userId: "user789",
        state: REQUEST_STATE.REJECTED,
        from: 1709603700000,
        until: 1709785600000,
        message: "Out of office for personal reasons.",
        createdAt: 1708763200000,
        updatedAt: 1708841500000,
        lastUpdatedBy: "adminUser",
        reason: "Sorry, we can't approve additional leave at this time.",
    },

    {
        id: "abc123",
        userId: "user101",
        state: REQUEST_STATE.PENDING,
        from: 1710000000000,
        until: 1711000000000,
        message: "Family vacation.",
        createdAt: 1709999999999,
        updatedAt: 1710000000000,
    },

    {
        id: "def456",
        userId: "user202",
        state: REQUEST_STATE.APPROVED,
        from: 1712000000000,
        until: 1713000000000,
        message: "Remote work due to personal reasons.",
        createdAt: 1711999999999,
        updatedAt: 1712000000000,
        lastUpdatedBy: "adminUser",
        reason: "Understood. Make sure to stay connected during remote work.",
    },
];

export const updateOooStatusRequest = [
    {
        state: REQUEST_STATE.APPROVED,
        lastUpdatedBy: "admin123",
        updatedAt: 1234567890,
        reason: "Approval granted.",
    },
];
