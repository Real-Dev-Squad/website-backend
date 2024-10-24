import { CustomRequest, CustomResponse } from "../types/global";
const { addOrUpdate } = require("../models/users");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const nodemailer = require("nodemailer");
const config = require("config");
const emailServiceConfig = config.get("emailServiceConfig");

export const subscribe = async (req: CustomRequest, res: CustomResponse) => {
    const { email } = req.body;
    const phone = req.body.phone || null;
    const userId = req.userData.id;
    const data = { email, isSubscribed: true, phone };
    const userAlreadySubscribed = req.userData.isSubscribed;
  try {
    if (userAlreadySubscribed) {
      return res.boom.badRequest("User already subscribed");
    }
    await addOrUpdate(data, userId);
    return res.status(201).json("User subscribed successfully");
  } catch (error) {
    logger.error(`Error occurred while subscribing: ${error.message}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

export const unsubscribe = async (req: CustomRequest, res: CustomResponse) => {
    const userId = req.userData.id;
    const userAlreadySubscribed = req.userData.isSubscribed;
  try {
    if (!userAlreadySubscribed) {
      return res.boom.badRequest("User is already unsubscribed");
    }
    await addOrUpdate(
      {
        isSubscribed: false,
      },
      userId
    );
    return res.status(200).json("User unsubscribed successfully");
  } catch (error) {
    logger.error(`Error occurred while unsubscribing: ${error.message}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

// TODO: currently we are sending test email to a user only (i.e., Tejas sir as decided)
// later we need to make service which send email to all subscribed user
export const sendEmail = async (req: CustomRequest, res: CustomResponse) => {
  try { 
    const transporter = nodemailer.createTransport({
      host: emailServiceConfig.host,
      port:  emailServiceConfig.port,
      secure: false,

      auth: {
        user: emailServiceConfig.email,
        pass: emailServiceConfig.password,
      },
    });

    const info = await transporter.sendMail({
      from: `"Real Dev Squad" <${emailServiceConfig.email}>`,
      to: "tejasatrds@gmail.com",
      subject: "Hello local, Testing in progress.",
      text: "working for notification feature",
      html: "<b>Hello world!</b>",
    });

    return res.send({ message: "Email sent successfully", info });
  } catch (error) {
    logger.error("Error occurred while sending email:", error.message);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
