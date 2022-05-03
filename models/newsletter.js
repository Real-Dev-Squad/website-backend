const { loggers } = require("winston");
const firestore = require("../utils/firestore");
const newsletterModel = firestore.collection("newsletter");

const subscribe = async (data) => {
  try {
    const { email } = data;
    const check = await newsletterModel.where("email", "==", email).get();
    let exist = false;
    check.forEach((ch) => {
      const data = ch.data();
      if (!data.active) {
        const res = ch.id;
        newsletterModel.doc(res).update({
          active: true,
          email: data.email,
        });
      }
      exist = true;
    });
    if (!exist) {
      await newsletterModel.add({
        email: email,
        active: true,
      });
      return "new added";
    }
    return "already added";
  } catch (err) {
    loggers.error("hi");
    throw err;
  }
};

const getMailingList = async () => {
  try {
    const activeMails = await newsletterModel.where("active", "==", true).get();
    const response = [];
    activeMails.forEach((mail) => {
      response.push(mail.data().email);
    });
    return response;
  } catch (err) {
    loggers.error("couldn't access db");
    throw err;
  }
};

const unsubscribe = async (data) => {
  try {
    const { email } = data;
    let exist = false;
    const check = await newsletterModel.where("email", "==", email).get();
    check.forEach((ch) => {
      const data = ch.data();
      if (data.active) {
        const res = ch.id;
        newsletterModel.doc(res).update({
          active: false,
          email: data.email,
        });
        exist = true;
      }
    });
    return exist ? "Successfully Unsubscribed" : "Couldn't find an existing subscription";
  } catch (err) {
    loggers.error("couldn't access db");
    throw err;
  }
};

module.exports = {
  subscribe,
  getMailingList,
  unsubscribe,
};
