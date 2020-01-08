const Routes = require('express').Router();

const PubSub = require('pubsub-js');

const HelperPubSub = require("../helpers/helper_pubsub");
const UserInteractionsHelper = require("../helpers/UserInteractions");
const async = require('async');
const _ = require('lodash');

const BroadcastEventTasksUpdated = (excludedUserIds) => {
  const eventObj = {
    eventType: "tasks_update",
    userIdExcludedList: excludedUserIds,
    data: {},
  };

  PubSub.publish("EVENT", eventObj);
}

var Task = require('../models/task');
var UserProfile = require('../models/userProfile');

const HangoutsManager = require('../utils/HangoutsManager');
const IlluminatesManager = require('../utils/IlluminatesManager');

const ActivitiesHelper = require('../helpers/helper_activities');
const ActivityTypes = require('../helpers/activityTypes');

const TaskTypes = require('../helpers/TaskTypes');

exports.save_task = function (req, res) {
  if (!req.query.userID || !req.query.type) {
    res.sendStatus(400);
  }
  else {
    let _userID = req.query.userID;
    let _userName = req.query.userName;
    let _roadmapID = req.query.roadmapID;
    let _roadmapName = req.query.roadmapName;
    let _type = req.query.type;

    let _name = req.query.name;
    let _description = req.query.description;
    let _price = req.query.price;
    let _date = req.query.date;

    let _isHidden = (req.query.isHidden && req.query.isHidden == 1) ? true : false;

    let _difficulty = 1;
    if (_type === TaskTypes.DEEPDIVE) {
      _difficulty = 1;
    }

    let newTask = new Task({
      userID: _userID,
      userName: _userName,
      roadmapID: _roadmapID,
      roadmapName: _roadmapName,
      type: _type,
      difficulty: _difficulty,
      name: _name,
      description: _description,
      price: _price,
      date: _date || Date.now(),
      creationDate: Date.now(),
      isHidden: _isHidden,
    });
    newTask.save(function (err, task) {
      if (err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        console.log(`Task userID: ${_userID} roadmapID: ${_roadmapID} type: ${_type} saved!`);
        BroadcastEventTasksUpdated([_userID]);
        res.status(200);
        res.send(task);
      }
    });
  }
}

exports.save_task_post = function (req, res) {
  let _userID = req.body.userID;

  let taskData = {};

  for (const key in req.body) {
    if (key != "_id") {
      taskData[key] = req.body[key];
    }
  }

  if (!taskData["awardXP"]) {
    const RandomInt = function RandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    taskData["awardXP"] = RandomInt(10, 100);
  }

  if (!_userID) {
    res.sendStatus(400);
  }
  else {
    let newTask = new Task(taskData);
    newTask.date = Date.now();
    newTask.save(function (err, task) {
      if (err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        let foundHangoutCreator = undefined;
        if (task.type === TaskTypes.DEEPDIVE && task.metaData && task.metaData.participants) {
          foundHangoutCreator = task.metaData.participants.find((participant) => {
            return participant.user._id == task.creator._id;
          });
        }

        let sendResponse = function sendResponse() {
          BroadcastEventTasksUpdated([_userID]);
          res.status(200);
          res.send(task);
        }

        if (foundHangoutCreator) {
          HangoutsManager.add_hangout_to_user_profile(foundHangoutCreator.user._id, task)
            .then((addedHangout) => {
              sendResponse();
            })
            .catch((error) => {
              console.log(error);  // handle errors!
              res.sendStatus(500);
            });
        } else if (task.type === TaskTypes.ILLUMINATE) {
          IlluminatesManager.add_illuminate_to_user_profile(task.userID, task)
            .then((addedHangout) => {
              let data = {
                roadmapId: task.metaData.subject.roadmap._id,
                skillId: task.metaData.subject.skill._id
              }
              UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.ILLUMINATE_CREATE, task.userID, data)
              .then((document) => {
                console.log("User Interaction of Illuminate for User Id - " + task.userID);
              })
              .catch((error) => {
                console.log(error);
              });
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
    });
  }
}

exports.set_task_published = function (req, res) {
  if (!req.query.id || req.query.isHidden == undefined) {
    res.sendStatus(400);
  }
  else {
    const taskId = req.query.id;
    const _isHidden = (req.query.isHidden == 1) ? true : false;

    console.log("_isHidden: " + _isHidden);

    Task.findOneAndUpdate({ '_id': taskId }, {
      isHidden: _isHidden
    },
      { upsert: true, new: true }, function (err, doc) {
        if (err) {
          console.log("err: " + err);
          return res.sendStatus(500);
        }
        if (_isHidden) {
          console.log(`Task: ${taskId} is unpublished`);
        }
        else {
          console.log(`Task: ${taskId} is published`);
        }
        BroadcastEventTasksUpdated(doc.creator._id ? [doc.creator._id] : doc.userID);
        res.status(200);
        return res.send(doc);
      });
  }
}

exports.drop_tasks = function (req, res) {
  Task.remove({}, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    else {
      console.log('collection removed')
      res.status(200);
      res.send("Collection dropped");
    }
  });
}

exports.drop_task = function (req, res) {
  const taskId = req.query.id;

  if (!taskId) {
    res.sendStatus(400);
  }
  else {
    Task.remove({ _id: taskId }, function (err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        res.status(200);
        res.send({ _id: taskId });
      }
    });
  }
}

exports.drop_tasks_by_email = function (req, res) {
  const email = _.get(req, 'query.email');

  if (email) {
    async.waterfall([
      callback => {
        UserProfile.findOne({'profile.email': email}, callback)
      },
      (user, callback) => {
        if (user) {
          Task.deleteMany({'userID': _.get(user, 'id')}, callback)
        } else {
          callback()
        }
      }
    ],
    (err, data) => {
      if (err) {
        res.sendStatus(500)
      } else {
        res.status(200);
        res.send(data);
      }
    }
  )
  } else {
    res.sendStatus(200);
  }
}

exports.get_tasks = function (req, res) {
  let taskIds = [];

  let taskIdsNotParsed = req.query.taskIds;

  if (taskIdsNotParsed) {
    if (taskIdsNotParsed.length) {
      taskIds = taskIds.concat(taskIdsNotParsed);
    }
    else {
      taskIds.push(taskIdsNotParsed);
    }

  }

  let publishedOnly = (req.query.publishedOnly && req.query.publishedOnly == 1) ? true : false;

  const query = taskIds.length > 0 ? {"_id": taskIds} : {};

  if (publishedOnly) {
    query.isHidden = false;
  }

  Task.find(query, function (err, tasks) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    else {
      res.send(tasks);
    }
  });
}

exports.get_user_tasks = function (req, res) {

  const userId = req.query.userId;
  const assigneeId = req.query.assigneeId;

  let query;
  if (userId && assigneeId) {
    query = {$or: [{userID: userId}, { "assignees._id": assigneeId }] };
  }
  else {
    if (userId) {
      query = {userID: userId};
    }
    else if (assigneeId) {
      query = {"assignees._id": assigneeId };
    }
  }


  Task.find(query, function (err, tasks) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    else {
      res.send(tasks);
    }
  });
}

exports.get_task_by_id = function (req, res) {
  const taskId = req.query.id;

  if (!taskId) {
    res.sendStatus(400);
  }
  else {
    Task.findOne({ _id: taskId }, function (err, taskFound) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        if (taskFound) {
          res.status(200);
          res.send(taskFound);
        }
        else {
          res.status(200);
          res.send({});
        }
      }
    });
  }
}

exports.is_task_has_assignees = function (req, res) {
  const taskId = req.query.id;

  if (!taskId) {
    res.sendStatus(400);
  }
  else {
    Task.findOne({ _id: taskId }, function (err, taskFound) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        res.status(200);
        res.send(taskFound && taskFound.taskAsignee ? { _id: taskFound._id, hasAssignees: true } : { _id: undefined, hasAssignees: false });
      }
    });
  }
}

exports.get_task_assignees = function (req, res) {
  let taskId = req.query.id;

  if (!taskId) {
    res.sendStatus(400);
  }
  else {
    Task.findOne({ _id: taskId }, function (err, taskFound) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        res.status(200);
        res.send(taskFound && taskFound.taskAsignee ? [taskFound.taskAsignee] : []);
      }
    });
  }
}

exports.assign_task = function (req, res) {
  const _id = req.body._id;
  const _assignee = req.body.assignee;

  if (!_id || !_assignee) {
    res.sendStatus(400);
  }
  else {
    Task.findOne({ _id: _id }, function (err, taskFound) {
      if (err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        if (taskFound) {
          if (taskFound.assignees.length == 0) {
            taskFound.assignees.push(_assignee);
          }
          else {
            if (!taskFound.assignees.find(function (assignee) {
              return assignee._id == _assignee._id;
            })) {
              taskFound.assignees.push(_assignee);
            }
          }
          taskFound.save(function (err) {
            if (!err) {
              const userIds = [_assignee._id.toString()];
              HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: task });

              res.status(200); res.send(taskFound);
            }
            else {
              console.log(err);
              res.sendStatus(500);
            }
          })
        }
        else {
          res.sendStatus(404);
        }
      }
    });
  }
}

exports.unassign_task = function (req, res) {
  const _id = req.body._id;
  const _assignee = req.body.assignee;

  if (!_id || !_assignee) {
    res.sendStatus(400);
  }
  else {
    Task.findOne({ _id: _id }, function (err, taskFound) {
      if (err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        if (taskFound) {
          let foundIndex = taskFound.assignees.findIndex(function (assignee) {
            return assignee._id == _assignee._id;
          });

          if (foundIndex != -1) {
            taskFound.assignees.splice(foundIndex, 1);
          }

          taskFound.save(function (err) {
            if (!err) {
              const userIds = [_assignee._id.toString()];
              HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: task });
              res.status(200); res.send(taskFound);
            }
            else {
              console.log(err);
              res.sendStatus(500);
            }
          })
        }
        else {
          res.sendStatus(404);
        }
      }
    });
  }
}

exports.change_task_status = function (req, res) {
  if (!req.body.id || !req.body.status) {
    res.sendStatus(400);
  }
  else {
    const taskId = req.body.id;
    const status = req.body.status;

    let data = { status: status };

    data.timeStatusChanged = Date.now();

    Task.findOneAndUpdate({ '_id': taskId }, data, { upsert: true, new: true }, function (err, task) {
      if (err) {
        console.log("err: " + err);
        return res.sendStatus(500);
      }

      if (task.type === TaskTypes.DEEPDIVE) {
        if (status == "started") {
          for (let i = 0; i < task.metaData.participants.length; ++i) {
            if (task.metaData.participants[i].isCreator) {
              continue;
            }

            let data = {
              taskId: task._id,
              roadmapId: task.metaData.subject.roadmap._id,
              skillId: task.metaData.subject.skill._id
            }

            UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.DEEPDIVE_BEGIN, task.userID, data)
              .then((document) => {
                console.log("User Interaction of DeepDive Begin for User Id - " + task.userID);
              })
              .catch((error) => {
                console.log(error);
              });

            ActivitiesHelper.addActivity(task.metaData.participants[i].user._id, ActivitiesHelper.generateActivity(ActivityTypes.TASK_STATUS_CHANGED, {
              userID: task.metaData.participants[i].user._id,
              task: task,
              subType: status,
            }));
          }
        }

        if(status == "canceled"){
          let data = {
            roadmapId: task.metaData.subject.roadmap._id,
            skillId: task.metaData.subject.skill._id
          }
          UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.DEEPDIVE_CANCEL, task.userID, data)
              .then((document) => {
                console.log("User Interaction of DeepDive Cancel for User Id - " + task.userID);
              })
              .catch((error) => {
                console.log(error);
              });
        }

        const userIds = task.metaData.participants.filter((participant) => {
          return !participant.isCreator;
        }).map((participant) => {
          return participant.user._id.toString();
        });

        HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: task });
      }
      res.status(200);
      return res.send(task);
    });
  }
}

exports.leave_task = function (req, res) {
  if (!req.body.id || !req.body.user) {
    res.sendStatus(400);
  }
  else {
    const taskId = req.body.id;
    const user = req.body.user;

    let data = { status: "cancelled" };

    Task.findOneAndUpdate({ '_id': taskId }, data, { upsert: true, new: true }, function (err, task) {
      if (err) {
        console.log("err: " + err);
        return res.sendStatus(500);
      }

      if (task.type === TaskTypes.DEEPDIVE) {
        const userIds = task.metaData.participants.filter((participant) => {
          return !participant.isCreator;
        }).map((participant) => {
          return participant.user._id.toString();
        });

        HelperPubSub.broadcastEventTaskUpdated({ userIdList: userIds, task: task });

        for (let i = 0; i < task.metaData.participants.length; ++i) {
          if (task.metaData.participants[i].isCreator) {
            ActivitiesHelper.addActivity(task.metaData.participants[i].user._id, ActivitiesHelper.generateActivity(ActivityTypes.TASK_STATUS_CHANGED, {
              userID: task.metaData.participants[i].user._id,
              task: task,
              userActor: user,
              subType: "cancelled",
            }));
            break;
          }
        }
      }
      res.status(200);
      return res.send(task);
    });
  }
}
