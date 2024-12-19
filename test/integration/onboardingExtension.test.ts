import addUser from "../utils/addUser";
import chai from "chai";
const { expect } = chai;
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
import chaiHttp from "chai-http";
import cleanDb from "../utils/cleanDb";
import { CreateOnboardingExtensionBody } from "../../types/onboardingExtension";
import { REQUEST_ALREADY_PENDING, REQUEST_STATE, REQUEST_TYPE } from "../../constants/requests";
const { generateToken } = require("../../test/utils/generateBotToken");
import app from "../../server";
import { createUserStatusWithState } from "../../utils/userStatus";
const firestore = require("../../utils/firestore");
const userStatusModel = firestore.collection("usersStatus");
import * as requestsQuery from "../../models/requests"
import { userState } from "../../constants/userStatus";
const { CLOUDFLARE_WORKER, BAD_TOKEN } = require("../../constants/bot");
const userData = userDataFixture();
chai.use(chaiHttp);

describe("/requests Onboarding Extension", () => {
    describe("POST /requests", () => {
        let testUserId: string;
        const testUserDiscordId = "654321";
        let testSuperUserDiscordId = "123456";

        beforeEach(async () => {
            await addUser({...userData[4], discordId: testSuperUserDiscordId});
            testUserId = await addUser({...userData[6], discordId: testUserDiscordId, discordJoinedAt: "2023-04-06T01:47:34.488000+00:00"});
        })
        afterEach(async ()=>{
            sinon.restore();
            await cleanDb();
        })
        const postEndpoint = "/requests";
        const botToken = generateToken({name: CLOUDFLARE_WORKER})
        const body: CreateOnboardingExtensionBody = {
            type: REQUEST_TYPE.ONBOARDING,
            numberOfDays: 5,
            reason: "This is the reason",
            requestedBy: testUserDiscordId,
            userId: testUserDiscordId,
        } 
        it("should return Feature not implemented when dev is not true", (done) => {
            chai.request(app)
            .post(`${postEndpoint}`)
            .send(body)
            .end((err, res)=>{
            if (err) return done(err);
            expect(res.statusCode).to.equal(501);
            expect(res.body.message).to.equal("Feature not implemented");
            done();
            })
        })
    
        it("should return Invalid Request when authorization header is missing", (done) => {
            chai
            .request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", "")
            .send(body)
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("Invalid Request");
            done();
            })
        })
    
        it("should return Unauthorized Bot for invalid token", (done) => {
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${BAD_TOKEN}`)
            .send(body)
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(401);
            expect(res.body.message).to.equal("Unauthorized Bot");
            done();
            })
        })
    
        it("should return 400 response for invalid value type of numberOfDays", (done) => {
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({...body, numberOfDays:"1"})
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("numberOfDays must be a number");
            expect(res.body.error).to.equal("Bad Request");
            done();
            })
        })
    
        it("should return 400 response for invalid value of numberOfDays", (done) => {
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({...body, numberOfDays:1.4})
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("numberOfDays must be a integer");
            expect(res.body.error).to.equal("Bad Request");
            done();
            })
        })
    
        it("should return 400 response for invalid userId", (done) => {
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({...body, userId: undefined})
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("userId is required");
            expect(res.body.error).to.equal("Bad Request");
            done();
            })
        })
    
        it("should return 500 response when fails to create extension request", (done) => {
            sinon.stub(requestsQuery, "createRequest")
            .throws("Error while creating extension request");
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({
            ...body,
            requestedBy:testUserDiscordId
            })
            .end((err, res)=>{
            if (err) return done(err);
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal("An internal server error occurred");
            done();
            })
        })
    
        it("should return 404 response when user does not exist", (done) => {
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({...body, requestedBy: "1111"})
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(res.body.error).to.equal("Not Found");
            expect(res.body.message).to.equal("User not found");
            done();
            })
        })
    
        it("should return 401 response when user is not a super user or status is not onboarding", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ACTIVE);
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({
            ...body,
            requestedBy:testUserDiscordId
            })
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(401);
            expect(res.body.error).to.equal("Unauthorized");
            done();
            })
        })
    
        it("should return 400 response when a user already has a pending request", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            const extension = {
            state: REQUEST_STATE.PENDING,
            type: REQUEST_TYPE.ONBOARDING,
            userId: testUserId,
            }
    
            requestsQuery.createRequest(extension);
    
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({
            ...body,
            requestedBy:testUserDiscordId
            })
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.error).to.equal("Bad Request");
            expect(res.body.message).to.equal(REQUEST_ALREADY_PENDING);
            done();
            })
        })
    
        it("should return 201 for successful response when user has onboarding status", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({
            ...body,
            requestedBy:testUserDiscordId
            })
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(201);
            expect(res.body.message).to.equal("Onboarding extension request created successfully!");
            expect(res.body.data.requestNumber).to.equal(1);
            expect(res.body.data.reason).to.equal(body.reason);
            expect(res.body.data.state).to.equal(REQUEST_STATE.PENDING)
            done();
            })
        })

        it("should return 201 for successful response when user is a super user", (done)=> {
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({
                ...body,
                userId: testUserDiscordId,
                requestedBy: testSuperUserDiscordId
            })
            .end((err, res) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(201);
            expect(res.body.message).to.equal("Onboarding extension request created successfully!");
            expect(res.body.data.requestNumber).to.equal(1);
            expect(res.body.data.reason).to.equal(body.reason);
            expect(res.body.data.state).to.equal(REQUEST_STATE.PENDING)
            done();
            })
        })
    })
});