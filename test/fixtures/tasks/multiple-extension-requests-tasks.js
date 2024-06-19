const userData = require("../../fixtures/user/user")();
const { DINERO, NEELAM } = require("../../../constants/wallets");
const user = userData[5];
const appOwner = userData[3];
module.exports = () => {
  return [
    {
      title: "Test task 1",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "active",
      percentCompleted: 10,
      assignee: user.username,
      isNoteworthy: true,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
    },
    {
      title: "Test task 2",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "active",
      percentCompleted: 10,
      assignee: user.username,
      isNoteworthy: true,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
    },
    {
      title: "Test task 3",
      purpose: "To Test mocha",
      featureUrl: "<testUrl>",
      type: "group",
      links: ["test1"],
      endsOn: 1234,
      startedOn: 54321,
      status: "active",
      percentCompleted: 10,
      dependsOn: ["d12", "d23"],
      isNoteworthy: false,
      assignee: appOwner.username,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
    },
    {
      title: "Test task 4",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "active",
      percentCompleted: 10,
      assignee: appOwner.username,
      isNoteworthy: true,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
    },
  ];
};
