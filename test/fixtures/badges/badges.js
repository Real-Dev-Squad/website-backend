const BADGES = [
  {
    id: 1,
    name: "badge unknown-1",
    imageUrl:
      "https://res.cloudinary.com/dvi5qujxs/image/upload/v1673989588/badge/badge%20unknown-201/dvnc0jhrqojvaznvaevq.webp",
    description: "badge 1",
    createdBy: "shmbajaj",
    createdAt: {
      _seconds: "1234567890",
      _nanoseconds: "1234567890",
    },
  },
  {
    id: 2,
    name: "badge unknown-2",
    imageUrl:
      "https://res.cloudinary.com/dvi5qujxs/image/upload/v1673989588/badge/badge%20unknown-201/dvnc0jhrqojvaznvaevq.webp",
    description: "badge 2",
    createdBy: "shmbajaj",
    createdAt: {
      _seconds: "1234567890",
      _nanoseconds: "1234567890",
    },
  },
  {
    id: 3,
    name: "badge unknown-3",
    imageUrl:
      "https://res.cloudinary.com/dvi5qujxs/image/upload/v1673989588/badge/badge%20unknown-201/dvnc0jhrqojvaznvaevq.webp",
    description: "badge 3",
    createdBy: "shmbajaj",
    createdAt: {
      _seconds: "1234567890",
      _nanoseconds: "1234567890",
    },
  },
];

const CLOUNDINARY_IMAGE_URL = "https://imageUrl.cloudinary.com/badges/something.jpg";

const EXPECTED_BADGE_OBJECT = {
  id: "some-random-badge-id",
  name: "badgeXrandom",
  createdBy: "shmbajaj",
  description: "",
  imageUrl: CLOUNDINARY_IMAGE_URL,
  createdAt: {},
};

const CLOUNDINARY_BADGE_IMAGE_UPLOAD_RESPONSE = {
  id: "badge-image-random-id",
  imageUrl: CLOUNDINARY_IMAGE_URL,
};

module.exports = {
  BADGES,
  EXPECTED_BADGE_OBJECT,
  CLOUNDINARY_BADGE_IMAGE_UPLOAD_RESPONSE,
};
