import { convertDateStringToMilliseconds, getNewDeadline } from "../../../utils/requests"
import { convertDaysToMilliseconds } from "../../../utils/time";
import {expect} from "chai";

describe("Test getNewDeadline", () => {
    const currentDate = Date.now();
    const millisecondsInTwoDays = convertDaysToMilliseconds(2);
    let oldEndsOn = currentDate - millisecondsInTwoDays;
    const numberOfDaysInMillisecond = convertDaysToMilliseconds(5);

    it("should return correct new deadline when old deadline has been missed", () => {
        const res = getNewDeadline(currentDate, oldEndsOn, numberOfDaysInMillisecond);
        expect(res).to.equal(currentDate + numberOfDaysInMillisecond);
    })

    it("shoudl return correct new deadline when old deadline has not been missed", () => {
        oldEndsOn += millisecondsInTwoDays;
        const res = getNewDeadline(currentDate, oldEndsOn, numberOfDaysInMillisecond);
        expect(res).to.equal(oldEndsOn + numberOfDaysInMillisecond);
    })
})

describe("Test convertDateStringInMilliseconds", () => { 
    const validDateString = "2024-10-17T16:10:52.668000+00:00";
    const invalidDateString = "2024-10-17T16";
    const emptyDateString = "";

    it("should return isDate equal false for invalid date string", () => {
        const res = convertDateStringToMilliseconds(invalidDateString);
        expect(res.isDate).to.equal(false);
        expect(res.milliseconds).to.equal(undefined);
    })

    it("should return isDate equal false for empty date string", () => {
        const res = convertDateStringToMilliseconds(emptyDateString);
        expect(res.isDate).to.equal(false);
        expect(res.milliseconds).to.equal(undefined);
    })

    it("should return isDate equal true for valid date string", () => {
        const res = convertDateStringToMilliseconds(validDateString);
        expect(res.isDate).to.equal(true);
        expect(res.milliseconds).to.equal(Date.parse(validDateString));
    })
})