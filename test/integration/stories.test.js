const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const stories = require('../../models/stories')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const config = require('config')
const cookieName = config.get('userToken.cookieName')
const userData = require('../fixtures/user/user')()
const cleanDb = require('../utils/cleanDb')

chai.use(chaiHttp)

const appOwner = userData[3]
const userToBeFeatureOwner = userData[0]
const userToBeBackendEngineer = userData[1]
const userToBeFrontendEngineer = userData[1]

let jwt

describe('Stories', function () {
  let storyId1, storyId

  before(async function () {
    const userId = await addUser(appOwner)
    jwt = authService.generateAuthToken({ userId })

    const storyData = [{
      title: 'Test story',
      description: 'Test active story',
      status: 'active',
      tasks: ['12ab'],
      featureOwner: userToBeFeatureOwner.username,
      backendEngineer: userToBeBackendEngineer.username,
      frontendEngineer: userToBeFrontendEngineer.username,
      startedOn: 4567,
      endsOn: 1234
    }, {
      title: 'Test story',
      description: 'Test completed story',
      status: 'completed',
      tasks: ['34ab'],
      featureOwner: userToBeFeatureOwner.username,
      backendEngineer: userToBeBackendEngineer.username,
      frontendEngineer: userToBeFrontendEngineer.username,
      startedOn: 4567,
      endsOn: 1234
    }]
    await addUser(userToBeFeatureOwner)
    await addUser(userToBeBackendEngineer)
    await addUser(userToBeFrontendEngineer)
    // Add the active story
    storyId = (await stories.addOrUpdateStory(storyData[0])).storyId
    storyId1 = storyId

    // Add the completed story
    storyId = (await stories.addOrUpdateStory(storyData[1])).storyId
  })

  after(async function () {
    await cleanDb()
  })

  describe('POST /story - creates a new story', function () {
    it('Should return success response after adding the story', function (done) {
      chai
        .request(app)
        .post('/story')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'Test story',
          description: 'Test active story',
          status: 'active',
          tasks: ['12ab'],
          featureOwner: userToBeFeatureOwner.username,
          backendEngineer: userToBeBackendEngineer.username,
          frontendEngineer: userToBeFrontendEngineer.username,
          startedOn: 4567,
          endsOn: 1234
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Story created successfully!')
          expect(res.body.id).to.be.a('string')
          expect(res.body.story).to.be.a('object')
          expect(res.body.story.featureOwner).to.equal(userToBeFeatureOwner.username)
          expect(res.body.story.backendEngineer).to.equal(userToBeBackendEngineer.username)
          expect(res.body.story.frontendEngineer).to.equal(userToBeFrontendEngineer.username)
          expect(res.body.story.tasks).to.be.a('array')
          return done()
        })
    })
  })

  describe('GET /story', function () {
    it('Should get all the list of stories', function (done) {
      chai
        .request(app)
        .get('/story')
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Stories returned successfully!')
          expect(res.body.stories).to.be.a('array')

          return done()
        })
    })
  })

  describe('PATCH /story', function () {
    it('Should update the story for the given storyId', function (done) {
      chai
        .request(app)
        .patch('/story/' + storyId1)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'Test update story title'
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(204)

          return done()
        })
    })

    it('Should return 404 if story does not exist', function (done) {
      chai
        .request(app)
        .patch('/story/storyId')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'Test update story title'
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Story not found')

          return done()
        })
    })
  })
})
