const UserNextActions = require('../helpers/userNextActions');
const IntentFilters = require('../helpers/intentFilters');
const HelperMessageBuilder = require('../helpers/helper_messageBuilder');
const HelperGetDeepDiveRating = require('../helpers/helper_getDeepDiveRating');
var async = require('async');

exports.get_next_interaction = async function(req, res) {
    const intents = IntentFilters.INTENTS;
    var intent = intents.find(tempIntent => {
        return tempIntent.name == req.body.result.metadata.intentName
    });
    switch (intent.name){
        case "user-next-steps":
            if (!req.body.result.parameters.userID) {
                var message = UserNextActions.ERROR_MESSAGE + "User Id is not configured";
                var retJson = {
                    speech: message,
                    displayText: message,
                    source: 'get-user-next-actions'
                }
                return responseData(res, retJson);
            }
            else {
                var retJson = await HelperMessageBuilder.messageBuilder(req.body.result.parameters.userID);
                responseData(res, retJson);
            }
            break;
        case "get-rating":
            if (!req.body.result.parameters.userID || !req.body.result.parameters.skillId || !req.body.result.parameters.partnerUserID) {
                var message = UserNextActions.ERROR_MESSAGE + "User Id or Skill Id or Partner User Id is not configured";
                var retJson = {
                    speech: message,
                    displayText: message,
                    source: 'get-user-next-actions'
                }
                return responseData(res, retJson);
            }
            else{
                var retJson = HelperGetDeepDiveRating.getRating(req.body.result.parameters.contextName, req.body.result.parameters.userID, req.body.result.parameters.skillId, req.body.result.parameters.partnerUserID, req.body.result.resolvedQuery);
                responseData(res, retJson);
            }
            break;
    }   

    function responseData(res, retJson){
        return res.json(retJson);
    }
  };
