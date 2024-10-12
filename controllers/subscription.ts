import { CustomRequest, CustomResponse } from "../types/global";
const { addOrUpdate } = require("../models/users");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const nodemailer = require("nodemailer");
const config = require("config");
const emailSubscriptionCredentials = config.get("emailSubscriptionCredentials");

export const subscribe = async (req: CustomRequest, res: CustomResponse) => {
  const dev = req.query.dev === "true";
    if (!dev) {
      return res.boom.notFound("Route not found");
    }
    const { email } = req.body;
    const phoneNumber = req.body.phoneNumber || null;
    const userId = req.userData.id;
    const data = { email, isSubscribed: true, phoneNumber };
    const userAlreadySubscribed = req.userData.isSubscribed;
  try {
    if (userAlreadySubscribed) {
      return res.boom.badRequest({message: "User is already subscribed"});
    }
    await addOrUpdate(data, userId);
    return res.status(201).json({
      message: "user subscribed successfully",
    });
  } catch (error) {
    res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

export const unsubscribe = async (req: CustomRequest, res: CustomResponse) => {
  const dev = req.query.dev === "true";
    if (!dev) {
      return res.boom.notFound("Route not found");
    }
    const userId = req.userData.id;
    const userAlreadySubscribed = req.userData.isSubscribed;
  try {
    if (!userAlreadySubscribed) {
      return res.boom.badRequest({message: "User is already unsubscribed"});
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

// TODO: currently we are sending test email to a user only (i.e., Tejas sir as decided)
// later we need to make service which send email to all subscribed user
export const sendEmail = async (req: CustomRequest, res: CustomResponse) => {
  const dev = req.query.dev === "true";
  if (!dev) {
    return res.boom.notFound("Route not found");
  }
  try { 
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
      to: "tejasatrds@gmail.com ",
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