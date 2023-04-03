const chai = require("chai");
const { expect } = chai;

function assertUserIds(users, ids) {
  ids.forEach((id) => {
    /* eslint-disable no-unused-expressions */
    expect(users.some((user) => user.id === id)).to.be.true;
  });
}
module.exports = { assertUserIds };
