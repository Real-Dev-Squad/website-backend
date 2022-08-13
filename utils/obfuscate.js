const obfuscatePhone = (phone) => {
  return phone.slice(0, 1) + phone.slice(1, phone.length - 1).replace(/\d/g, "*") + phone.slice(phone.length - 1);
};

const obfuscateMail = (email) => {
  return email.slice(0, 2) + email.slice(2, email.length - 2).replace(/./g, "*") + email.slice(email.length - 2);
};

module.exports = {
  obfuscatePhone,
  obfuscateMail,
};
