import addUser from "../utils/addUser";
import chai from "chai";
const { expect } = chai;
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
import chaiHttp from "chai-http";
import cleanDb from "../utils/cleanDb";
import { CreateOnboardingExtensionBody, OnboardingExtension } from "../../types/onboardingExtension";
import { 
    REQUEST_ALREADY_PENDING, 
    REQUEST_STATE, REQUEST_TYPE, 
    ONBOARDING_REQUEST_CREATED_SUCCESSFULLY, 
    UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST, 
    REQUEST_FETCHED_SUCCESSFULLY,
    INVALID_REQUEST_DEADLINE,
    PENDING_REQUEST_UPDATED,
    REQUEST_UPDATED_SUCCESSFULLY,
    INVALID_REQUEST_TYPE,
    REQUEST_DOES_NOT_EXIST,
    UNAUTHORIZED_TO_UPDATE_REQUEST
} from "../../constants/requests";
const { generateToken } = require("../../test/utils/generateBotToken");
import app from "../../server";
import { createUserStatusWithState } from "../../utils/userStatus";
const firestore = require("../../utils/firestore");
const userStatusModel = firestore.collection("usersStatus");
import * as requestsQuery from "../../models/requests"
import { userState } from "../../constants/userStatus";
import { generateAuthToken } from "../../services/authService";
const { CLOUDFLARE_WORKER, BAD_TOKEN } = require("../../constants/bot");
import * as logUtils from "../../services/logService";
import { convertDaysToMilliseconds } from "../../utils/time";
import { OooStatusRequest } from "../../types/oooRequest";
const userData = userDataFixture();
chai.use(chaiHttp);

describe("/requests Onboarding Extension", () => {
    describe("POST /requests", () => {
        let testUserId: string;
        let testUserIdForInvalidDiscordJoinedDate: string;
        let testUserDiscordIdForInvalidDiscordJoinedDate: string = "54321";
        let botToken: string;

        const testUserDiscordId: string = "654321";
        const extensionRequest = {
            state: REQUEST_STATE.APPROVED,
            type: REQUEST_TYPE.ONBOARDING,
            requestNumber: 1
        };
        const postEndpoint = "/requests";
        const body: CreateOnboardingExtensionBody = {
            type: REQUEST_TYPE.ONBOARDING,
            numberOfDays: 5,
            reason: "This is the reason",
            userId: testUserDiscordId,
        };
        
        beforeEach(async () => {
          botToken = generateToken({name: CLOUDFLARE_WORKER});

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
            .post(postEndpoint)
            .send({...body, type: REQUEST_TYPE.OOO})
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.error).to.equal("Unauthorized");
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

        it("should return Invalid Request when authorization header is missing", (done) => {
            chai
            .request(app)
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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
    
        it("should return 409 response when a user already has a pending request", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            requestsQuery.createRequest({...extensionRequest, state: REQUEST_STATE.PENDING, userId: testUserId});
    
            chai.request(app)
            .post(postEndpoint)
            .set("authorization", `Bearer ${botToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(409);
                expect(res.body.error).to.equal("Conflict");
                expect(res.body.message).to.equal(REQUEST_ALREADY_PENDING);
                done();
            })
        })
        
        it("should return 201 for successful response when user has onboarding state", (done)=> {
            createUserStatusWithState(testUserId, userStatusModel, userState.ONBOARDING);
            chai.request(app)
            .post(postEndpoint)
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
            .post(postEndpoint)
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
            .post(postEndpoint)
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

    describe("GET /requests",() => {
        const getEndpoint = "/requests";
        const username = userData[4].username;
    
        beforeEach(async () =>  {
            await addUser(userData[4]);
        });
    
        afterEach(async () =>  {
            await cleanDb();
        });
    
        it("should return 204 content when onboarding extension request does not exist", (done) =>  {
            requestsQuery.createRequest({ type: REQUEST_TYPE.OOO });
            chai.request(app)
            .get(`${getEndpoint}?type=ONBOARDING`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(204);
                return done();
            });
        });
    
        it("should fetch onboarding extension request by requestedBy field", (done) =>  {
            requestsQuery.createRequest({ type: REQUEST_TYPE.ONBOARDING, requestedBy: username });
            chai.request(app)
            .get(`${getEndpoint}?requestedBy=${username}&type=ONBOARDING&dev=true`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal(REQUEST_FETCHED_SUCCESSFULLY);
                expect(res.body.data[0].type).to.equal(REQUEST_TYPE.ONBOARDING);
                expect(res.body.data[0].requestedBy).to.equal(username);
                return done();
            });
        });
    
        it("should return 204 response when onboarding extension request does not exist for a user", (done) =>  {
            requestsQuery.createRequest({ type: REQUEST_TYPE.OOO, requestedBy: username });
            chai.request(app)
            .get(`${getEndpoint}?requestedBy=${username}&type=ONBOARDING`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(204);
                return done();
            });
        });
    
        it("should fetch onboarding extension request by type field", (done) =>  {
            requestsQuery.createRequest({ type: REQUEST_TYPE.ONBOARDING });
            chai.request(app)
            .get(`${getEndpoint}?type=ONBOARDING`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal(REQUEST_FETCHED_SUCCESSFULLY);
                expect(res.body.data.length).to.equal(1);
                expect(res.body.data[0].type).to.equal(REQUEST_TYPE.ONBOARDING);
                return done();
            });
        });
    
        it("should fetch onboarding extension request by state field", (done) =>  {
            requestsQuery.createRequest({ type: REQUEST_TYPE.ONBOARDING, state: REQUEST_STATE.APPROVED });
            chai.request(app)
            .get(`${getEndpoint}?state=APPROVED`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal(REQUEST_FETCHED_SUCCESSFULLY);
                expect(res.body.data.length).to.equal(1);
                expect(res.body.data[0].type).to.equal(REQUEST_TYPE.ONBOARDING);
                expect(res.body.data[0].state).to.equal(REQUEST_STATE.APPROVED);
                return done();
            });
        });
    });

    describe("PUT /requests", () => {
        const body = {
            type: REQUEST_TYPE.ONBOARDING,
            state: REQUEST_STATE.APPROVED,
            message: "test-message"
        };
        let latestExtension: OnboardingExtension;
        let userId: string;
        let putEndpoint: string;
        let authToken: string;
        let latestApprovedExtension: OnboardingExtension;
        let latestRejectedExtension: OnboardingExtension;

        beforeEach(async () => {
            userId = await addUser(userData[4]);
            latestExtension =  await requestsQuery.createRequest({ 
                state: REQUEST_STATE.PENDING, 
                type: REQUEST_TYPE.ONBOARDING, 
                requestNumber: 1
            });
            latestApprovedExtension = await requestsQuery.createRequest({
                state: REQUEST_STATE.APPROVED, 
                type: REQUEST_TYPE.ONBOARDING, requestNumber: 2
            });
            latestRejectedExtension = await requestsQuery.createRequest({
                state: REQUEST_STATE.REJECTED, 
                type: REQUEST_TYPE.ONBOARDING, 
                requestNumber: 2
            });
            putEndpoint = `/requests/${latestExtension.id}`;
            authToken = generateAuthToken({userId});
        })

        afterEach(async () => {
            sinon.restore();
            await cleanDb();
        })

        it("should return 401 response when user is not a super user", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${generateAuthToken({userId: "111"})}`)
            .send(body)
            .end((err, res) => {
                if(err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.error).to.equal("Unauthorized");
                expect(res.body.message).to.equal("You are not authorized for this action.");
                done();
            })
        })

        it("should return Invalid request type for incorrect value of type", (done) => {
            chai.request(app)
            .put("/requests/1111")
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, type: "<InvalidType>"})
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.error).to.equal("Bad Request");
                expect(res.body.message).to.equal('"type" must be one of [OOO, EXTENSION, ONBOARDING]');
                done();
            })
        })

        it("should return Unauthenticated User when authorization header is missing", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", "")
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

        it("should return Unauthenticated User for invalid token", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${BAD_TOKEN}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

        it("should return 400 response for invalid value of state", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, state: REQUEST_STATE.PENDING})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("state must be APPROVED or REJECTED");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 404 response for invalid extension id", (done) => {
            chai.request(app)
            .put(`/requests/1111`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(404);
                expect(res.body.message).to.equal("Request does not exist");
                expect(res.body.error).to.equal("Not Found");
                done();
            })
        })

        it("should return 400 response when type is not onboarding and extensionId is correct", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, type: REQUEST_TYPE.OOO})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request does not exist");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when extension state is approved", (done) => {
            chai.request(app)
            .put(`/requests/${latestApprovedExtension.id}`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request already approved");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when extension state is rejected", (done) => {
            chai.request(app)
            .put(`/requests/${latestRejectedExtension.id}`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request already rejected");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 200 for success response when request is approved", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal("Request approved successfully");
                done();
            })
        })

        it("should return 200 for success response when request is rejected", (done) => {
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, state: REQUEST_STATE.REJECTED})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal("Request rejected successfully");
                done();
            })
        })

        it("should return 500 response when fails to update extension request", (done) => {
            sinon.stub(requestsQuery, "updateRequest")
            .throws("Error while creating extension request");
            chai.request(app)
            .put(putEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res)=>{
                if (err) return done(err);
                expect(res.statusCode).to.equal(500);
                expect(res.body.message).to.equal("An internal server error occurred");
                expect(res.body.error).to.equal("Internal Server Error")
                done();
            })
        })
    });

    describe("PATCH /requests", () => {
        const body = {
            type: REQUEST_TYPE.ONBOARDING,
            newEndsOn: Date.now() + convertDaysToMilliseconds(3),
            reason: "<dummy-reason>"
        }
        let latestValidExtension: OnboardingExtension;
        let userId: string;
        let invalidUserId: string;
        let superUserId: string;
        let patchEndpoint: string;
        let authToken: string;
        let latestApprovedExtension: OnboardingExtension;
        let latestInvalidExtension: OnboardingExtension;
        let oooRequest: OooStatusRequest;

        beforeEach(async () => {
            userId = await addUser(userData[6]);
            invalidUserId = await addUser(userData[0]);
            superUserId = await addUser(userData[4]);
            latestInvalidExtension =  await requestsQuery.createRequest({ 
                state: REQUEST_STATE.PENDING, 
                type: REQUEST_TYPE.ONBOARDING, 
                oldEndsOn: Date.now() + convertDaysToMilliseconds(5),
                userId: userId,
            });
            latestValidExtension = await requestsQuery.createRequest({
                state: REQUEST_STATE.PENDING, 
                type: REQUEST_TYPE.ONBOARDING, 
                oldEndsOn: Date.now() - convertDaysToMilliseconds(3),
                userId: userId
            });
            latestApprovedExtension = await requestsQuery.createRequest({
                state: REQUEST_STATE.APPROVED, 
                type: REQUEST_TYPE.ONBOARDING, 
                oldEndsOn: Date.now(),
                userId: userId
            });
            oooRequest = await requestsQuery.createRequest({type: REQUEST_TYPE.OOO, userId: userId});
            patchEndpoint = `/requests/${latestValidExtension.id}`;
            authToken = generateAuthToken({userId});
        })
            
        afterEach(async () => {
            sinon.restore();
            await cleanDb();
        })

        it("should return 400 response for incorrect type", (done) => {
            chai.request(app)
            .patch(patchEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, type: "<invalid-type>"})
            .end((err, res) => {
                if(err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.error).to.equal("Bad Request");
                expect(res.body.message).to.equal("Invalid type");
                done();
            })
        })

        it("should return Unauthenticated User when authorization header is missing", (done) => {
            chai
            .request(app)
            .patch(patchEndpoint)
            .set("authorization", "")
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

        it("should return Unauthenticated User for invalid token", (done) => {
            chai.request(app)
            .patch(patchEndpoint)
            .set("authorization", `Bearer ${BAD_TOKEN}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(401);
                expect(res.body.message).to.equal("Unauthenticated User");
                done();
            })
        })

        it("should return 400 response for invalid value of newEndsOn", (done) => {
            chai.request(app)
            .patch(patchEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send({...body, newEndsOn: Date.now()})
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.error).to.equal("Bad Request");
                expect(res.body.message).contain(`"newEndsOn" must be greater than or equal to`)
                done();
            })
        })

        it("should return 404 response for invalid extension id", (done) => {
            chai.request(app)
            .patch(`/requests/1111`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(404);
                expect(res.body.message).to.equal(REQUEST_DOES_NOT_EXIST);
                expect(res.body.error).to.equal("Not Found");
                done();
            })
        })

        it("should return 403 response when super user and request owner are not updating the request", (done) => {
            chai.request(app)
            .patch(patchEndpoint)
            .set("authorization", `Bearer ${generateAuthToken({userId: invalidUserId})}`)
            .send(body)
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(403);
                expect(res.body.error).to.equal("Forbidden");
                expect(res.body.message).to.equal(UNAUTHORIZED_TO_UPDATE_REQUEST);
                done();
            })
        })

        it("should return 400 response when request type is not onboarding", (done) => {
            chai.request(app)
            .patch(`/requests/${oooRequest.id}`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal(INVALID_REQUEST_TYPE);
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when extension state is not pending", (done) => {
            chai.request(app)
            .patch(`/requests/${latestApprovedExtension.id}`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal(PENDING_REQUEST_UPDATED);
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when old dealdine is greater than new deadline", (done) => {
            chai.request(app)
            .patch(`/requests/${latestInvalidExtension.id}`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal(INVALID_REQUEST_DEADLINE);
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 200 success response when request owner is updating the request", (done) => {
            chai.request(app)
            .patch(patchEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal(REQUEST_UPDATED_SUCCESSFULLY);
                expect(res.body.data.id).to.equal(latestValidExtension.id);
                expect(res.body.data.newEndsOn).to.equal(body.newEndsOn)
                done();
            })
        })

        it("should return 200 success response when super user is updating the request", (done) => {
            chai.request(app)
            .patch(patchEndpoint)
            .set("authorization", `Bearer ${generateAuthToken({userId: superUserId})}`)
            .send(body)
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal(REQUEST_UPDATED_SUCCESSFULLY);
                expect(res.body.data.id).to.equal(latestValidExtension.id);
                expect(res.body.data.newEndsOn).to.equal(body.newEndsOn)
                done();
            })
        })


        it("should return 500 response for unexpected error", (done) => {
            sinon.stub(logUtils, "addLog").throws("Error")
            chai.request(app)
            .patch(patchEndpoint)
            .send(body)
            .set("authorization", `Bearer ${authToken}`)
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(500);
                expect(res.body.error).to.equal("Internal Server Error");
                done();
            })
        })
    })
});
    
