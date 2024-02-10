const userPhotoVerificationData = {
  discordId: "12345",
  userId: "1234567abcd",
  discord: {
    url: "https://cdn.discordapp.com/avatars/abc/1234abcd.png",
    approved: true,
    date: {
      _seconds: 1686518413,
      _nanoseconds: 453000000,
    },
  },
  profile: {
    url: "https://res.cloudinary.com/avatars/1234/something.png",
    approved: false,
    date: {
      _seconds: 1686518413,
      _nanoseconds: 453000000,
    },
  },
};
const newUserPhotoVerificationData = {
  discordId: "1234567",
  userId: "new-user-id",
  discord: {
    url: "https://discord.example.com/demo.png",
    approved: false,
    date: {
      _seconds: 1686518413,
      _nanoseconds: 453000000,
    },
  },
  profile: {
    url: "https://cloudinary.example.com/demo.png",
    approved: false,
    date: {
      _seconds: 1686518413,
      _nanoseconds: 453000000,
    },
  },
};

module.exports = { userPhotoVerificationData, newUserPhotoVerificationData };
