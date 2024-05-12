const userPhotoVerificationData = [
  {
    discordId: "12345",
    userId: "1234567abcd",
    discord: {
      url: "https://cdn.discordapp.com/avatars/abc/1234abcd.png",
      approved: false,
      updatedAt: 1712788779,
    },
    profile: {
      url: "https://res.cloudinary.com/avatars/1234/something.png",
      approved: false,
      updatedAt: 1712788779,
      publicId: "profile/1234567abcd/umgnk8o7ujrzbmy",
    },
    status: "PENDING",
  },
  {
    discordId: "67890",
    userId: "abcdefg1234567",
    discord: {
      url: "https://cdn.discordapp.com/avatars/def/5678efgh.png",
      approved: false,
      updatedAt: 1712788779,
    },
    profile: {
      url: "https://res.cloudinary.com/avatars/5678/another.png",
      approved: true,
      updatedAt: 1712788779,
      publicId: "profile/abcdefg1234567/xyzabc123",
    },
    status: "PENDING",
  },
  {
    discordId: "12345",
    userId: "hijklmn8901234",
    discord: {
      url: "https://cdn.discordapp.com/avatars/abc/1234ijkl.png",
      approved: true,
      updatedAt: 1712788779,
    },
    profile: {
      url: "https://res.cloudinary.com/avatars/1234/different.png",
      approved: false,
      updatedAt: 1712788779,
      publicId: "profile/hijklmn8901234/defghi456",
    },
    status: "PENDING",
  },
];

const newUserPhotoVerificationData = {
  discordId: "1234567",
  userId: "new-user-id",
  discord: {
    url: "https://discord.example.com/demo.png",
    approved: false,
    updatedAt: 1712788779,
  },
  profile: {
    url: "https://cloudinary.example.com/demo.png",
    approved: false,
    updatedAt: 1712788779,
  },
};

module.exports = { userPhotoVerificationData, newUserPhotoVerificationData };
