//this should correspond to same file in front-end
const UserInteraction = require('../models/userInteractions');

const UserInteractions = {
    Types: {
        PAGE_OPEN: "page_open",
        PAGE_CLOSE: "page_close",
        ACTION_EXECUTE: "action_execute",
    },
    SubTypes: {
        LOGIN_FACEBOOK: "login_facebook",
        LOGIN_LINKEDIN: "login_linkedin",
        LOGOUT: "logout",
        ACCOUNT_CREATED_FACEBOOK: "account_created_facebook",
        ACCOUNT_CREATED_LINKEDIN: "account_created_linkedin",

        CHARACTER_TRAIT_SELECTED: "character_trait_selected",
        CHARACTER_NAME_SELECTED: "character_name_selected",

        PROGRESSION_TREE_ADDED : "progression_tree_added",
        PROGRESSION_TREE_REMOVED: "progression_tree_removed",

        SKILL_VIEW: "skill_view",

        PROG_TREE_VIEW: "progression_tree_view", 

        ILLUMINATE_CREATE: "illuminate_create",

        DEEPDIVE_PREPARE: "deepdive_prepare",
        DEEPDIVE_START: "deepdive_start",
        DEEPDIVE_FINISH: "deepdive_finish",
        DEEPDIVE_COMPLETE: "deepdive_complete",
        DEEPDIVE_CANCEL: "deepdive_cancel",
        DEEPDIVE_JOIN: "deepdive_join",
        DEEPDIVE_ACCEPT: "deepdive_accept",
        DEEPDIVE_BEGIN: "deepdive_begin",
        DEEPDIVE_FINISH_CHATBOT_RATING: "deepdive_finish_chatbot_rating",
    },

    pushInteraction: function pushInteraction(type, subtype, userId, data = null) {
        const userInteraction = new UserInteraction({
            userID: userId,
            type: type,
            subType: subtype,
            timeStamp: Date.now(),
            data: data,
        });

        return userInteraction.save();
    }
}

module.exports = UserInteractions;