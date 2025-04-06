import chai, { expect } from "chai";
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { PROFILE_SVC_GITHUB_URL } from '../../constants/urls';
import * as awsFunctions from '../../utils/awsFunctions';
import bot from "../utils/generateBotToken";

import app from "../../server";
const userData = require("../fixtures/user/user")();
const authorizeBot = require("../../middlewares/authorizeBot");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const { CLOUDFLARE_WORKER } = require("../../constants/bot")

chai.use(chaiHttp);

describe('addUserToAWSGroup', function(){
  let req: any;
  const AWS_ACCESS_API_URL = `/aws/groups/access?dev=true`
  
  beforeEach(async () => {
    await addUser(userData[0]);
    await addUser(userData[1]);
    sinon.restore();
    req = {
      headers: {},
    };
    const jwtToken = bot.generateToken({ name: CLOUDFLARE_WORKER });
    req.headers.authorization = `Bearer ${jwtToken}`;
  })
  
  afterEach(async () => {
    await cleanDb();
  });

  it('should return 400 and user not found with wrong discord Id passed', function(done){
    const res = chai
    .request(app)
    .post(AWS_ACCESS_API_URL)
    .set('Authorization', req.headers.authorization)
    .send({
      groupId: 'test-group-id',
      userId: '3000230293'
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error')
          .that.equals(`User not found`);
      return done();
    })
  });

  it('should return 400 when user email is missing', function(done) {    
    const res = chai
      .request(app)
      .post(AWS_ACCESS_API_URL)
      .set('Authorization', req.headers.authorization)
      .send({
        groupId: 'test-group-id',
        userId: '1234567890'
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.be.equal(400);
        expect(res.body).to.have.property('error')
            .that.equals(`User email is required to create an AWS user. Please update your email by setting up Profile service, url : ${PROFILE_SVC_GITHUB_URL}`);
        return done();
      });
  });
  

  it("Should create user and add to group, if the user is not present in AWS already", function(done){
    sinon.stub(awsFunctions, "createUser").resolves({ UserId: "new-aws-user-id" });
    sinon.stub(awsFunctions, "addUserToGroup").resolves({ conflict: false });
    sinon.stub(awsFunctions, "fetchAwsUserIdByUsername").resolves(null);

    const res = chai
    .request(app)
    .post(AWS_ACCESS_API_URL)
    .set('Authorization', req.headers.authorization)
    .send({
      groupId: 'test-group-id',
      userId: '12345'
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('message', 
        `User 12345 successfully added to group test-group-id.`
      );
      return done();
    });
  });
  
  it("Should add the user to the group if the user is already part of AWS account", function(done){
    sinon.stub(awsFunctions, "addUserToGroup").resolves({ conflict: false });
    sinon.stub(awsFunctions, "fetchAwsUserIdByUsername").resolves("existing-user-id-123");
    
    const res =  chai
    .request(app)
    .post(AWS_ACCESS_API_URL)
    .set('Authorization', req.headers.authorization)
    .send({
      groupId: 'test-group-id',
      userId: '12345'
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      expect(res.status).to.be.equal(200)
      expect(res.body).to.have.property('message', 
        'User 12345 successfully added to group test-group-id.'
      );
      return done();
    });
  });

  it("Should return the signin URL if the user is already added to the group", function(done) {
    sinon.stub(awsFunctions, "addUserToGroup").resolves({ conflict: true });
    sinon.stub(awsFunctions, "fetchAwsUserIdByUsername").resolves("existing-user-id-123");
    
    const res = chai
    .request(app)
    .post(AWS_ACCESS_API_URL)
    .set('Authorization', req.headers.authorization)
    .send({
      groupId: 'test-group-id',
      userId: '12345'
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('message', 
        'User 12345 is already part of the AWS group, please try signing in.'
      );
      return done();
    });
  });
});
