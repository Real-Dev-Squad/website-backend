/**
 * User info for Google auth response
 * Multiple responses can be added to the array if required
 *
 * @return {Object}
 */
module.exports = () => {
  return [
    {
      id: "1234567890",
      displayName: "Google User",
      emails: [{ value: "test12@gmail.com", verified: true }],
      photos: [
        {
          value: "https://lh3.googleusercontent.com/a-/test",
        },
      ],
      provider: "google",
      _raw: `{
          '"sub": "1234567890",\n' +
          '"picture": "https://lh3.googleusercontent.com/a-/test",\n' +
          '"email": "test12@gmail.com",\n' +
          '"email_verified": true\n' +
        }`,
      _json: {
        sub: "1234567890",
        picture: "https://lh3.googleusercontent.com/a-/test",
        email: "test12@gmail.com",
        email_verified: true,
      },
    },
    {
      email: "test12@gmail.com",
      roles: {
        in_discord: true,
        archived: false,
      },
      role: "designer",
      incompleteUserDetails: false,
      updated_at: Date.now(),
      created_at: Date.now(),
    },
    {
      id: "1234567890",
      displayName: "Google User",
      emails: [{ value: "test123@gmail.com", verified: true }],
      photos: [
        {
          value: "https://lh3.googleusercontent.com/a-/test",
        },
      ],
      provider: "google",
      _raw: `{
          '"sub": "1234567890",\n' +
          '"picture": "https://lh3.googleusercontent.com/a-/test",\n' +
          '"email": "test123@gmail.com",\n' +
          '"email_verified": true\n' +
        }`,
      _json: {
        sub: "1234567890",
        picture: "https://lh3.googleusercontent.com/a-/test",
        email: "test123@gmail.com",
        email_verified: true,
      },
    },
    {
      email: "test123@gmail.com",
      roles: {
        in_discord: true,
        archived: false,
      },
      role: "developer",
      incompleteUserDetails: false,
      updated_at: Date.now(),
      created_at: Date.now(),
    },
  ];
};
