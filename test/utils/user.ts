const { expect } = chai;

function assertUserIds(users:any, ids:any) {
  ids.forEach((id:any) => {
    /* eslint-disable no-unused-expressions */
    expect(users.some((user:any) => user.id === id)).to.be.true;
  });
}
module.exports = { assertUserIds };
