import { expect } from "chai";

function assertUserIds(users: any, ids: any) {
  ids.forEach((id: number | string) => {
    /* eslint-disable no-unused-expressions */
    expect(users.some((user: { id: any }) => user.id === id)).to.be.true;
  });
}
module.exports = { assertUserIds };
