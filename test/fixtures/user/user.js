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
      discordId: "12345",
      yoe: 0,
      img: "./img.png",
      linkedin_id: "ankurnarkhede",
      github_id: githubUserInfo[0].username,
      github_display_name: githubUserInfo[0].displayName,
      github_created_at: Number(new Date(githubUserInfo[0]._json.created_at).getTime()),
      isMember: true,
      phone: "1234567890",
      email: "abc@gmail.com",
      discordJoinedAt: "2023-04-06T01:47:34.488000+00:00",
      joined_discord: "2023-01-13T18:21:09.278000+00:00",
      roles: {
        member: true,
        in_discord: true
      },
      tokens: {
        githubAccessToken: "githubAccessToken"
      },
      status: "active",
      profileURL: "https://abcde.com",
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      },
      incompleteUserDetails: false,
      nickname_synced: false
    },
    {
      username: "nikhil",
      first_name: "Nikhil",
      discordId: "1234567890",
      last_name: "Bhandarkar",
      yoe: 0,
      img: "./img.png",
      github_id: "whydonti",
      linkedin_id: "nikhil-bhandarkar",
      twitter_id: "whatifi",
      discordJoinedAt: "2023-04-06T01:47:34.488000+00:00",
      phone: "1234567891",
      email: "abc1@gmail.com",
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      },
      nickname_synced: false
    },
    {
      username: "pranavg",
      first_name: "Pranav",
      last_name: "Gajjewar",
      discordId: "12345678",
      yoe: 0,
      img: "./img.png",
      github_id: "cartmanishere",
      linkedin_id: "pranav-gajjewar",
      twitter_id: "PGajjewar",
      discordJoinedAt: "2023-04-06T01:47:34.488000+00:00",
      phone: "1234567891",
      email: "pgajjewar@gmail.com",
      roles: {
        restricted: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      },
      nickname_synced: false
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
        githubAccessToken: "githubAccessToken"
      },
      roles: {
        restricted: false,
        app_owner: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    },
    {
      username: "ankush",
      first_name: "Ankush",
      last_name: "Dharkar",
      discordId: "123456",
      yoe: 10,
      img: "./img.png",
      linkedin_id: "ankushdharkar",
      github_id: "ankushdharkar",
      github_display_name: "Ankush Dharkar",
      phone: "1234567890",
      email: "ad@amazon.com",
      joined_discord: "2023-01-13T18:21:09.278000+00:00",
      status: "idle",
      tokens: {
        githubAccessToken: "githubAccessToken"
      },
      roles: {
        super_user: true,
        archived: false,
        in_discord: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
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
        githubAccessToken: "githubAccessToken"
      },
      status: "active",
      roles: {
        app_owner: true,
        archived: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
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
        githubAccessToken: "githubAccessToken"
      },
      status: "active",
      roles: {
        member: true,
        archived: false,
        in_discord: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    },
    {
      username: "23ankur",
      first_name: "Ankur",
      last_name: "Narkhede",
      yoe: 0,
      img: "./img.png",
      linkedin_id: "ankurnarkhede",
      github_id: "ankur1234",
      github_display_name: "ankur-xyz",
      phone: "1234567890",
      email: "abc@gmail.com"
    },
    {
      username: "ritvik",
      github_id: "RitvikJamwal75",
      first_name: "Ritvik",
      yoe: 1,
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      },
      incompleteUserDetails: false,
      status: "active",
      last_name: "Jamwal",
      github_display_name: "Ritvik Jamwal",
      website: "RitvikJamwal75.github.io/portfolio",
      designation: "Sw Engineer",
      company: "Goldman Sacks",
      instagram_id: "ritvikjmwal",
      roles: {
        archived: false,
        member: true,
        in_discord: true,
        designer: true
      },
      twitter_id: "RitvikJamwal4u",
      linkedin_id: "ritvik-jamwal4u"
    },
    {
      username: "Tanishq",
      first_name: "Tanishq",
      last_name: "Singla",
      yoe: 1,
      img: "./img.png",
      linkedin_id: "tanishqsingla",
      github_id: "tanishqsingla",
      github_display_name: "Tanishq Singla",
      phone: "1234567890",
      email: "ts@gmail.com",
      tokens: {
        githubAccessToken: "githubAccessToken"
      },
      roles: {
        member: true,
        archived: false,
        in_discord: true,
        product_manager: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    },
    {
      username: "darthvader",
      first_name: "Darth",
      last_name: "Vader",
      yoe: 1,
      img: "./img.png",
      linkedin_id: "darthvader",
      github_id: "darthvader",
      github_display_name: "Darth Vader",
      phone: "1234567890",
      email: "dv@gmail.com",
      tokens: {
        githubAccessToken: "githubAccessToken"
      },
      roles: {
        member: true,
        maven: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    },
    {
      id: 11,
      username: "testuser1",
      first_name: "test1",
      last_name: "user1",
      yoe: 1,
      img: "./img.png",
      linkedin_id: "testuser1",
      github_id: "testuser1",
      github_display_name: "Test User",
      roles: {
        member: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    },
    {
      id: 12,
      username: "testuser2",
      first_name: "test2",
      last_name: "user2",
      yoe: 1,
      img: "./img.png",
      linkedin_id: "testuser1",
      github_id: "testuser1",
      github_display_name: "Test User",
      phone: "1234567890",
      email: "tu@gmail.com",
      chaincode: "12345",
      tokens: {
        githubAccessToken: "githubAccessToken"
      },
      roles: {
        member: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    },
    {
      username: "ram",
      github_id: "Ram123",
      first_name: "Ram",
      yoe: 1,
      picture: {
        publicId: "profile/abc/abc",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/123.jpg"
      },
      incompleteUserDetails: false,
      status: "active",
      last_name: "Singh",
      github_display_name: "Ram Singh",
      website: "Ramsingh123.github.io/portfolio",
      designation: "SDE",
      company: "XYZ",
      instagram_id: "ramsingh",
      roles: {
        archived: true,
        member: false
      },
      twitter_id: "ramsingh123",
      linkedin_id: "ramsingh123"
    },
    {
      username: "testuser3",
      first_name: "test3",
      last_name: "user3",
      yoe: 1,
      img: "./img.png",
      linkedin_id: "testuser1",
      github_id: "testuser",
      github_display_name: "Test User 3",
      phone: "1234567890",
      email: "abcd@gmail.com",
      chaincode: "12345",
      tokens: {
        githubAccessToken: "githubAccessToken"
      },
      roles: {
        member: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    },
    {
      username: "shubham-sigdar",
      first_name: "shubham",
      last_name: "sigdar",
      github_id: githubUserInfo[1].login,
      github_display_name: githubUserInfo[1].name,
      roles: {
        member: true,
        in_discord: true
      },
      incompleteUserDetails: false,
      updated_at: Date.now(),
      created_at: Date.now()
    },
    {
      username: "satyam-bajpai",
      first_name: "Satyam",
      last_name: "Bajpai",
      github_id: "satyam73",
      github_display_name: "Satyam Bajpai",
      roles: {
        member: false,
        in_discord: true,
        archived: false
      },
      incompleteUserDetails: false,
      updated_at: Date.now(),
      created_at: Date.now()
    },
    {
      first_name: "Kotesh",
      last_name: "Mudila",
      github_id: "kotesh-arya",
      github_display_name: "Kotesh Mudila",
      roles: {
        member: false,
        in_discord: true,
        archived: false
      },
      incompleteUserDetails: false,
      updated_at: Date.now(),
      created_at: Date.now()
    },
    {
      first_name: "vinit",
      last_name: "khandal",
      github_id: "vinit717",
      github_display_name: "vinit717",
      roles: {
        in_discord: false
      },
      incompleteUserDetails: false,
      updated_at: Date.now(),
      created_at: Date.now()
    },
    {
      username: "Vinayak",
      first_name: "Vinayak",
      last_name: "Trivedi",
      yoe: 2,
      img: "./img.png",
      linkedin_id: "_",
      github_id: "xfasrfsd",
      github_display_name: "vinayak-trivedi",
      discordJoinedAt: "2023-04-06T01:47:34.488000+00:00",
      phone: "1234567890",
      email: "abc@gmail.com",
      status: "active",
      tokens: {
        githubAccessToken: "githubAccessToken"
      },
      roles: {
        restricted: false,
        app_owner: true,
        archived: true
      },
      picture: {
        publicId: "profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar",
        url: "https://res.cloudinary.com/realdevsquad/image/upload/v1667685133/profile/mtS4DhUvNYsKqI7oCWVB/aenklfhtjldc5ytei3ar.jpg"
      }
    }
  ];
};
