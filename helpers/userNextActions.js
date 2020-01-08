const UserNextActions = {
    NEXT_STEPS_DATA: [
        {
            type:"page_open",subType:"progression_tree_view",
            messageForNextStep:"Hi ##name##, Welcome to Soqqle. It seems you have viewed a Progression View for a course. Next step would be to prepare for a Deep Dive into the course.",
        },
        {
            type:"action_execute",subType:"deepdive_finish",
            messageForNextStep:"Hi ##name##, Welcome to Soqqle. I hope you enjoyed your deep dive with ##usernames## for the skill ##skillname##. How would you rate the questions from 1-5 (1 being boring and unhelpful, 5 being really cool and exciting)",
        }
    ],
    DEFAULT_MESSAGE: "<div>Hi ##name##, Welcome to Soqqle. Browse progression trees <span class='descriptionForTerms'>(?)<span class='tooltipContent'>Progression trees are learning roadmaps that will guide you towards mastery of a skill that you can choose</span></span> to discover starter-kits to next-generation high-tech skills. <a href='/'>GO</a><br><img src='http://cdn.osxdaily.com/wp-content/uploads/2013/07/dancing-banana.gif' style='width:200px;' /></div>",
    ERROR_MESSAGE: "ERROR: ",
    RATING_VALUE_INCORRECT_MESSAGE: "Please give a rating from 1-5 (1 being boring and unhelpful, 5 being really cool and exciting)",
    RATING_VALUE_CORRECT_MESSAGE: "Thanks for chatting! Seeya!",
    DEEPDIVE_RATING_LOWER_LIMIT: 1,
    DEEPDIVE_RATING_UPPER_LIMIT: 5,
}

module.exports = UserNextActions;