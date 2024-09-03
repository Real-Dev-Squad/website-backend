import { CustomRequest, CustomResponse } from "../types/global";
const { addOrUpdate } = require("../models/users");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

export const subscribe = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { email, phoneNumber } = req.body;
    const userId = req.userData.id;
    await await addOrUpdate(
      {
        phoneNumber,
        email,
        isSubscribed: true,
      },
      userId
    );
    return res.status(201).json({
      message: "user subscribed successfully",
    });
  } catch (error) {
    res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

export const unsubscribe = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const userId = req.userData.id;
    await await addOrUpdate(
      {
        isSubscribed: false,
      },
      userId
    );
    return res.status(200).json({
      message: "user unsubscribed successfully",
    });
  } catch (error) {
    res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
