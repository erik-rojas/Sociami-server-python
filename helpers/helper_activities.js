const ObjectHash = require('object-hash');

const UserActivityContainer = require('../models/userActivityContainer');
const ActivityTypes = require('../helpers/activityTypes')
const MaxActivitiesToStore = 100;

exports.addActivity = function(_userId, _activity) {

  _activity.timestamp = Date.now();

  UserActivityContainer.findOne({ userID: _userId }, function(err, userActivitiesFound) {
    if (err) {
      console.log(err);  
    }
    else {
      if (userActivitiesFound) {
        if (userActivitiesFound.activities) {
          //replace last activity, if the limit is reached
          if (userActivitiesFound.activities.length >= MaxActivitiesToStore) {
            userActivitiesFound.activities.splice(userActivitiesFound.activities.length-1, 1, _activity);
          }
          else {
            userActivitiesFound.activities.push(_activity);
          }
        }

        userActivitiesFound.save(function(err, userActivities) {
          if(err) {
            console.log(err);  // handle errors!
          } 
          else {
          }
        });
      }
      else {
        let newUserActivities = new UserActivityContainer({
          userID: _userId,
          activities: [],
        });
    
        newUserActivities.activities.push(_activity);
    
        newUserActivities.save(function(err, userActivities) {
          if(err) {
            console.log(err);  
          } else {
            console.log(`Started storing activities for userID: ${_userId}`);
          }
        });
      }
    }
  });
}

const createActivityFriendNewProject = (project, userId)=> {
  console.log("createActivityFriendNewProject");
  console.dir(project);
  let activityBody = {
    type: ActivityTypes.FRIEND_NEW_PROJECT_CREATED, 
    metadata: {
        projectID: project._id.toString(),
        projectName: project.name,
      }
  }

  activityBody._id = ObjectHash(activityBody);

  const activityNewProject = {
    userID: userId,
    activity: activityBody,
  };

  return activityNewProject;
}

const createActivityProgressionTreeStarted = (progressionTree, userId)=> {
  let activityBody = {
    type: ActivityTypes.FRIEND_PROGRESSIONTREE_STARTED, 
    metadata: {
        treeId: progressionTree._id,
        treeName: progressionTree.name,
      }
  }

  activityBody._id = ObjectHash(activityBody);

  const activityProgressiontreeStarted = {
    userID: userId,
    activity: activityBody,
  };

  return activityProgressiontreeStarted;
}

const createActivityTaskStarted = (task, userId)=> {
  let activityBody = {
    type: ActivityTypes.TASK_STARTED, 
    metadata: {
        task: {_id: task._id.toString(), name: task.name, creator: task.creator, metaData: {subject: task.metaData.subject}},
      }
  }

  activityBody._id = ObjectHash(activityBody);

  const activity = {
    userID: userId,
    activity: activityBody,
  };

  return activity;
}

const createActivityTaskCancelled = (task, userId, userActor)=> {
  let activityBody = {
    type: ActivityTypes.TASK_CANCELLED, 
    metadata: {
        task: {_id: task._id.toString(), name: task.name, creator: task.creator, metaData: {subject: task.metaData.subject}},
        userActor: userActor,
      }
  }

  activityBody._id = ObjectHash(activityBody);

  const activity = {
    userID: userId,
    activity: activityBody,
  };

  return activity;
}

const createActivityTaskStatusChanged = (data)=> {
  const task = data.task;
  let activityBody = {
    type: ActivityTypes.TASK_STATUS_CHANGED,
    subType: data.subType,
    metadata: {
        task: {_id: task._id.toString(), name: task.name, creator: task.creator, metaData: {subject: task.metaData.subject}},
        userActor: data.userActor,
      }
  }

  activityBody._id = ObjectHash(activityBody);

  const activity = {
    userID: data.userId,
    activity: activityBody,
  };

  return activity;
}

const createActivityFriendHasAddedNewFriend = (friendAdded, userId)=> {
  let activityBody = {
    type: ActivityTypes.FRIEND_NEW_FRIEND_ADDED, 
    metadata: {
        friend: friendAdded,
      }
  }

  activityBody._id = ObjectHash(activityBody);

  const activityNewFriendAdded = {
    userID: userId,
    activity: activityBody,
  };

  return activityNewFriendAdded;
}

const createActivityUserTaskAction = (data)=> {
  const task = data.task;
  let activityBody = {
    type: ActivityTypes.USER_TASK_ACTION,
    subType: data.subType,
    metadata: {
        task: {_id: task._id.toString(), name: task.name, creator: task.creator, metaData: {subject: task.metaData.subject}},
        userActor: {_id: data.userActor._id.toString(), firstName: data.userActor.firstName, lastName: data.userActor.lastName},
      }
  }

  activityBody._id = ObjectHash(activityBody);

  const activity = {
    userID: data.userId,
    activity: activityBody,
  };

  return activity;
}

exports.generateActivity = function(type, data) {
  switch (type) {
    case ActivityTypes.FRIEND_NEW_PROJECT_CREATED: {
        return createActivityFriendNewProject(data.project, data.userID);
    }
    case ActivityTypes.FRIEND_PROGRESSIONTREE_STARTED: {
        return createActivityProgressionTreeStarted(data.progressionTree, data.userID);
    }
    case ActivityTypes.FRIEND_NEW_FRIEND_ADDED: {
        return createActivityFriendHasAddedNewFriend(data.friend, data.userID);
    }
    case ActivityTypes.TASK_STARTED: {
      return createActivityTaskStarted(data.task, data.userID);
    }
    case ActivityTypes.TASK_CANCELLED: {
      return createActivityTaskCancelled(data.task, data.userID, data.userActor);
    }
    case ActivityTypes.TASK_STATUS_CHANGED: {
      return createActivityTaskStatusChanged(data);
    }
    case ActivityTypes.USER_TASK_ACTION: {
      return createActivityUserTaskAction(data);
    }
    default:
      break;
  }
}