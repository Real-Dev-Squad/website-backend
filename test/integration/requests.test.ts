import chai from "chai";
import chaiHttp from "chai-http";
const { expect } = chai;
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userData from "../fixtures/user/user";
const cookieName = config.get("userToken.cookieName");
import addUser from "../utils/addUser";
import { validOooStatusRequests } from "../fixtures/oooRequest/oooRequest";

chai.use(chaiHttp);

describe("Requests",async  () => {
    let authToken: string;
    const userIdPromises = [addUser(userData[16])];
    const [userId] = await Promise.all(userIdPromises);
    authToken = authService.generateAuthToken({ userId });

    after(async () => {
        await cleanDb();
    });

    describe("POST /requests", function () {
        it("should return 401 if user is not logged in", function (done) {
            chai
                .request(app)
                .post("/requests")
                .send(validOooStatusRequests[0])
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    done();
                });
        });

        it("should create a new request", function (done) {
            chai
            .request(app)
            .post("/requests")
            .set("cookie", `${cookieName}=${authToken}`)
            .send(validOooStatusRequests)
                .end(function (err, res) {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("OOO status requested successfully");
                    done();
                });
        });
    });
});
