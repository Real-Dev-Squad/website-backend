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
      percentCompleted: 150,
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
      percentCompleted: 150,
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
      percentCompleted: 150,
      endsOn: 1647172800,
      startedOn: 1644753600,
    },
  ];
};
