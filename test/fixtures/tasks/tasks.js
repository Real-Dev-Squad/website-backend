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
      assignee: "sagar",
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
      assignee: "sagar",
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
      assignee: "sagar",
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
      assignee: "nikhil",
      createdBy: "nikhil",
      status: "AVAILABLE",
      percentCompleted: 50,
      endsOn: 1650032259,
      startedOn: 1644753600,
    },
  ];
};
