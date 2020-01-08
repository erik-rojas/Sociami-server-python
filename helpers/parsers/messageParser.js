const UserProfileMessageParser = require('../parsers/userProfileMessageParser');
const SkillMessageParser = require('../parsers/skillMessageParser');
var async = require('async');

let MessageParser = {
}
//The parameters received in the parseMessage method, the parameters - message and userID will not have null values, and the parameer dataObj can have null value 
MessageParser.parseMessage = async function(message, dataObj, userID) {   
    if(message.includes("##skillname##")){
        message = await SkillMessageParser.parseSkillName(message,dataObj.data.skillId);
    } 
    if(message.includes("##name##")){
        message = await UserProfileMessageParser.parseName(message,userID);
    }
    if(message.includes("##usernames##")){
        message = await UserProfileMessageParser.parseUserName(message,dataObj.data.partnerUserIds);
    }
    return message;
}

module.exports = MessageParser;