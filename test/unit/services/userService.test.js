const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const userService = require('../../../services/userService')

chai.use(chaiHttp)

describe('userService', function () {
  it('Should cache given user data', function (done) {
    const userData = {
      id: 1,
      github_id: 'johnGit',
      username: 'john',
      firstName: 'john',
      lastName: 'doe',
      email: 'john.doe@realdevsquad.com'
    }

    const cacheUserResult = userService.cacheUser(userData)
    // eslint-disable-next-line no-unused-expressions
    expect(cacheUserResult).to.be.true

    userService.getGitHubUsername(userData.username)
      .then((gitHubUsername) => {
        expect(gitHubUsername).to.equal(userData.github_id)
      })
    return done()
  })
})
