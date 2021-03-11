/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const recruiterModel = firestore.collection('recruiters')
const userModel = firestore.collection('users')


const addRecruiterInfo = async (recruiterData, username, timeStamp) => {
  try {
    const recruiterInfo = await recruiterModel.add(recruiterData)
    const recruiter = await recruiterModel.doc(recruiterInfo.id).get()
    const notifyUser= await sendDetails(recruiter, username, timeStamp)

    return {
      message: 'Request Submission Successful!!',
      id: recruiterInfo.id
    }   
  } catch (err) {
    logger.error('Error in adding recruiter', err)
    throw err
  }    
}

    
const sendDetails= async(recruiter, username, timeStamp) =>{
  try{
    const user = await userModel.where('username', '==', username).limit(1).get()
    var userName;
    if(!user.empty)
    {
      user.forEach(doc => {
        const userFname = doc.data().first_name
        const userLname = doc.data().last_name
        userName = userFname+" "+userLname
    })
    } 
    const recruiterName = recruiter.data().first_name+" "+recruiter.data().last_name
  
    console.log("Recruiter: " + recruiterName + "\n" +
    "Member: " + userName + " " + "\n" + "Timestamp: " + timeStamp)
    }
    
    catch (err) {
      logger.error('Error in displaying details', err)
      throw err
      } 
}

module.exports = {
  addRecruiterInfo
}
