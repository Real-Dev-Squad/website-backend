const githubUserInfo = require("../auth/githubUserInfo")();

/**
 * User info for GitHub auth response
 * Multiple responses can be added to the array if required
 *
 * @return {Object}
 */
module.exports = () => {
  return [
    {
      username: "ankur",
      first_name: "Ankur",
      last_name: "Narkhede",
      yoe: 0,
      img: "./img.png",
      linkedin_id: "ankurnarkhede",
      github_id: githubUserInfo[0].username,
      github_display_name: githubUserInfo[0].displayName,
      isMember: true,
      phone: "1234567890",
      email: "abc@gmail.com",
      roles: {
        member: true,
      },
      tokens: {
        githubAccessToken: "githubAccessToken",
      },
      status: "active",
      profileURL: "https://abcde.com",
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg",
      },
      incompleteUserDetails: false,
    },
  ];
};
