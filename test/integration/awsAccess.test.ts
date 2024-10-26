import chai, {expect} from "chai";
import sinon from 'sinon';
import chaiHttp from 'chai-http';
const app = require("../../server");

const userQuery = require("../../models/users");
const authorizeBot = require("../../middlewares/authorizeBot")
import * as dataAccess from '../../services/dataAccessLayer'
import { addUserToGroupController } from '../../controllers/awsAccess';
import * as awsFunctions from '../../utils/awsFunctions';
import { PROFILE_SVC_GITHUB_URL } from '../../constants/urls';
const { ROLE_LEVEL, KEYS_NOT_ALLOWED, ACCESS_LEVEL } = require("../../constants/userDataLevels");

chai.use(chaiHttp);

describe('AWS Group Controller Integration Tests', () => {
    let retrieveUsersStub: sinon.SinonStub;
    let fetchAwsUserIdByUsernameStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;
    let addUserToGroupStub: sinon.SinonStub;
    let verifyTokenStub: sinon.SinonStub;
  
  beforeEach(() => {
    fetchAwsUserIdByUsernameStub = sinon.stub(awsFunctions, "fetchAwsUserIdByUsername");
    createUserStub = sinon.stub(awsFunctions, "createUser");
    addUserToGroupStub = sinon.stub(awsFunctions, "addUserToGroup");
    retrieveUsersStub = sinon.stub(dataAccess, "retrieveUsers");
    verifyTokenStub = sinon.stub(authorizeBot, "verifyDiscordBot");
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  const mockValidUser = {
    user: {
      username: 'testuser',
      email: 'test@example.com',
      discordId: '123456'
    }
  };
  const mockUser = {
    user: {
      id: "user-id-1",
      username: "testuser",
      email: "test@example.com",
      discordId: "123456"
    }
  };

  const mockRequest = {
    groupId: 'group-123',
    userId: '123456'
  };
  
  it("should return 400 if the user is not found", async () => {
    retrieveUsersStub.resolves(null);

    const res = await chai.request(app)
        .post("/aws-access")
        .send({ groupId: "test-group", userId: "test-user" });

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ error: "User not found" });
    });
});

//   describe('POST /aws-access', () => {
//     it("should reject requests without authorization header", async function(done) {
//         chai
//           .request(app)
//           .post("/aws-access")
//           .send({
//             groupId: "test-group-id",
//             userId: "test-discord-id"
//           })
//           .end((err, res) => {
//             if (err){
//                 return done(err);
//             }
//             expect(res).to.have.status(400);
//             expect(res.body.error).to.equal("Invalid Request");
//             return done();
//           });
//       });

    // it('should successfully create and add new user to AWS group', function(done) {
    //     userQueryStub.withArgs({ discordId: "test-discord-id" }).resolves(mockUser);
        
    //     // mock aws functions
    //     fetchAwsUserStub.resolves(null);
    //     createUserStub.resolves({ UserId: "new-aws-user-id" });
    //     addUserToGroupStub.resolves({ success: true });
        
    //     chai
    //     .request(app)
    //     .post("/aws-access")
    //     .set('Authorization', 'Bearer test-discord-bot-token')
    //     .send(mockRequest)
    //     .end((error, response) => {
    //         if (error){
    //             return done(error);
    //         }
    //         console.log("The response is", response);
    //         expect(response).to.have.status(200);
    //         expect(response.body).should.be.an('object');
    //         expect(response.body).should.have.property('message').equal(`User ${mockRequest.userId} successfully added to group ${mockRequest.groupId}.`);
    //         expect(createUserStub.calledOnce).to.be.true;
    //         expect(addUserToGroupStub.calledOnce).to.be.true;
            
    //         return done();
    //     });
    // });

        

//     it('should add existing AWS user to group without creating new user', async () => {
//       // Setup stubs
//       dataAccessStub.resolves(mockValidUser);
//       fetchAwsUserStub.resolves('existing-aws-user-123');
//       addUserToGroupStub.resolves({ success: true });

//       const response = await request(app)
//         .post('/aws-access')
//         .send(mockRequest);

//       // Assertions
//       expect(response.status).to.equal(200);
//       expect(response.body.message).to.equal(
//         `User ${mockRequest.userId} successfully added to group ${mockRequest.groupId}.`
//       );

//       // Verify createUser was not called
//       expect(createUserStub.called).to.be.false;
//       expect(addUserToGroupStub.calledWith(
//         mockRequest.groupId,
//         'existing-aws-user-123'
//       )).to.be.true;
//     });

//     it('should handle case when user is already in group', async () => {
//       // Setup stubs
//       dataAccessStub.resolves(mockValidUser);
//       fetchAwsUserStub.resolves('existing-aws-user-123');
//       addUserToGroupStub.resolves({ conflict: true });

//       const response = await request(app)
//         .post('/aws-access')
//         .send(mockRequest);

//       // Assertions
//       expect(response.status).to.equal(200);
//       expect(response.body.message).to.equal(
//         `User ${mockRequest.userId} is already part of the AWS group, please try signing in.`
//       );
//     });

//     it('should return 404 when user is not found', async () => {
//       // Setup stubs
//       dataAccessStub.resolves(null);

//       const response = await request(app)
//         .post('/aws-access')
//         .send(mockRequest);

//       // Assertions
//       expect(response.status).to.equal(404);
//       expect(response.body.error).to.equal('User not found');

//       // Verify AWS functions were not called
//       expect(fetchAwsUserStub.called).to.be.false;
//       expect(createUserStub.called).to.be.false;
//       expect(addUserToGroupStub.called).to.be.false;
//     });

//     it('should return 400 when user has no email', async () => {
//       // Setup user without email
//       const userWithoutEmail = {
//         user: {
//           username: 'testuser',
//           discordId: '123456'
//         }
//       };

//       dataAccessStub.resolves(userWithoutEmail);

//       const response = await request(app)
//         .post('/aws-access')
//         .send(mockRequest);

//       // Assertions
//       expect(response.status).to.equal(400);
//       expect(response.body.error).to.equal(
//         `User email is required to create an AWS user. Please update your email by setting up Profile service, url : ${PROFILE_SVC_GITHUB_URL}`
//       );

//       // Verify AWS functions were not called
//       expect(fetchAwsUserStub.called).to.be.false;
//       expect(createUserStub.called).to.be.false;
//       expect(addUserToGroupStub.called).to.be.false;
//     });

//     it('should handle AWS errors gracefully', async () => {
//       // Setup stubs
//       dataAccessStub.resolves(mockValidUser);
//       fetchAwsUserStub.rejects(new Error('AWS Connection Error'));

//       const response = await request(app)
//         .post('/aws-access')
//         .send(mockRequest);

//       // Assertions
//       expect(response.status).to.equal(500);
//       expect(response.body.error).to.exist;
//     });

//     it('should handle invalid request body', async () => {
//       const response = await request(app)
//         .post('/aws-access')
//         .send({});  // Empty request body

//       expect(response.status).to.equal(400);
//       expect(response.body.error).to.exist;
//     });

//     it('should handle network timeout errors', async () => {
//       // Setup timeout simulation
//       dataAccessStub.resolves(mockValidUser);
//       fetchAwsUserStub.rejects(new Error('Network timeout'));

//       const response = await request(app)
//         .post('/aws-access')
//         .send(mockRequest);

//       expect(response.status).to.equal(500);
//       expect(response.body.error).to.include('Network timeout');
//     });
//   });
