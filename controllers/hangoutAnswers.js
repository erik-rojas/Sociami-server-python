var Mongoose = require('mongoose');

var HangoutAnswer = require('../models/deepdive/hangoutAnswer');

const Task = require('../models/task');

const TaskTypes = require('../helpers/TaskTypes');
const UserAchievementHelper = require('../helpers/helper_userAchievement');

const ProgressionManager = require('../utils/progression/ProgressionManager');

const PubSub = require('pubsub-js');

const UserInteractionsHelper = require("../helpers/UserInteractions");
const HelperPubSub = require("../helpers/helper_pubsub");

exports.get_answers = function (req, res) {
  const userId = req.query.userId;
  const taskId = req.query.taskId;

  let query = {};

  if (userId && taskId) {
    query = { $and: [{ userID: userId }, { taskID: taskId }] };
  }
  else if (userId) {
    query = { userID: userId };
  }
  else if (taskId) {
    query = { taskID: taskId };
  }

  HangoutAnswer.find(query, function (err, answers) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }

    res.status(200);
    res.send(answers);
  })
};

exports.get_answer_for_task = function (req, res) {
  const taskId = req.query.taskId;

  if (!taskId) {
    res.sendStatus(500);
  }

  HangoutAnswer.findOne({ taskID: taskId }, function (err, answer) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }

    if (answer) {
      res.status(200);
      res.send(answer);
    }
    else {
      res.sendStatus(404);
    }
  });
};

exports.get_answers_for_users = function (req, res) {
  const userId = req.query.userId;
  const taskId = req.query.taskId;

  let userIDs = [];

  let userIDsNotParsed = userId;

  if (userIDsNotParsed.length) {
    userIDs = userIDs.concat(userIDsNotParsed);
  }
  else {
    userIDs.push(userIDsNotParsed);
  }

  let query = {};

  if (userId && taskId) {
    query = { $and: userIDs };
  }
  else if (userId) {
    query = { userID: userId };
  }
  else if (taskId) {
    query = { taskID: taskId };
  }

  HangoutAnswer.find(query, function (err, answers) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }

    res.status(200);
    res.send(answers);
  })
};

exports.get_answers_by_questions = function (req, res) {
  if(!req.query.questionIds){
    res.status(200);
    res.send([]);
  }else{
    const questionIds = req.query.questionIds.split(',');
    HangoutAnswer.find({}, function (err, answers) {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      }
      let userAnswers = answers.map(a => a.userAnswers);
      userAnswers = userAnswers.reduce((flat, next) => flat.concat(next), []);
      userAnswers = userAnswers.filter(ua => ua._id !== req.query.partnerId && ua._id !== req.query.myId).map(ua => ua.answers);
      userAnswers = userAnswers.reduce((prev, cur) => {
        if (cur) {
          const answersPerQuestion = questionIds.filter(qid => cur[qid]).map(id => {
            return { questionId: id, answer: cur[id] }
          });
          if (answersPerQuestion.length > 0)
            answersPerQuestion.map(a => prev.push(a));
        }
        return prev;
      }, []);
  
      res.status(200);
      userAnswers = userAnswers.filter(ua => ua.answer.text !== '').sort(() => .5 - Math.random())
      res.send(userAnswers);
    })
  }
};

exports.save_answers = function (req, res) {
  const userId = req.body.userId;
  const taskId = req.body.taskId;
  const roadmapId = req.body.roadmapId;
  const answers = req.body.answers;

  if (!userId || !taskId || !answers) {
    res.sendStatus(400);
    return;
  }

  let hangooutAnswerToSave = undefined;

  HangoutAnswer.findOne({ taskID: taskId }, function (err, hangooutAnswer) {
    if (err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    }
    else {
      if (hangooutAnswer) {
        const foundUserIndex = hangooutAnswer.userAnswers.findIndex(function (userAnswer) {
          return userAnswer._id == userId;
        });

        if (foundUserIndex != -1) {
          hangooutAnswer.userAnswers.splice(foundUserIndex, 1);
          hangooutAnswer.userAnswers.push({ _id: userId, answers: answers });
        }
        else {
          hangooutAnswer.userAnswers.push({ _id: userId, answers: answers });
        }

        hangooutAnswerToSave = hangooutAnswer;
      }
      else {
        hangooutAnswerToSave = new HangoutAnswer({
          taskID: taskId,
          userAnswers: [{ _id: userId, answers: answers }],
        });
      }

      if (hangooutAnswerToSave) {
        hangooutAnswerToSave.save(function (err) {
          if (!err) {
            //check, if all the parties have submitted their answers, and set task's status correspondingly:
            HelperPubSub.broadcastEventAnswerUpdated({taskId: taskId});
            Task.findById(taskId, async function (error, foundTask) {
              if (!error) {
                if (foundTask && (foundTask.type === TaskTypes.DEEPDIVE || foundTask.type === TaskTypes.ILLUMINATE
                  || foundTask.type === TaskTypes.DECODE)) {
                  if (hangooutAnswerToSave.userAnswers.length == foundTask.metaData.participants.length) {

                    // skip finished status for illuminate since no need to rate the partner
                    foundTask.status = foundTask.type === TaskTypes.DEEPDIVE ? "finished" : "complete";
                    foundTask.timeStatusChanged = Date.now();

                    if (foundTask.type === TaskTypes.ILLUMINATE && foundTask.status === "complete") {
                      await ProgressionManager.add_tokens_to_users(1, foundTask.metaData.participants.map((participant) => {
                        return participant.user._id;
                      }), { source: { illuminate: { _id: foundTask._id, name: foundTask.name } } });

                      UserAchievementHelper.update_user_achievement({
                        userId,
                        body: {
                          taskId: roadmapId,
                          taskType: "Illuminate",
                          achievementType: "task"
                        }
                      })

                      ProgressionManager.increment_task_count(roadmapId, userId, 'Illuminate')
                    }

                    if (foundTask.type === TaskTypes.DECODE && foundTask.status === "complete") {
                     /* await ProgressionManager.add_tokens_to_users(1, foundTask.metaData.participants.map((participant) => {
                        return participant.user._id;
                      }), { source: { illuminate: { _id: foundTask._id, name: foundTask.name } } });*/

                      ProgressionManager.increment_task_count(roadmapId, userId, 'Decode')
                    }

                    foundTask.save(function (err) {
                      if (!err) {
                        let awardXP = foundTask.metaData.awardXP;
                        if (awardXP) {
                          let promises = [];

                          for (let i = 0; i < foundTask.metaData.participants.length; ++i) {
                            promises.push(ProgressionManager.add_user_xp_for_progression_tree(foundTask.metaData.participants[i].user._id,
                              Object.assign({}, foundTask.metaData.subject.roadmap, { difficulty: foundTask.difficulty })).then(function (value) { }));

                            var tempPartnerUserIds = [];

                            for (let count = 0; count < foundTask.metaData.participants.length; count++) {
                              if (foundTask.metaData.participants[i].user._id != foundTask.metaData.participants[count].user._id) {
                                tempPartnerUserIds.push(foundTask.metaData.participants[count].user._id);
                              }
                            }

                            if (foundTask.type === TaskTypes.DEEPDIVE && foundTask.status == "finished") {
                              const data = {
                                skillId: foundTask.metaData.subject.skill._id,
                                partnerUserIds: tempPartnerUserIds,
                              };

                              const userId = foundTask.metaData.participants[i].user._id;
                              ProgressionManager.increment_task_count(roadmapId, userId, 'Deepdive')
                              promises.push(UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE,
                                UserInteractionsHelper.SubTypes.DEEPDIVE_FINISH, userId, data));
                            }
                          }
                          if (promises.length > 0) {
                            Promise.all(promises)
                              .then(function (values) {

                                if (foundTask.type === TaskTypes.DEEPDIVE) {
                                  const userIds = foundTask.metaData.participants.filter((participant) => {
                                    return participant.user._id != userId;
                                  }).map((participant) => {
                                    return participant.user._id.toString();
                                  });
                                  HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: foundTask });
                                }

                                res.status(200);
                                res.send(foundTask);
                              })
                              .catch(function (error) {
                                console.log(error);
                                res.sendStatus(500);
                              });
                          }
                          else {
                            res.sendStatus(200);
                          }
                        }
                        else {
                          res.sendStatus(200);
                        }
                      }
                      else {
                        console.log(err);
                        res.sendStatus(500);
                      }
                    });
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
          else {
            console.log(err);  // handle errors!
            res.sendStatus(500);
          }
        });
      }
      else {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      }
    }
  });
};

exports.drop_answers = function (req, res) {
  const userId = req.query.userId;
  const taskId = req.query.taskId;

  if (!userId || !taskId) {
    res.sendStatus(400);
  }


  HangoutAnswer.remove({ $and: [{ userID: userId }, { taskID: taskId }] }, function (err) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }

    res.sendStatus(200);
  })
};

exports.test_give_xp = function (req, res) {
  ProgressionManager.add_user_xp_for_progression_tree("5a44d0d28eee311749d45ffd",
    { _id: "5a39025a551d6b3853a1db1e", name: "Data Scientist", difficulty: 2 }).then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
};