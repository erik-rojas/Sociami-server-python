const Routes = require('express').Router();

const PubSub = require('pubsub-js');

const SocialRequest = require('../models/socialRequests');
const Task = require('../models/task');
const UserProfile = require('../models/userProfile');

const ActivitiesHelper = require('../helpers/helper_activities');
const ActivityTypes = require('../helpers/activityTypes');
const UserAchievementHelper = require('../helpers/helper_userAchievement');

const HangoutsManager = require('../utils/HangoutsManager');

const UserInteractionsHelper = require("../helpers/UserInteractions");

const ProgressionManager = require('../utils/progression/ProgressionManager');

const HelperPubSub = require("../helpers/helper_pubsub");

exports.join = function (req, res) {
    const _user = req.body.user;
    const _hangoutID = req.body.hangoutID;

    console.log("join_accept");

    if (!_user || !_hangoutID) {
        res.sendStatus(400);
    }
    else {
        Task.findById(_hangoutID, function (error, foundHangout) {
            if (!error) {
                if (foundHangout && foundHangout.type == "hangout") {
                    if (foundHangout.metaData.participants.findIndex(function (participant) {
                        return participant.user._id == _user._id;
                    }) == -1) {
                        foundHangout.metaData = Object.assign({}, foundHangout.metaData, {
                            participants: foundHangout.metaData.participants.concat(
                                [{ status: "pending", user: _user }]
                            )
                        });
                        foundHangout.status = "None";
                        foundHangout.save(function (error) {
                            if (!error) {
                                const userIds = foundHangout.metaData.participants.filter((participant) => {
                                    return participant.user._id != _user._id;;
                                }).map((participant) => {
                                    return participant.user._id.toString();
                                });
                                
                                let data = {
                                    taskId: foundHangout._id,
                                    roadmapId: foundHangout.metaData.subject.roadmap._id,
                                    skillId: foundHangout.metaData.subject.skill._id
                                }

                                UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.DEEPDIVE_JOIN, _user._id, data)
                                    .then((document) => {
                                        console.log("User Interaction of DeepDive Join for User Id - " + _user._id);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });

                                HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: foundHangout });

                                res.status(200);
                                res.send(foundHangout);
                            }
                            else {
                                console.log(error);
                                res.sendStatus(500);
                            }
                        })
                    }
                    else {
                        res.sendStatus(200);
                    }
                }
                else {
                    res.sendStatus(404);
                }
            }
            else {
                console.log(error);
                res.sendStatus(500);
            }
        });
    }
}

exports.leave = function (req, res) {
    const _user = req.body.user;
    const _hangoutID = req.body.id;

    if (!_user || !_hangoutID) {
        res.sendStatus(400);
    }
    else {
        Task.findById(_hangoutID, function (error, foundHangout) {
            if (!error) {
                if (foundHangout && foundHangout.type == "hangout") {
                    const foundParticipantIndex = foundHangout.metaData.participants.findIndex(function (participant) {
                        return participant.user._id == _user._id;
                    });

                    if (foundParticipantIndex == -1) {
                        res.sendStatus(404);
                    }
                    else {
                        foundHangout.metaData = Object.assign({}, foundHangout.metaData, {
                            participants: foundHangout.metaData.participants.filter(function (item, index) {
                                return index != foundParticipantIndex;
                            })
                        });

                        let isCancelledAutomatically = false;

                        if (foundHangout.metaData.participants.length < 2) {
                            foundHangout.status = "cancelled";
                            foundHangout.timeStatusChanged = Date.now();
                            isCancelledAutomatically = true;
                        }

                        foundHangout.save(function (error) {
                            if (!error) {
                                if (isCancelledAutomatically) {
                                    ActivitiesHelper.addActivity(foundHangout.metaData.participants[0].user._id,
                                        ActivitiesHelper.generateActivity(ActivityTypes.TASK_STATUS_CHANGED,
                                            {
                                                userID: foundHangout.metaData.participants[0].user._id,
                                                task: foundHangout,
                                                subType: "cancelled_automatically",
                                            }));
                                }

                                UserProfile.findOne({ _id: req.body.user._id }, function (err, foundUserProfile) {
                                    if (err) {
                                        console.log(err);  // handle errors!
                                        res.sendStatus(500);
                                    }
                                    else {
                                        if (!foundUserProfile) {
                                            res.sendStatus(404);
                                        }

                                        const foundHangoutIndexInUserProfile = foundUserProfile.hangouts.findIndex(function (hangout) {
                                            return hangout._id == foundHangout._id;
                                        });

                                        foundUserProfile.hangouts = foundUserProfile.hangouts.filter(function (hangout, i) {
                                            return i != foundHangoutIndexInUserProfile;
                                        });

                                        foundUserProfile.save(function (err) {
                                            if (err) {
                                                console.log(err);  // handle errors!
                                                res.sendStatus(500);
                                            } else {

                                                ActivitiesHelper.addActivity(foundHangout.metaData.participants[0].user._id,
                                                    ActivitiesHelper.generateActivity(ActivityTypes.USER_TASK_ACTION,
                                                        {
                                                            userID: foundHangout.metaData.participants[0].user._id,
                                                            userActor: {
                                                                _id: foundUserProfile._id,
                                                                firstName: foundUserProfile.profile.firstName,
                                                                lastName: foundUserProfile.profile.lastName
                                                            },
                                                            task: foundHangout,
                                                            subType: "leave",
                                                        }));

                                                const userIds = foundHangout.metaData.participants.filter((participant) => {
                                                    return participant.user._id != _user._id;;
                                                }).map((participant) => {
                                                    return participant.user._id.toString();
                                                });

                                                HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: foundHangout });

                                                res.status(200);
                                                res.send(foundHangout);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                console.log(error);
                                res.sendStatus(500);
                            }
                        })
                    }
                }
                else {
                    res.sendStatus(404);
                }
            }
            else {
                console.log(error);
                res.sendStatus(500);
            }
        });
    }
}

exports.get_social_requests = function (req, res) {
    let query = {};

    if (req.query.recepientID) {
        query = { recepientID: req.query.recepientID };
    }
    else if (req.query.requesterID) {
        query = { requesterID: req.query.requesterID };
    }

    SocialRequest.find(query, function (error, foundRequests) {
        if (!error) {
            res.send(foundRequests);
        }
        else {
            console.log(error);
            res.sendStatus(500);
        }
    });
}

exports.remove_social_requests = function (req, res) {
    SocialRequest.remove({}, function (error) {
        if (!error) {
            res.sendStatus(200);
        }
        else {
            console.log(error);
            res.sendStatus(500);
        }
    });
}

exports.join_status_change = function (req, res) {
    const _userId = req.body.userId;
    const _hangoutID = req.body.hangoutID;
    const _newStatus = req.body.status;

    if (!_userId || !_hangoutID || !_newStatus) {
        res.sendStatus(400);
    }
    else {
        Task.findById(_hangoutID, function (error, foundHangout) {
            if (!error) {
                if (foundHangout && foundHangout.type == "hangout") {
                    const index = foundHangout.metaData.participants.findIndex(function (participant) {
                        console.log(`participantID ${participant.user._id} _userID: ${_userId}`);
                        return participant.user._id == _userId;
                    });

                    if (index != -1) {
                        let participantsCopy = foundHangout.metaData.participants.slice();
                        participantsCopy[index] = Object.assign({}, foundHangout.metaData.participants[index], { status: _newStatus });

                        foundHangout.metaData = Object.assign({}, foundHangout.metaData, { participants: participantsCopy });

                        //assign a task
                        let participantsAccepted = participantsCopy.filter(function (participant) {
                            return participant.status == "accepted";
                        });

                        let newAssigneesList = participantsAccepted.map(function (participant, i) {
                            return participant.user;
                        });

                        //TODO: Alex.Z - is it correct logic?
                        //only assign if more then 1 assignee
                        if (newAssigneesList.length > 1) {
                            foundHangout.assignees = newAssigneesList;
                        }
                        else {
                            foundHangout.assignees = [];
                        }

                        foundHangout.save(function (error) {
                            if (!error) {
                                const sendResponse = function sendResponse() {
                                    const userIds = foundHangout.metaData.participants.filter((participant) => {
                                        return participant.user._id == _userId;
                                    }).map((participant) => {
                                        return participant.user._id.toString();
                                    });

                                    let data = {
                                        acceptedUserId: _userId,
                                        taskId: foundHangout._id,
                                        roadmapId: foundHangout.metaData.subject.roadmap._id,
                                        skillId: foundHangout.metaData.subject.skill._id
                                    }

                                    UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.DEEPDIVE_ACCEPT, foundHangout.userID, data)
                                    .then((document) => {
                                        console.log("User Interaction of DeepDive Accepted for User Id - " + foundHangout.userID);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });

                                    HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: foundHangout });


                                    res.status(200);
                                    res.send(foundHangout);
                                };

                                if (_newStatus == "accepted") {
                                    HangoutsManager.add_hangout_to_user_profile(participantsCopy[index].user._id, foundHangout)
                                        .then((addedHangout) => {
                                            sendResponse();
                                        })
                                        .catch((error) => {
                                            console.log(error);  // handle errors!
                                            res.sendStatus(500);
                                        });
                                }
                                else {
                                    sendResponse();
                                }
                            }
                            else {
                                console.log(error);
                                res.sendStatus(500);
                            }
                        })
                    }
                    else {
                        res.sendStatus(200);
                    }
                }
                else {
                    res.sendStatus(404);
                }
            }
            else {
                console.log(error);
                res.sendStatus(500);
            }
        });
    }
}

exports.get_all_by_id = function (req, res) {
    if (!req.query.id) {
        res.sendStatus(400);
    }

    let hangoutIds = [];

    let hangoutIdsNotParsed = req.query.id;

    if (hangoutIdsNotParsed.length) {
        hangoutIds = hangoutIds.concat(hangoutIdsNotParsed);
    }
    else {
        hangoutIds.push(hangoutIdsNotParsed);
    }

    let query = {};

    if (hangoutIds.length > 0) {
        let queryConditions = [];

        for (let i = 0; i < hangoutIds.length; ++i) {
            queryConditions.push({ _id: hangoutIds[i] });
        }

        query = { $or: queryConditions, type: "hangout" };
    }

    Task.find(query, function (err, hangoutsFound) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        }

        res.send(hangoutsFound);
    })
}

exports.rate_participant = function (req, res) {
    const _fromUser = req.body.fromUser;
    const _toUser = req.body.toUser;

    const _rate = Number(req.body.rate);

    const _hangoutID = req.body.taskId;

    if (!_hangoutID || !_fromUser || !_toUser || !_rate || !(typeof _rate == 'number' && _rate % 1 == 0 && (_rate >= 1 && _rate <= 10))) {
        res.sendStatus(400);
    }
    else {
        Task.findById(_hangoutID, async function (error, foundTask) {
            if (!error) {
                if (foundTask && foundTask.type == "hangout") {
                    let metaDataCopy = Object.assign({}, foundTask.metaData);

                    if (!metaDataCopy.ratings) {
                        metaDataCopy["ratings"] = [];
                    }

                    if (metaDataCopy.ratings.findIndex(function (rating) {
                        return rating.fromUser == _fromUser && rating.toUser == _toUser; //already rated
                    }) != 0) {
                        //not rated yet
                        metaDataCopy.ratings = metaDataCopy.ratings.concat([{ fromUser: _fromUser, toUser: _toUser, rate: _rate }]);

                        foundTask.metaData = metaDataCopy;

                        if (foundTask.metaData.ratings.length == foundTask.metaData.participants.length) {
                            //consider hangout complete
                            foundTask.status = "complete";
                            foundTask.timeStatusChanged = Date.now();
                        }

                        if (foundTask.type == "hangout" && foundTask.status == "complete") {

                            await ProgressionManager.add_tokens_to_users(10, foundTask.metaData.participants.map((participant) => {
                                return participant.user._id;
                            }), { source: { hangout: { _id: foundTask._id, name: foundTask.name } } });

                            let promises = [];

                            for (let i = 0; i < foundTask.metaData.participants.length; ++i) {

                                const data = {
                                    skillId: foundTask.metaData.subject.skill._id,
                                };

                                const userId = foundTask.metaData.participants[i].user._id;
                                promises.push(UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE,
                                    UserInteractionsHelper.SubTypes.DEEPDIVE_COMPLETE, userId, data));
                            }

                            console.log('_fromUser')
                            console.log(_fromUser)
                            UserAchievementHelper.update_user_achievement({
                                userId: _fromUser,
                                body: {
                                  taskId: foundTask.metaData.subject.roadmap._id,
                                  taskType: "Deepdive",
                                  achievementType: "task"
                                }
                              })
                            const InteractionsPushed = await Promise.all(promises).then(() => { }).catch((error) => {
                                console.log(error);
                            });
                        }

                        foundTask.save(function (error) {
                            if (!error) {
                                //add rate to user profile
                                UserProfile.findOne({ _id: _toUser }, function (err, foundUserProfile) {
                                    if (err) {
                                        console.log(err);  // handle errors!
                                        res.sendStatus(500);
                                    }
                                    else {
                                        if (!foundUserProfile) {
                                            res.sendStatus(500);
                                        }

                                        foundUserProfile.addRate(_rate);

                                        foundUserProfile.save(function (err) {
                                            if (err) {
                                                console.log(err);  // handle errors!
                                                res.sendStatus(500);
                                            }
                                            else {
                                                const userIds = foundTask.metaData.participants.filter((participant) => {
                                                    return participant.user._id == _toUser;
                                                }).map((participant) => {
                                                    return participant.user._id.toString();
                                                });
            
                                                HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: foundTask });
            
                                                res.status(200);
                                                res.send(foundTask);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                console.log(error);
                                res.sendStatus(500);
                            }
                        });
                    }
                    else {
                        res.status(304);
                        res.send(foundTask);
                    }
                }
                else {
                    res.sendStatus(404);
                }
            }
            else {
                console.log(error);
                res.sendStatus(500);
            }
        });
    }
}