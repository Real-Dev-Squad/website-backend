const GET_OR_CREATE_GOAL_USER = {
  status: 201,
  json: () =>
    Promise.resolve({
      id: "123456",
      data: { attributes: { rds_id: "134556", token: "WHhHhWHu9ijHjkKhdbvFFhbnhCj" } },
    }),
};
export default { GET_OR_CREATE_GOAL_USER };
