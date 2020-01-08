const UserProfile = require('../models/userProfile');
const UserInteractions = require('../models/userInteractions');
const Skills = require('../models/deepdive/skills');
const Roadmap = require('../models/deepdive/roadmap');

var async = require('async');

exports.getUsersByName = function (req, res) {
    if (!req.body.nameSearchText) {
        res.sendStatus(400);
    }
    else {
        UserProfile.find({ 'profile.firstName': { '$regex': req.body.nameSearchText, '$options': 'i' } }, function (err, searchResults) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            if (searchResults) {
                res.status(200);
                res.send(searchResults);
            }
            else {
                res.status(404);
                res.send([]);
            }
        })
    }
};

exports.getProgressionTreesData = async function (req, res) {
    if (!req.body.progressionTreesUserId) {
        res.sendStatus(400);
    }
    else {
        try{
            searchResults = await UserInteractions.find({ 'userID': req.body.progressionTreesUserId, type: "action_execute", subType: { $in: ['progression_tree_removed', 'progression_tree_added'] } }).sort({timeStamp: -1});
            if (searchResults) {
                var results = [];
                for(var i=0; i<searchResults.length; i++){
                    var progressionTree = await Roadmap.findOne({ _id: searchResults[i].data.progressionTreeId});
                    var progressionTreeName = "";
                    if (progressionTree) {
                        var progressionTreeName = progressionTree.name;
                    }
                    var type = searchResults[i].subType == "progression_tree_added" ? "Progression Tree Added" : "Progression Tree Removed";
                    var result = {
                        type: type,
                        progressionTreeName: progressionTreeName,
                        timestamp: searchResults[i].timeStamp
                    }
                    results.push(result);
                }

                res.status(200);
                res.send(results);
            }

            else {
                res.status(404);
                res.send([]);
            }

        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};

exports.getCreatedTasks = async function (req, res) {
    if (!req.body.createdTasksUserId) {
        res.sendStatus(400);
    }
    else {
        try {
            searchResults = await UserInteractions.find({ userID: req.body.createdTasksUserId, type: 'action_execute', subType: { $in: ['illuminate_create', 'deepdive_start'] } }).sort({timeStamp: -1})
            if (searchResults) {
                var results = [];
                for(var i=0; i<searchResults.length; i++){
                    var skill = await Skills.findOne({ _id: searchResults[i].data.skillId });
                    var skillName = "";
                    if (skill) {
                        skillName = skill.skill;
                    }

                    var roadmap = await Roadmap.findOne({ _id: searchResults[i].data.roadmapId});
                    var roadmapName = "";
                    if(roadmap){
                        roadmapName = roadmap.name;
                    }
                    if(searchResults[i].subType === "deepdive_start"){
                        var result = {
                            type: "DeepDive",
                            skillName: skillName,
                            roadmapName: roadmapName,
                            deepdiveTime: searchResults[i].data.deepdiveTime,
                            timeCreated: searchResults[i].timeStamp
                        }
                    }
                    else if(searchResults[i].subType === "illuminate_create"){
                        var result = {
                            type: "Illuminate",
                            skillName: skillName,
                            roadmapName: roadmapName,
                            timeCreated: searchResults[i].timeStamp
                        }
                    }
                    results.push(result);
                }

                res.status(200);
                res.send(results);
            }

            else {
                res.status(404);
                res.send([]);
            }
        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};

exports.getCanceledTasks = async function (req, res) {
    if (!req.body.canceledTasksUserId) {
        res.sendStatus(400);
    }
    else {
        try {
            searchResults = await UserInteractions.find({ userID: req.body.canceledTasksUserId, type: 'action_execute', subType: 'deepdive_cancel'}).sort({timeStamp: -1})
            if (searchResults) {
                var results = [];
                for(var i=0; i<searchResults.length; i++){
                    var skill = await Skills.findOne({ _id: searchResults[i].data.skillId });
                    var skillName = "";
                    if (skill) {
                        skillName = skill.skill;
                    }

                    var roadmap = await Roadmap.findOne({ _id: searchResults[i].data.roadmapId});
                    var roadmapName = "";
                    if(roadmap){
                        roadmapName = roadmap.name;
                    }
                    
                    var result = {
                        type: "Deepdive",
                        skillName: skillName,
                        roadmapName: roadmapName,
                        timeCanceled: searchResults[i].timeStamp
                    }
                    results.push(result);
                }

                res.status(200);
                res.send(results);
            }

            else {
                res.status(404);
                res.send([]);
            }
        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};

exports.getJoinedTasks = async function (req, res) {
    if (!req.body.joinedTasksUserId) {
        res.sendStatus(400);
    }
    else {
        try {
            searchResults = await UserInteractions.find({ userID: req.body.joinedTasksUserId, type: 'action_execute', subType: 'deepdive_join'}).sort({timeStamp: -1})
            if (searchResults) {
                var results = [];
                for(var i=0; i<searchResults.length; i++){
                    var skill = await Skills.findOne({ _id: searchResults[i].data.skillId });
                    var skillName = "";
                    if (skill) {
                        skillName = skill.skill;
                    }

                    var roadmap = await Roadmap.findOne({ _id: searchResults[i].data.roadmapId});
                    var roadmapName = "";
                    if(roadmap){
                        roadmapName = roadmap.name;
                    }
                    
                    var result = {
                        taskId: searchResults[i].data.taskId,
                        skillName: skillName,
                        roadmapName: roadmapName,
                        timeJoined: searchResults[i].timeStamp
                    }
                    results.push(result);
                }

                res.status(200);
                res.send(results);
            }

            else {
                res.status(404);
                res.send([]);
            }
        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};

exports.getAcceptedTasks = async function (req, res) {
    if (!req.body.acceptedTasksUserId) {
        res.sendStatus(400);
    }
    else {
        try {
            searchResults = await UserInteractions.find({ userID: req.body.acceptedTasksUserId, type: 'action_execute', subType: 'deepdive_accept'}).sort({timeStamp: -1})
            if (searchResults) {
                var results = [];
                for(var i=0; i<searchResults.length; i++){

                    var userProfile = await UserProfile.findOne({ _id: searchResults[i].data.acceptedUserId });
                    var userName = "";
                    if (userProfile) {
                        userName = userProfile.profile.firstName + " " + userProfile.profile.lastName;
                    }

                    var skill = await Skills.findOne({ _id: searchResults[i].data.skillId });
                    var skillName = "";
                    if (skill) {
                        skillName = skill.skill;
                    }

                    var roadmap = await Roadmap.findOne({ _id: searchResults[i].data.roadmapId});
                    var roadmapName = "";
                    if(roadmap){
                        roadmapName = roadmap.name;
                    }
                    
                    var result = {
                        taskId: searchResults[i].data.taskId,
                        userName: userName,
                        skillName: skillName,
                        roadmapName: roadmapName,
                        timeAccepted: searchResults[i].timeStamp
                    }
                    results.push(result);
                }

                res.status(200);
                res.send(results);
            }

            else {
                res.status(404);
                res.send([]);
            }
        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};

exports.getStartedTasks = async function (req, res) {
    if (!req.body.startedTasksUserId) {
        res.sendStatus(400);
    }
    else {
        try {
            searchResults = await UserInteractions.find({ userID: req.body.startedTasksUserId, type: 'action_execute', subType: 'deepdive_begin'}).sort({timeStamp: -1})
            if (searchResults) {
                var results = [];
                for(var i=0; i<searchResults.length; i++){

                    var skill = await Skills.findOne({ _id: searchResults[i].data.skillId });
                    var skillName = "";
                    if (skill) {
                        skillName = skill.skill;
                    }

                    var roadmap = await Roadmap.findOne({ _id: searchResults[i].data.roadmapId});
                    var roadmapName = "";
                    if(roadmap){
                        roadmapName = roadmap.name;
                    }
                    
                    var result = {
                        taskId: searchResults[i].data.taskId,
                        skillName: skillName,
                        roadmapName: roadmapName,
                        timeStarted: searchResults[i].timeStamp
                    }
                    results.push(result);
                }

                res.status(200);
                res.send(results);
            }

            else {
                res.status(404);
                res.send([]);
            }
        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};

exports.getLoginLogoutInteractions = async function (req, res) {
    if (!req.body.loginLogoutSearchUserId) {
        res.sendStatus(400);
    }
    else {
        try {
            searchResults = await UserInteractions.find({ userID: req.body.loginLogoutSearchUserId, type: 'action_execute', subType: { $in: ['login_facebook', 'login_linkedin','logout'] } }).sort({timeStamp: -1});
            if (searchResults) {
                res.status(200);
                res.send(searchResults);
            }

            else {
                res.status(404);
                res.send([]);
            }
        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};

exports.getCharacterCreation = async function (req, res) {
    if (!req.body.characterCreationUserId) {
        res.sendStatus(400);
    }
    else {
        try {
            var characterCreationData = {};
            searchResults = await UserInteractions.find({ userID: req.body.characterCreationUserId, type: 'action_execute', subType: { $in: ['account_created_facebook', 'account_created_linkedin','character_trait_selected','character_name_selected'] } });
            if (searchResults) {
                for(var i=0; i<searchResults.length; i++){
                    if(searchResults[i].subType == "account_created_facebook"){
                        characterCreationData = Object.assign({}, characterCreationData, {accountCreated: "facebook", accountCreatedTimestamp : searchResults[i].timeStamp});
                    }
                    if(searchResults[i].subType == "account_created_linkedin"){
                        characterCreationData = Object.assign({}, characterCreationData, {accountCreated: "linkedin", accountCreatedTimestamp : searchResults[i].timeStamp});
                    }
                    if(searchResults[i].subType == "character_trait_selected"){
                        characterCreationData = Object.assign({}, characterCreationData, {traitSelectedTimestamp: searchResults[i].timeStamp});
                    }
                    if(searchResults[i].subType == "character_name_selected"){
                        characterCreationData = Object.assign({}, characterCreationData, {nameSelectedTimestamp: searchResults[i].timeStamp});
                    }
                }
            }

            profileData = await UserProfile.findOne({ _id: req.body.characterCreationUserId});
            if(profileData){
                console.dir(profileData.profile);
                characterCreationData = Object.assign(
                    {}, characterCreationData, 
                    {
                        name: profileData.profile.firstName + " " + profileData.profile.lastName, 
                        facebookId : profileData.facebookID, 
                        linkedInId: profileData.linkedInID
                    }
                );

                if(profileData.profile.character && profileData.profile.character.traitsName){
                    characterCreationData = Object.assign({}, characterCreationData, {characterTrait: profileData.profile.character.traitsName});
                }

                if(profileData.profile.character && profileData.profile.character.characterName){
                    characterCreationData = Object.assign({}, characterCreationData, {characterName: profileData.profile.character.characterName});
                }

                res.status(200);
                res.send(characterCreationData);
            }
            else {
                res.status(404);
                res.send([]);
            }


        }
        catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
};