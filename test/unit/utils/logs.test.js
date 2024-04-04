const { expect } = require("chai");
const { formatLogsForFeed, mapify } = require("../../../utils/logs");

describe("logs utils", function () {
  describe("formatLogsForFeed", function () {
    const usersMap = {
      user1: { username: "palak-gupta" },
      user2: { username: "mock-2" },
    };

    const tasksMap = {
      task1: { title: "Link details page to status site" },
      task2: { title: "Introduce /ooo command on discord" },
    };

    it("should format logs for OOO type", function () {
      const logsSnapshot = {
        meta: {
          createdAt: 1710181066410,
          createdBy: "user1",
          requestId: "request123",
          action: "create",
        },
        type: "REQUEST_CREATED",
        body: {
          createdAt: 1710181064968,
          requestedBy: "user1",
          from: 1710288000000,
          until: 1710288050000,
          id: "NOAWuKmazlIJHaN7Pihg",
          state: "PENDING",
          type: "OOO",
          message: "For testing purpose",
          updatedAt: 1710181064968,
        },
        timestamp: {
          _seconds: 1710181066,
          _nanoseconds: 410000000,
        },
      };

      const formattedLog = formatLogsForFeed(logsSnapshot, usersMap);

      expect(formattedLog).to.deep.equal({
        user: "palak-gupta",
        requestId: "request123",
        from: 1710288000000,
        until: 1710288050000,
        message: "For testing purpose",
      });
    });

    it("should format logs for extensionRequests type", function () {
      const logsSnapshot = {
        meta: {
          extensionRequestId: "po1gNOCXUP2IFsChcmn8",
          userId: "user2",
          taskId: "task1",
          username: "techlord",
        },
        type: "extensionRequests",
        body: {
          status: "APPROVED",
        },
        timestamp: {
          _seconds: 1709316797,
          _nanoseconds: 616000000,
        },
      };

      const formattedLog = formatLogsForFeed(logsSnapshot, usersMap, tasksMap);

      expect(formattedLog).to.deep.equal({
        extensionRequestId: "po1gNOCXUP2IFsChcmn8",
        status: "APPROVED",
        taskId: "task1",
        taskTitle: "Link details page to status site",
        type: "extensionRequests",
        user: "mock-2",
        userId: "user2",
        username: "techlord",
      });
    });

    it("should return empty object when usersMap does not contain requestedBy user", function () {
      const invalidLogsSnapshot = {
        meta: { requestId: "request123", taskId: "task456" },
        body: {
          type: "OOO",
          requestedBy: 3, // User not in usersMap
          from: "2024-03-24",
          until: "2024-03-25",
          message: "Out of office",
          extensionRequestId: "extension123",
        },
      };

      const formattedLog = formatLogsForFeed(invalidLogsSnapshot, usersMap);

      expect(formattedLog).to.deep.equal({});
    });

    it("should format logs for task type", function () {
      const logsSnapshot = {
        meta: {
          userId: "user1",
          taskId: "task2",
          username: "shubham-sharma",
        },
        type: "task",
        body: {
          new: {
            percentCompleted: 40,
          },
          subType: "update",
        },
        timestamp: {
          _seconds: 1711273137,
          _nanoseconds: 96000000,
        },
      };

      const formattedLog = formatLogsForFeed(logsSnapshot, usersMap, tasksMap);

      expect(formattedLog).to.deep.equal({
        percentCompleted: 40,
        subType: "update",
        taskId: "task2",
        taskTitle: "Introduce /ooo command on discord",
        type: "task",
        user: "shubham-sharma",
        userId: "user1",
        username: "shubham-sharma",
      });
    });

    it("should format logs for PROFILE_DIFF_REJECTED type", function () {
      const logsSnapshot = {
        meta: {
          rejectedBy: "user2",
          userId: "user1",
        },
        type: "PROFILE_DIFF_REJECTED",
        body: {
          profileDiffId: "F8e0II1X7qZwzA1CbF0l",
          message: "",
        },
        timestamp: {
          _seconds: 1708098695,
          _nanoseconds: 709000000,
        },
      };

      const formattedLog = formatLogsForFeed(logsSnapshot, usersMap);

      expect(formattedLog).to.deep.equal({
        user: "palak-gupta",
        rejectedBy: "mock-2",
        message: "",
      });
    });

    it("should format logs for PROFILE_DIFF_APPROVED type", function () {
      const logsSnapshot = {
        meta: {
          approvedBy: "user1",
          userId: "user2",
        },
        type: "PROFILE_DIFF_APPROVED",
        body: {
          profileDiffId: "7sPvm4ooC1PyC91A5KVS",
          message: "",
        },
        timestamp: {
          _seconds: 1707253607,
          _nanoseconds: 697000000,
        },
      };

      const formattedLog = formatLogsForFeed(logsSnapshot, usersMap);

      expect(formattedLog).to.deep.equal({
        approvedBy: "palak-gupta",
        user: "mock-2",
        message: "",
      });
    });
  });

  describe("mapify function", function () {
    const data = [
      { username: "palak", id: "100", task: "task2" },
      { username: "mock-user-1", id: "101", task: "task23" },
      { username: "mock-user-2", id: "102", task: "task4" },
    ];

    it("mapify data based on username", function () {
      const mapifiedData = mapify(data, "username");
      expect(mapifiedData).to.deep.equal({
        "mock-user-1": {
          id: "101",
          username: "mock-user-1",
          task: "task23",
        },
        "mock-user-2": {
          id: "102",
          username: "mock-user-2",
          task: "task4",
        },
        palak: {
          id: "100",
          username: "palak",
          task: "task2",
        },
      });
    });
  });
});
