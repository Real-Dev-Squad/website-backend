import { CustomRequest, CustomResponse } from "../types/global";
const { addOrUpdate } = require("../models/users");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const nodemailer = require("nodemailer");
const config = require("config");
const emailSubscriptionCredentials = config.get("emailSubscriptionCredentials");

export const subscribe = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { email, phoneNumber } = req.body;
    const userId = req.userData.id;
    const dev = req.query.dev === "true";
    if (!dev) {
      return res.boom.notFound("Route not found");
    }

    await addOrUpdate(
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
    const dev = req.query.dev === "true";
    if (!dev) {
      return res.boom.notFound("Route not found");
    }
    await addOrUpdate(
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

export const sendEmail = async (req: CustomRequest, res: CustomResponse) => {
  try { 
    const dev = req.query.dev === "true";
    if (!dev) {
      return res.boom.notFound("Route not found");
    }
    
    const transporter = nodemailer.createTransport({
      host: emailSubscriptionCredentials.host,
      port:  emailSubscriptionCredentials.port,
      secure: false,

      auth: {
        user: emailSubscriptionCredentials.email,
        pass: emailSubscriptionCredentials.password,
      },
    });

    const info = await transporter.sendMail({
      from: `"Real Dev Squad" <${emailSubscriptionCredentials.email}>`,
      // TODO: after approving this  PR we need to send email to TEJAS sir via this API as a POC.
      to: "dgandhrav@gmail.com",
      subject: "Hello local, Testing in progress.",
      text: "working for notification feature",
      html: "<b>Hello world!</b>",
    });

    res.send({ message: "Email sent", info });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send({ message: "Failed to send email", error });
  }
  res.send(emailSubscriptionCredentials)
};