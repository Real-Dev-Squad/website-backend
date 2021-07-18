const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const cacheService = require('../../../services/cacheService')

chai.use(chaiHttp)

describe('cacheService', function () {
  it('Should put payload in cache', function (done) {
    const payload = {
      id: 1,
      username: 'john',
      firstName: 'john',
      lastName: 'doe',
      email: 'john.doe@realdevsquad.com'
    }
    const user = cacheService.set(`user:${payload.username}`, payload)
    const cachedUser = cacheService.get(`user:${payload.username}`)

    expect(user).to.have.all.keys('id', 'username', 'firstName', 'lastName', 'email')
    expect(cachedUser).to.not.equal(null)
    expect(cachedUser).to.have.all.keys('id', 'username', 'firstName', 'lastName', 'email')
    expect(cachedUser).to.deep.equal(payload)
    return done()
  })
})
