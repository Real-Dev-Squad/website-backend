const { DINERO, NEELAM } = require("../../../constants/wallets");
const userData = require("../user/user")();
const appOwner = userData[3];
/**
 * Sample tasks for tests
 * @return  {object}
 */

module.exports = () => {
  return [
    {
      title: "Test task",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "DONE",
      percentCompleted: 100,
      participants: [],
      assignee: appOwner.username,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: true,
    },
    {
      title: "Test task",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "IN_PROGRESS",
      percentCompleted: 100,
      participants: [],
      assignee: appOwner.username,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: true,
    },
    {
      title: "Test task",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "BLOCKED",
      percentCompleted: 100,
      participants: [],
      assignee: appOwner.username,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: true,
    },
    {
      title: "Test task",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "IN_REVIEW",
      percentCompleted: 100,
      participants: [],
      assignee: appOwner.username,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: true,
    },
  ];
};
