const userPhotoVerificationData = {
  discordId: "12345",
  userId: "1234567abcd",
  discord: {
    url: "https://cdn.discordapp.com/avatars/abc/1234abcd.png",
    approved: true,
    date: "some-date",
  },
  profile: {
    url: "https://res.cloudinary.com/avatars/1234/something.png",
    approved: false,
    date: "some-date",
  },
};
const newUserPhotoVerificationData = {
  discordId: "1234567",
  userId: "new-user-id",
  discord: {
    url: "https://discord.example.com/demo.png",
    approved: false,
    date: "some-date",
  },
  profile: {
    url: "https://cloudinary.example.com/demo.png",
    approved: false,
    date: "some-date",
  },
};

module.exports = { userPhotoVerificationData, newUserPhotoVerificationData };
