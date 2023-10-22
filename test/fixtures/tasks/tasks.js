const { DINERO, NEELAM } = require("../../../constants/wallets");
const userData = require("../fixtures/../user/user")();
const adminuser = userData[3];
/**
 * Sample tasks for tests
 * @return  {object}
 */

module.exports = () => {
  return [
    {
      title: "Overdue task 1",
      purpose: "testing for tasks tests",
      type: "feature",
      assignee: "akshay",
      createdBy: "ankush",
      status: "IN_PROGRESS",
      percentCompleted: 50,
      endsOn: 1647172800, // 13 march
      startedOn: 1644753600, //  13 feb
    },
    {
      title: "Overdue task 2",
      purpose: "testing for tasks tests",
      type: "feature",
      assignee: "ankur",
      createdBy: "ankush",
      status: "ASSIGNED",
      percentCompleted: 50,
      endsOn: 1647172800, // 13 march
      startedOn: 1644753600, //  13 feb
    },
    {
      title: "Testing purpose",
      purpose: "testing for tasks tests",
      type: "feature",
      assignee: "ankur",
      createdBy: "ankush",
      status: "BLOCKED",
      percentCompleted: 50,
      endsOn: 1647172800,
      startedOn: 1644753600,
    },
    {
      title: "check is task form is working",
      purpose: "test",
      type: "feature",
      assignee: adminuser.username,
      createdBy: "nikhil",
      status: "AVAILABLE",
      percentCompleted: 50,
      endsOn: 1650032259,
      startedOn: 1644753600,
    },
    {
      title: "Test task",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "AVAILABLE",
      percentCompleted: 0,
      category: "FRONTEND",
      level: 3,
      participants: [],
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      priority: "HIGH",
      isNoteworthy: true,
      assignee: false,
    },
    {
      title: "Test task-dependency",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "AVAILABLE",
      percentCompleted: 100,
      participants: [],
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: true,
      assignee: false,
    },
    {
      id: "P86Y1hVrS0zR5ZcVPwLZ",
      percentCompleted: 80,
      endsOn: 1695200648,
      isNoteworthy: false,
      createdBy: "sahsi",
      lossRate: {
        dinero: 100,
        neelam: 0,
      },
      assignee: "narendra",
      type: "feature",
      priority: "HIGH",
      completionAward: {
        dinero: 1000,
        neelam: 0,
      },
      title: "Implement user authentication and authorization",
      status: "IN_PROGRESS",
      assigneeId: "WbceXEPcohuJ5IxHHecf",
      dependsOn: [],
    },
  ];
};
