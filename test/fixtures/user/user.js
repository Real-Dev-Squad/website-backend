// Import fixtures
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
    },
    {
      username: "nikhil",
      first_name: "Nikhil",
      last_name: "Bhandarkar",
      yoe: 0,
      img: "./img.png",
      github_id: "whydonti",
      linkedin_id: "nikhil-bhandarkar",
      twitter_id: "whatifi",
      phone: "1234567891",
      email: "abc1@gmail.com",
    },
    {
      username: "pranavg",
      first_name: "Pranav",
      last_name: "Gajjewar",
      yoe: 0,
      img: "./img.png",
      github_id: "cartmanishere",
      linkedin_id: "pranav-gajjewar",
      twitter_id: "PGajjewar",
      phone: "1234567891",
      email: "pgajjewar@gmail.com",
      roles: {
        restricted: true,
      },
    },
    {
      username: "sagar",
      first_name: "Sagar",
      last_name: "Bajpai",
      yoe: 3,
      img: "./img.png",
      linkedin_id: "sagarbajpai",
      github_id: "sagarbajpai",
      github_display_name: "Sagar Bajpai",
      phone: "1234567890",
      email: "abc@gmail.com",
      status: "active",
      tokens: {
        githubAccessToken: "githubAccessToken",
      },
      roles: {
        restricted: false,
        app_owner: true,
      },
    },
    {
      username: "ankush",
      first_name: "Ankush",
      last_name: "Dharkar",
      yoe: 10,
      img: "./img.png",
      linkedin_id: "ankushdharkar",
      github_id: "ankushdharkar",
      github_display_name: "Ankush Dharkar",
      phone: "1234567890",
      email: "ad@amazon.com",
      status: "idle",
      tokens: {
        githubAccessToken: "githubAccessToken",
      },
      roles: {
        super_user: true,
        archived: false,
      },
    },
    {
      username: "ankita",
      first_name: "Ankita",
      last_name: "Bannore",
      yoe: 0,
      img: "./img.png",
      linkedin_id: "ankitabannore",
      github_id: "Ankita2002-Fr",
      github_display_name: "Ankita Bannore",
      isMember: true,
      phone: "1234567890",
      email: "abc@gmail.com",
      tokens: {
        githubAccessToken: "githubAccessToken",
      },
      status: "active",
      roles: {
        app_owner: true,
        archived: true,
      },
    },
    {
      username: "mehul",
      first_name: "Mehul",
      last_name: "Chaudhari",
      yoe: 0,
      img: "./img.png",
      github_id: "mehulkchaudhari",
      linkedin_id: "mehulkchaudhari",
      twitter_id: "mehulkchaudhari",
      phone: "1234567891",
      email: "mehul@gmail.com",
      tokens: {
        githubAccessToken: "githubAccessToken",
      },
      status: "active",
      roles: {
        member: true,
        archived: false,
      },
    },
  ];
};
