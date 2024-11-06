import chai, {expect} from "chai";
import sinon from 'sinon';
import chaiHttp from 'chai-http';
import * as awsFunctions from '../../utils/awsFunctions';
import bot from "../utils/generateBotToken";
import { PROFILE_SVC_GITHUB_URL } from '../../constants/urls';

const app = require("../../server");
const userData = require("../fixtures/user/user")();
const authorizeBot = require("../../middlewares/authorizeBot");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const { CLOUDFLARE_WORKER } = require("../../constants/bot")


chai.use(chaiHttp);

describe('addUserToAWSGroup', function(){
  let req: any;
  beforeEach(() => {
    req = {
      headers: {},
    };
    const jwtToken = bot.generateToken({ name: CLOUDFLARE_WORKER });
    req.headers.authorization = `Bearer ${jwtToken}`;
  })
  afterEach(() => {
    sinon.restore();
    cleanDb();
  });

  it('should return 400 when user email is missing',async function() {
    await addUser(userData[1]);

    const res = await chai
      .request(app)
      .post('/aws-access')
      .set('Authorization', req.headers.authorization)
      .send({
        groupId: 'test-group-id',
        userId: '30030'
      })
    expect(res.status).to.be.equal(400);
    expect(res.body).to.have.property('error')
        .that.equals(`User email is required to create an AWS user. Please update your email by setting up Profile service, url : ${PROFILE_SVC_GITHUB_URL}`);
  });

  it("Should create user and add to group, if the user is not present in AWS already", async function(){
    await addUser(userData[0]);
    sinon.stub(awsFunctions, "createUser").resolves({ UserId: "new-aws-user-id" });
    sinon.stub(awsFunctions, "addUserToGroup").resolves({ conflict: false });

    const res = await chai
    .request(app)
    .post('/aws-access')
    .set('Authorization', req.headers.authorization)
    .send({
      groupId: 'test-group-id',
      userId: '12345'
    })

    expect(res.body).to.have.property('message', 
      'User 12345 successfully added to group test-group-id.'
    );

  });
  it("Should add the user to the group if the user is already part of AWS account", async function(){
    await addUser(userData[0]);
    sinon.stub(awsFunctions, "createUser").resolves({ UserId: "existing-user-id-123" });
    sinon.stub(awsFunctions, "addUserToGroup").resolves({ conflict: false });

    const res = await chai
    .request(app)
    .post('/aws-access')
    .set('Authorization', req.headers.authorization)
    .send({
      groupId: 'test-group-id',
      userId: '12345'
    })
    console.log("response", res);
    expect(res.body).to.have.property('message', 
      'User 12345 successfully added to group test-group-id.'
    );

  });

  it("Should return the signin URL if the user is already added to the group", async function() {
    await addUser(userData[0]);
    sinon.stub(awsFunctions, "createUser").resolves({ UserId: "existing-user-id-123" });
    sinon.stub(awsFunctions, "addUserToGroup").resolves({ conflict: true });

    const res = await chai
    .request(app)
    .post('/aws-access')
    .set('Authorization', req.headers.authorization)
    .send({
      groupId: 'test-group-id',
      userId: '12345'
    })

    expect(res.body).to.have.property('message', 
      'User 12345 is already part of the AWS group, please try signing in.'
    );
  });
});
