const userQuery = require("../models/users");
const { getPaginationLink} = require("../utils/users");

const retrieveUsers = async (req,res) => {
      try{
        const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(req.query);
        allUsers.map((item)=>{
          delete item.phone;
          delete item.email;
          delete item.chaincode;
          delete item.tokens;
        });
        return res.json({
          message: "Users returned successfully!",
          users: allUsers,
          links: {
            next: nextId ? getPaginationLink(req.query, "next", nextId) : "",
            prev: prevId ? getPaginationLink(req.query, "prev", prevId) : "",
          },
        });
      } catch (error) {
        logger.error(`Error while fetching all users: ${error}`);
        return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
      }
}

module.exports={
    retrieveUsers
}
