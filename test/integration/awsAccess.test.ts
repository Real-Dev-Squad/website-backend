import chai, {expect} from "chai";
import sinon from 'sinon';
import chaiHttp from 'chai-http';
import { addUserToGroupController } from '../../controllers/awsAccess';
import * as awsFunctions from '../../utils/awsFunctions';
import { PROFILE_SVC_GITHUB_URL } from '../../constants/urls';

const app = require("../../server");
const userData = require("../fixtures/user/user")();
// import { verifyDiscordBot } from "../../middlewares/authorizeBot";
const authorizeBot = require("../../middlewares/authorizeBot");
const dataAccess = require("../../services/dataAccessLayer");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const { ROLE_LEVEL, KEYS_NOT_ALLOWED, ACCESS_LEVEL } = require("../../constants/userDataLevels");
const { CLOUDFLARE_WORKER } = require("../../constants/bot")


chai.use(chaiHttp);

describe('addUserToGroupController', function(){


  beforeEach(() => {

  })
  
  afterEach(() => {
    sinon.restore();
    cleanDb();
  });
  /**
   * How can I stub the verify discord token
   * 
   */

  it('should return 400 when user email is missing',async function() {
    await addUser(userData[20]);

    sinon.stub(authorizeBot, "verifyDiscordBot").resolves({ name: CLOUDFLARE_WORKER });
    // sinon.stub(awsFunctions, "createUser").resolves({ UserId: "new-aws-user-id" });
    // sinon.stub(awsFunctions, "addUserToGroup").resolves({ conflict: false });

    const res = await chai
      .request(app)
      .post('/aws-access')
      .set('Authorization', 'Bearer valid-bot-token')
      .send({
        groupId: 'test-group-id',
        userId: '30030'
      })
    expect(res.status).to.be.equal(400);
    expect(res.body).to.have.property('error')
        .that.equals(`User email is required to create an AWS user. Please update your email by setting up Profile service, url : ${PROFILE_SVC_GITHUB_URL}`);
  });
  
  it ("Should return 404 if the user given discord Id is not found", async function(){
    await addUser(userData[20]);

    const res = await chai
      .request(app)
      .post('/aws-access')
      .set('Authorization', 'Bearer valid-bot-token')
      .send({
        groupId: 'test-group-id',
        userId: '293809230'
      })
      console.log("response body ", res.body);
      expect(res.status).to.be.equal(404);
      expect(res.body).to.have.property('error')
          .that.equals(`User not found`);
  });


  // it ("Should throw an error if the token is invalid"){

  // }
  // it ("Should create user and add to group, if the user is not present in AWS already"){

  // }
  // it ("Should add the user to the group if the user is already part of AWS account"){

  // }
  // it ("Should return the signin URL if the user is already added to the group"){

  // }
  // it ("Should return error if something fails in between of the interaction with AWS APIs"){

  // }
});
//   it('should return 400 when user email is missing', async () => {
//     const userInfoData = await dataAccess.retrieveUsers({ discordId: userId, level: userDataLevels.ACCESS_LEVEL.INTERNAL, role: 'cloudfare_worker'});

//     await addUserToGroupController(req, res);

//     expect(res.status.calledWith(400)).to.be.true;
//     expect(res.json.calledWith({
//       error: `User email is required to create an AWS user. Please update your email by setting up Profile service, url : ${PROFILE_SVC_GITHUB_URL}`,
//     })).to.be.true;
//   });

//   it('should create a new AWS user when AWS user is not found', async () => {
//     // sinon.stub(dataAccess, 'retrieveUsers').resolves({
//     //   user: { username: 'test-username', email: 'test@example.com' },
//     // });

//     sinon.stub(awsFunctions, 'fetchAwsUserIdByUsername').resolves(null);
//     sinon.stub(awsFunctions, 'createUser').resolves({ UserId: 'new-aws-user-id' });
//     sinon.stub(awsFunctions, 'addUserToGroup').resolves({ conflict: false });

//     chai
//     .request(app)
//     .post("/aws-access")
//     .set('Authorization', 'Bearer valid-bot-token');

//     // expect(awsFunctions.createUser.calledOnceWith('test-username', 'test@example.com')).to.be.true;
//     // console.log(`The res is ${res.status} and json is ${res.json()}`);
//     expect(res).to.have.status(200);
//     expect(res.body.message).to.be.equal('User test-user-id successfully added to group test-group-id.');
//   });

//   it('should return conflict message if user is already part of the AWS group', async () => {
//     // sinon.stub(dataAccess, 'retrieveUsers').resolves({
//     //   user: { username: 'test-username', email: 'test@example.com' },
//     // });

//     sinon.stub(awsFunctions, 'fetchAwsUserIdByUsername').resolves('existing-aws-user-id');
//     sinon.stub(awsFunctions, 'addUserToGroup').resolves({ conflict: true });

//     await addUserToGroupController(req, res);

//     // expect(awsFunctions.addUserToGroup.calledOnceWith('test-group-id', 'existing-aws-user-id')).to.be.true;
//     expect(res.status.calledWith(200)).to.be.true;
//     expect(res.json.calledWith({
//       message: `User test-user-id is already part of the AWS group, please try signing in.`,
//     })).to.be.true;
//   });

//   it('should handle errors correctly and log them', async () => {
//     const error = new Error('Test Error');
//     // sinon.stub(dataAccess, 'retrieveUsers').resolves({
//     //   user: { username: 'test-username', email: 'test@example.com' },
//     // });

//     sinon.stub(awsFunctions, 'fetchAwsUserIdByUsername').throws(error);
//     const loggerStub = sinon.stub(console, 'error');

//     try {
//       await addUserToGroupController(req, res);
//     } catch (err) {
//       expect(loggerStub.calledWith(`Error in adding user - test-user-id to AWS group - test-group-id error - ${error}`)).to.be.true;
//     }
//   });

// });

// describe('verifyDiscordBot Middleware', () => {
//   let verifyTokenStub;

//   beforeEach(() => {
//     // Stub the botVerification.verifyToken method
//     verifyTokenStub = sinon.stub(verifyDiscordBot, 'verifyToken');
//   });

//   afterEach(() => {
//     sinon.restore();
//   });

//   it('should allow access when a valid bot token is provided', function(done) {
//     // Mock verifyToken to return expected data
//     verifyTokenStub.resolves({ name: CLOUDFLARE_WORKER });

//     chai
//       .request(app)
//       .post('/aws-access')
//       .set('Authorization', 'Bearer valid-bot-token')
//       .end((err, res) => {
//         if (err){
//           return done(err);
//         }
//         expect(verifyTokenStub.calledOnceWith('valid-bot-token')).to.be.true;
//         expect(res).to.have.status(200);
//         return done();
//       });
//     });

//   it('should return 401 when an invalid bot token is provided', function(done) {
//     // Mock verifyToken to throw an invalid token error
//     verifyTokenStub.throws(new Error('invalid token'));

//     chai
//       .request(app)
//       .post('/aws-access')
//       .end((err, res) => {
//         if (err){
//           return done(err);
//         }
//         expect(verifyTokenStub.calledOnceWith('invalid-bot-token')).to.be.true;
//         expect(res).to.have.status(401);
//         expect(res.body).to.deep.equal({ message: 'Unauthorized Bot' });
//         return done();
//       })
//   });
// })