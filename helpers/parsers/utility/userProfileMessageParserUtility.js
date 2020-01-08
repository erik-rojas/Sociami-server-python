const UserProfile = require('../../../models/userProfile');
var async = require('async');

let UserProfileMessageParserUtility = {
}

UserProfileMessageParserUtility.getUserFirstName = async function(userID) {  
    try{
        userData = await UserProfile.findOne({ _id: userID });
        return userData.profile.firstName;
    }
    catch(err){
        console.log(err);
        return "";
    } 
}

module.exports = UserProfileMessageParserUtility;