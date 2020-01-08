const UserInteraction = require('../models/userInteractions');
const UserProfile = require('../models/userProfile');
const UserNextActions = require('../helpers/userNextActions');
const MessageParser = require('../helpers/parsers/messageParser');
var async = require('async');

let HelperMessageBuilder = {
}

HelperMessageBuilder.messageBuilder = async function(userID) {
    const nextStepsData = UserNextActions.NEXT_STEPS_DATA;
    var message = "";
    try{
        var userInteraction = await UserInteraction.findOne({ userID: userID }).sort({ timeStamp: -1 });
        if(userInteraction){
            var tempNextStepData = nextStepsData.find(item => {
                                    return item.type == userInteraction.type && item.subType == userInteraction.subType
                                   })
            if(tempNextStepData){
                message += tempNextStepData.messageForNextStep;             
                message = await MessageParser.parseMessage(message, userInteraction, userID);
                var contextOut1 = [{"name":"user-next-steps", "lifespan":1, "parameters":{"userID":userID,"skillId": userInteraction.data.skillId,"partnerUserID":userInteraction.data.partnerUserIds.join(),"contextName":"user-next-steps"}}];
                var retJson = {
                    speech: message,
                    displayText: message,
                    data: [],
                    contextOut: contextOut1,
                    source: 'get-user-next-actions'
                }
                return retJson;
            }
            else{
                message += UserNextActions.ERROR_MESSAGE + "User has not traversed pages or executed any actions that are defined in UserNextActions. User last traversed UserInteraction Type - " + userInteraction.type + " and Sub Type - " + userInteraction.subType;
                var retJson = {
                    speech: message,
                    displayText: message,
                    source: 'get-user-next-actions'
                }
                return retJson;
            }
        }
        else{
            message += UserNextActions.DEFAULT_MESSAGE;
            message = await MessageParser.parseMessage(message, null, userID);
            var retJson = {
                speech: message,
                displayText: message,
                source: 'get-user-next-actions'
            }
            return retJson;
        }        
    }
    catch(err){
        console.log(err);
        return UserNextActions.ERROR_MESSAGE + err
    }
}

module.exports = HelperMessageBuilder;