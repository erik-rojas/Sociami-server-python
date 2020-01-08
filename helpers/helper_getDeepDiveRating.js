const UserNextActions = require('../helpers/userNextActions');
const Rating = require('../models/ratings');
const UserInteractionsHelper = require("../helpers/UserInteractions");

let HelperGetDeepDiveRating = {
}

HelperGetDeepDiveRating.getRating = function(contextName, userID, skillId, partnerUserID, ratingValue) {
    var isNumber = isNumeric(ratingValue);
    if(contextName == "user-next-steps" && isNumber && Number(ratingValue) >= UserNextActions.DEEPDIVE_RATING_LOWER_LIMIT && Number(ratingValue) <= UserNextActions.DEEPDIVE_RATING_UPPER_LIMIT){ 
        const dataObj = {
            skillId: skillId,
            partnerUserIds: partnerUserID.split(","),
            ratingLowerLimit: UserNextActions.DEEPDIVE_RATING_LOWER_LIMIT,
            ratingUpperLimit: UserNextActions.DEEPDIVE_RATING_UPPER_LIMIT
        }
        const rating = new Rating ({
            userID: userID,
            rating: Number(ratingValue),
            timeStamp: Date.now(),
            data: dataObj
        });

        rating.save()
        .then((document) => {
            const data = {
                skillId: skillId,
                partnerUserIds: partnerUserID.split(","),
            };

            UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.DEEPDIVE_FINISH_CHATBOT_RATING, userID, data);
            console.log("Rating added");
        })
        .catch((error) => {
            console.log(error);
        });

        var retJson = {
            speech: UserNextActions.RATING_VALUE_CORRECT_MESSAGE,
            displayText: UserNextActions.RATING_VALUE_CORRECT_MESSAGE,
            source: 'get-user-next-actions'
        }
        return retJson;
    }
    else{
        var contextOut1 = [{"name":"user-next-steps", "lifespan":1, "parameters":{"userID":userID,"skillId": skillId,"partnerUserID":partnerUserID,"contextName":"user-next-steps"}}];
        var retJson = {
            speech: UserNextActions.RATING_VALUE_INCORRECT_MESSAGE,
            displayText: UserNextActions.RATING_VALUE_INCORRECT_MESSAGE,
            data: [],
            contextOut: contextOut1,
            source: 'get-user-next-actions'
        }
        return retJson;
    }
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = HelperGetDeepDiveRating;