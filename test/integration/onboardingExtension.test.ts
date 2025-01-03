import addUser from "../utils/addUser";
import chai from "chai";
const { expect } = chai;
import userDataFixture from "../fixtures/user/user";
import sinon from "sinon";
import chaiHttp from "chai-http";
import cleanDb from "../utils/cleanDb";
import app from "../../server";
import * as requestsQuery from "../../models/requests";
import { REQUEST_STATE, REQUEST_TYPE } from "../../constants/requests";
import { generateAuthToken } from "../../services/authService";
import { convertDaysToMilliseconds } from "../../utils/time";
import * as logUtils from "../../services/logService";
const { BAD_TOKEN } = require("../../constants/bot");
const userData = userDataFixture();
chai.use(chaiHttp);

describe("/requests Onboarding Extension", () => {
    describe("PATCH /requests", () => {
        const body = {
            type: REQUEST_TYPE.ONBOARDING,
            newEndsOn: Date.now() + convertDaysToMilliseconds(3),
            reason: "<dummy-reason>"
        }
        let latestValidExtension;
        let userId: string;
        let patchEndpoint: string;
        let authToken: string;
        let latestApprovedExtension;
        let latestInvalidExtension;
        let oooRequest;

        beforeEach(async () => {
            userId = await addUser(userData[4])
            latestInvalidExtension =  await requestsQuery.createRequest({state: REQUEST_STATE.PENDING, type: REQUEST_TYPE.ONBOARDING, oldEndsOn: Date.now() + convertDaysToMilliseconds(5)});
            latestValidExtension = await requestsQuery.createRequest({state: REQUEST_STATE.PENDING, type: REQUEST_TYPE.ONBOARDING, oldEndsOn: Date.now() - convertDaysToMilliseconds(3)})
            latestApprovedExtension = await requestsQuery.createRequest({state: REQUEST_STATE.APPROVED, type: REQUEST_TYPE.ONBOARDING, oldEndsOn: Date.now()});
            oooRequest = await requestsQuery.createRequest({type: REQUEST_TYPE.OOO});
            patchEndpoint = `/requests/${latestValidExtension.id}?dev=true`;
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
            .send({...body, type: REQUEST_TYPE.OOO})
            .end((err, res) => {
                if(err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.error).to.equal("Bad Request");
                expect(res.body.message).to.equal("Invalid type");
                done();
            })
        })

        it("should return Feature not implemented when dev is not true", (done) => {
            chai.request(app)
            .patch(`/requests/1111?dev=false`)
            .send(body)
            .set("authorization", `Bearer ${authToken}`)
            .end((err, res)=>{
                if (err) return done(err);
                expect(res.statusCode).to.equal(501);
                expect(res.body.message).to.equal("Feature not implemented");
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
            .patch(`/requests/1111?dev=true`)
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

        it("should return 400 response when request type is not onboarding", (done) => {
            chai.request(app)
            .patch(`/requests/${oooRequest.id}?dev=true`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Invalid request type");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when extension state is not pending", (done) => {
            chai.request(app)
            .patch(`/requests/${latestApprovedExtension.id}?dev=true`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request state is not pending");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 400 response when old dealdine is greater than new deadline", (done) => {
            chai.request(app)
            .patch(`/requests/${latestInvalidExtension.id}?dev=true`)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(400);
                expect(res.body.message).to.equal("Request new deadline must be greater than old deadline.");
                expect(res.body.error).to.equal("Bad Request");
                done();
            })
        })

        it("should return 200 success response", (done) => {
            chai.request(app)
            .patch(patchEndpoint)
            .set("authorization", `Bearer ${authToken}`)
            .send(body)
            .end((err, res)=>{
                if(err) return done(err);
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.equal("Request updated successfully");
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
})