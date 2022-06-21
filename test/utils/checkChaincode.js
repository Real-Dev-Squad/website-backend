const users = require("../../models/users");
module.exports = async (chaincode, userId) => {
  const data = await users.fetchUser({ userId });
  return data.user.chaincode === chaincode;
};
