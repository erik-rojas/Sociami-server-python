const UserProfileMessageParserUtility = require('../parsers/utility/userProfileMessageParserUtility')
var async = require('async');

let UserProfileMessageParser = {
}

UserProfileMessageParser.parseName = async function(message, userID) {  
    var firstName = await UserProfileMessageParserUtility.getUserFirstName(userID);
    message = message.replace("##name##", firstName);
    return message;
}

UserProfileMessageParser.parseUserName = async function(message, partnerUserIds) {  
    var firstName = await UserProfileMessageParserUtility.getUserFirstName(partnerUserIds[0]);
    var tempMessage = "" + firstName;
    if(partnerUserIds.length > 1){
        tempMessage = tempMessage + " and " + (partnerUserIds.length - 1) + " more";
    } 
    message = message.replace("##usernames##", tempMessage);
    return message;
}

UserProfileMessageParser.parseSkillName = async function(message, skillId) {  
    var skillName = await SkillMessageParserUtility.getSkillName(skillId);
    message = message.replace("##skillname##", skillName);
    return message;
}

module.exports = UserProfileMessageParser;