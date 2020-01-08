var Mongoose = require('mongoose');

var UserActivityContainer = require('../models/userActivityContainer');

const ActivitiesHelper = require('../helpers/helper_activities')

const MaxActivitiesToStore = 100;

const TransformActivitiesArrayToMap = (listActivities) => {
  let activitiesMap = {};

  for (let i = 0; i < listActivities.length; ++i) {
    activitiesMap[listActivities[i].userID] = listActivities[i];
  }

  return activitiesMap;
}

exports.add_activity = function(req, res) {
  const _userId = req.body.userID;
  let _activity = req.body.activity;

  if (!_userId || !_activity) {
    res.sendStatus(400);
  }

  ActivitiesHelper.addActivity(_userId, _activity)
}

exports.mark_activity_seen_by_user = function(req, res) {
  const _userId = req.body.userID;
  const _activityId = req.body.activityID;
  const _witnessId = req.body.witnessID;

  if (!_userId || !_activityId || !_witnessId) {
    res.sendStatus(400);
  }

  //1. Try to find activities for given userId
  UserActivityContainer.findOne({ userID: _userId }, function(err, userActivitiesFound) {
    if (err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    }
    else {
      if (userActivitiesFound) {
        
        if (userActivitiesFound.activities) {
          
          for (let i = 0; i < userActivitiesFound.activities.length; ++i) {
            let currentActivity = userActivitiesFound.activities[i];
            console.log("userActivitiesFound: activityID: " + _activityId);
            console.dir(currentActivity);

            //2. Try to find activity by given activityId
            if (currentActivity.activity._id == _activityId) {
              if (currentActivity.activity.witnessIDs) {
                //3. If this user haven't seen this activity yet, add it to list of witnesses
                if (currentActivity.activity.witnessIDs.indexOf(_witnessId) == -1) {
                  currentActivity.activity.witnessIDs.push(_witnessId);
                }
              }
              //4. If noone have seen this activity yet, add the first witness
              else {
                currentActivity.activity.witnessIDs = [_witnessId];
              }
              //TODO: Investigate more effecient way for replacin array elements data
              userActivitiesFound.activities.splice(i, 1, currentActivity);
              
              break;
            }
          }
        }

        userActivitiesFound.save(function(err, userActivities) {
          if(err) {
            console.log(err);  // handle errors!
            res.sendStatus(500);
          } else {
            res.sendStatus(200);
          }
        });
      }
      else {
        res.sendStatus(404);
      }
    }
  });
}

exports.get_activities = function(req, res) {
  if (!req.query.id) {
    res.sendStatus(400);
  }

  let userIds = [];
  
    let userIdsNotParsed = req.query.id;
  
    if (userIdsNotParsed.length) {
      userIds = userIds.concat(userIdsNotParsed);
    }
    else {
      userIds.push(userIdsNotParsed);
    }

  let query = {};

  if (userIds.length > 0) {
    let queryConditions = [];

    for (let i = 0; i < userIds.length; ++i) {
      queryConditions.push({userID: userIds[i]});
    }

    query = {$or: queryConditions};
  }

  console.dir(query);

  UserActivityContainer.find(query, function (err, userActivitiesFound) {
    if (err)
    {
      console.error(err);
      res.sendStatus(500);
    }
    
    res.send(req.query.doNotTransform ? userActivitiesFound : TransformActivitiesArrayToMap(userActivitiesFound));
  })
};

exports.get_activities_all = function(req, res) {
  UserActivityContainer.find({}, function (err, userActivitiesFound) {
    if (err)
    {
      console.error(err);
      res.sendStatus(500);
    }
    
    res.send(TransformActivitiesArrayToMap(userActivitiesFound));
  })
};

exports.drop_activities_for_user = function(req, res) {
  const _userId = req.query.id;

  if (!_userId) {
    res.sendStatus(400);
  }

  UserActivityContainer.remove({userID: _userId}, function (err, userActivitiesFound) {
    if (err)
    {
      console.error(err);
      res.sendStatus(500);
    }
    
    res.sendStatus(200);
  })
};