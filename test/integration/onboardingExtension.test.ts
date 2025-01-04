import addUser from "../utils/addUser";
import chai from "chai";
const { expect } = chai;
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
import chaiHttp from "chai-http";
import cleanDb from "../utils/cleanDb";
import { CreateOnboardingExtensionBody } from "../../types/onboardingExtension";
import { 
    REQUEST_ALREADY_PENDING, 
    REQUEST_STATE, REQUEST_TYPE, 
    ONBOARDING_REQUEST_CREATED_SUCCESSFULLY, 
    UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST 
} from "../../constants/requests";
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
        let testUserIdForInvalidDiscordJoinedDate: string;
        let testUserDiscordIdForInvalidDiscordJoinedDate: string = "54321";

        const testUserDiscordId: string = "654321";
        const extensionRequest = {
            state: REQUEST_STATE.APPROVED,
            type: REQUEST_TYPE.ONBOARDING,
            requestNumber: 1
        };
        const postEndpoint = "/requests";
        const botToken = generateToken({name: CLOUDFLARE_WORKER})
        const body: CreateOnboardingExtensionBody = {
            type: REQUEST_TYPE.ONBOARDING,
            numberOfDays: 5,
            reason: "This is the reason",
            userId: testUserDiscordId,
        };

        beforeEach(async () => {
            testUserId = await addUser({
                ...userData[6], 
                discordId: testUserDiscordId, 
                discordJoinedAt: "2023-04-06T01:47:34.488000+00:00"
            });
            testUserIdForInvalidDiscordJoinedDate = await addUser({
                ...userData[1], 
                discordId: testUserDiscordIdForInvalidDiscordJoinedDate, 
                discordJoinedAt: "2023-04-06T01"
            });
        });

        afterEach(async ()=>{
            sinon.restore();
            await cleanDb();
        })

        it("should not call verifyDiscordBot and return 401 response when extension type is not onboarding", (done)=> {
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .send({...body, type: REQUEST_TYPE.OOO})
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.error).to.equal("Unauthorized");
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

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
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            sinon.stub(requestsQuery, "createRequest")
            .throws("Error while creating extension request");
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send(body)
            .end((err, res)=>{
                if (err) return done(err);
                expect(res.statusCode).to.equal(500);
                expect(res.body.message).to.equal("An internal server error occurred");
                done();
            })
        })
        
        it("should return 500 response when discordJoinedAt date string is invalid", (done) => {
            createUserStatusWithState(testUserIdForInvalidDiscordJoinedDate, userStatusModel, userState.ONBOARDING);
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send({...body, userId: testUserDiscordIdForInvalidDiscordJoinedDate})
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
            .send({...body, userId: "11111"})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(404);
                expect(res.body.error).to.equal("Not Found");
                expect(res.body.message).to.equal("User not found");
                done();
            })
        })
    
        it("should return 403 response when user's status is not onboarding", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ACTIVE);
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(403);
                expect(res.body.error).to.equal("Forbidden");
                expect(res.body.message).to.equal(UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST);
                done();
            })
        })
    
        it("should return 400 response when a user already has a pending request", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            requestsQuery.createRequest({...extensionRequest, state: REQUEST_STATE.PENDING, userId: testUserId});
    
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.error).to.equal("Bad Request");
                expect(res.body.message).to.equal(REQUEST_ALREADY_PENDING);
                done();
            })
        })
        
        it("should return 201 for successful response when user has onboarding state", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(201);
                expect(res.body.message).to.equal(ONBOARDING_REQUEST_CREATED_SUCCESSFULLY);
                expect(res.body.data.requestNumber).to.equal(1);
                expect(res.body.data.reason).to.equal(body.reason);
                expect(res.body.data.state).to.equal(REQUEST_STATE.PENDING);
                done();
            })
        })

        it("should return 201 response when previous latest extension request is approved", async () => {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            const latestApprovedExtension = await requestsQuery.createRequest({
                ...extensionRequest, 
                userId: testUserId, 
                state: REQUEST_STATE.APPROVED,
                newEndsOn: Date.now() + 2*24*60*60*1000,
                oldEndsOn: Date.now() - 24*60*60*1000,
            });

            const res = await chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send(body);

            expect(res.statusCode).to.equal(201);
            expect(res.body.message).to.equal(ONBOARDING_REQUEST_CREATED_SUCCESSFULLY);
            expect(res.body.data.requestNumber).to.equal(2);
            expect(res.body.data.reason).to.equal(body.reason);
            expect(res.body.data.state).to.equal(REQUEST_STATE.PENDING);
            expect(res.body.data.oldEndsOn).to.equal(latestApprovedExtension.newEndsOn);
            expect(res.body.data.newEndsOn).to.equal(latestApprovedExtension.newEndsOn + (body.numberOfDays*24*60*60*1000));
        })

        it("should return 201 response when previous latest extension request is rejected", async () => {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            const currentDate = Date.now();
            const latestRejectedExtension = await requestsQuery.createRequest({
                ...extensionRequest, 
                state: REQUEST_STATE.REJECTED, 
                userId: testUserId,
                newEndsOn: currentDate,
                oldEndsOn: currentDate - 24*60*60*1000,
            });
            
            const res = await chai.request(app)
            .post(`${postEndpoint}?dev=true`)
            .set("authorization", `Bearer ${botToken}`)
            .send(body);

            expect(res.statusCode).to.equal(201);
            expect(res.body.message).to.equal(ONBOARDING_REQUEST_CREATED_SUCCESSFULLY);
            expect(res.body.data.requestNumber).to.equal(2);
            expect(res.body.data.reason).to.equal(body.reason);;
            expect(res.body.data.state).to.equal(REQUEST_STATE.PENDING);
            expect(res.body.data.oldEndsOn).to.equal(latestRejectedExtension.oldEndsOn);
            expect(new Date(res.body.data.newEndsOn).toDateString())
            .to.equal(new Date(currentDate + (body.numberOfDays*24*60*60*1000)).toDateString());
        })
    })
});