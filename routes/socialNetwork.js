const Routes = require('express').Router();

const ActivitiesHelper = require('../helpers/helper_activities');
const ActivityTypes = require('../helpers/activityTypes');

const SocialNetworkController = require('../controllers/socialNetwork');
const ConnectionsController = require('../controllers/connections');
var SoqqlerConnections = require('../models/soqqlerConnections');
var UserProfile = require('../models/userProfile');
const _ = require('lodash');
const async = require('async'); /*Sunil, Please don't use absolute path's when requiring third party modules, use module name instead
  check server.js for reference
*/
/**
 * Send friend request
 */
Routes.post('/addSoqqler', function(req, res) {
  console.dir(req.body);

  let _userID1 = req.body.uid1;
  let _userID2 = req.body.uid2;
  let _requestStatus = req.body.reqStatus;

  let newSoqqlerConnection = new SoqqlerConnections({
    userID1: _userID1,
    userID2: _userID2,
    requestStatus: _requestStatus,
    creationDate: Date.now(),
  });

  newSoqqlerConnection.save(function(err) {
    if (err) {
      console.log(err); // handle errors!
      res.sendStatus(500);
    } else {
      console.log(
        `Task userID1: ${_userID1} userID2: ${_userID2} requestStatus: ${_requestStatus} saved!`
      );
      //res.status(200);
      res.send('success');
    }
  });
});

/**
 * Get All Connected Friends
 */
Routes.get('/getConnectedSoqqlers', function(req, res) {
  const currentUser = req.query.currentUser;
  const requestedConnectionStatus = req.query.status;

  SoqqlerConnections.find(
    { $or: [{ userID1: currentUser }, { userID2: currentUser }] },
    function(err, result) {
      if (result.length) {
        var connectedUsersList = new Array();
        async.forEach(result, processEachTask, afterAllTasks);

        function processEachTask(task, callback) {
          var user = new Object();
          user.id = task.userID1 == currentUser ? task.userID2 : task.userID1;
          if (task.requestStatus == 1) {
            // Friends
            user.connectionStatus = 'Friends';
          } else {
            user.connectionStatus =
              task.userID1 == currentUser ? 'Sent' : 'Received';
          }
          const queryUser = { _id: user.id };
          UserProfile.findOne(queryUser, function(err, response) {
            if (err) {
              // Unable to find user, skip.
              // Log the error
              console.log(err); // handle errors!
              res.sendStatus(500);
            } else {
              if (response != null) {
                // User found. Update the friendList
                user.firstName = response.profile.firstName;
                user.lastName = response.profile.lastName;
                // Michael ->
                user.profilePic = response.profile.pictureURL;

                ConnectionsController.fetch_counts(user.id, (err, counts) => {
                  if (!err) {
                    _.set(user, 'connections', counts);
                  }
                  _.set(
                    user,
                    'connections.progressionCount',
                    _.get(response, 'progressionTrees', []).length
                  );
                  if (
                    !requestedConnectionStatus ||
                    requestedConnectionStatus == user.connectionStatus
                  ) {
                    connectedUsersList.push(user);
                  }
                  callback(err);
                });

               // console.log('connectedUsersList', connectedUsersList);
              } else {
                // user not found. should not happen in ideal cases
              }
            }
          });
        }
        function afterAllTasks(err) {
          res.send(connectedUsersList);
        }
      } else {
        //TODO: Sunil, please check if it's correct
        res.sendStatus(404);
      }
    }
  );
});

/**
 * Get All Users
 */
Routes.get('/getAllSoqqlers', function(req, res) {

  const currentUser = req.query.currentUser;
  let friends = [];
  setTimeout(()=>{
      UserProfile.findOne({ _id: currentUser }, function(err, users) {
        if(users){
          if(users.facebook.friends.length > 0 ){
            users.facebook.friends.map(friend => {
              UserProfile.findOne({ facebookID: friend.id }, function(err, friend) {
                if(friend){
                    var userObject = new Object();
                    userObject.id = friend._id;
                    const profileImage = friend.profile.pictureURL
                      ? friend.profile.pictureURL
                      : 'https://s3.us-east-2.amazonaws.com/sociamibucket/assets/images/userProfile/default-profile.png';
                    userObject.firstName = friend.profile.firstName;
                    userObject.lastName = friend.profile.lastName;
                    (userObject.facebookID = friend.getFacebookID()),
                    (userObject.linkedInID = friend.getLinkedInID()),
                    (userObject.profilePic = profileImage);

                      userObject.connections= 
                     { taskCount: 0,
                       friendCount: 0,
                       projectCount: 0,
                       progressionCount: 0 }

                    friends.push(userObject)
                }
              })
            })
          }
        }
      })
  })

 
  UserProfile.find({ _id: { $ne: currentUser } }, function(err, result) {

    if (result.length) {
      var allUsersList = new Array();
      var allUsersWithFriendsList = new Array();
      async.forEach(result, processEachTask, afterAllTasks);

      function processEachTask(user, callback) {
        SoqqlerConnections.find(
          {
            $or: [
              { $and: [{ userID1: user._id }, { userID2: currentUser }] },
              { $and: [{ userID1: currentUser }, { userID2: user._id }] },
            ],
          },
          function(err, response) {
            if (response.length) {
              // skip
              callback();
            } else {
              var userObject = new Object();
              userObject.id = user._id;
              const profileImage = user.profile.pictureURL
                ? user.profile.pictureURL
                : 'https://s3.us-east-2.amazonaws.com/sociamibucket/assets/images/userProfile/default-profile.png';
              userObject.firstName = user.profile.firstName;
              userObject.lastName = user.profile.lastName;
              (userObject.facebookID = user.getFacebookID()),
                (userObject.linkedInID = user.getLinkedInID()),

                (userObject.profilePic = profileImage);

              ConnectionsController.fetch_counts(
                userObject.id,
                (err, counts) => {
                  if (!err) {
                    _.set(userObject, 'connections', counts);
                  }
                  _.set(
                    userObject,
                    'connections.progressionCount',
                    _.get(response, 'progressionTrees', []).length
                  );
                  allUsersWithFriendsList.push(userObject);
                  if(friends.length > 0){
                    allUsersList = allUsersWithFriendsList.concat(friends)
                  } else{
                    allUsersList = allUsersWithFriendsList                  
                  }
                  callback(err);
                }
              );
            }
          }
        );
      }

      function afterAllTasks(err) {
        res.send(allUsersList);
      }
    } else {
      res.send([]);
    }
  })
    .skip(parseInt(req.query.skip) || 0)
    .limit(21);
});

/**
 * To clean up the collection. Used only for testing
 */
Routes.get('/dropSoqqlers', function(req, res) {
  SoqqlerConnections.collection.drop(function(err, result) {
    if (err) {
      console.log(err); // handle errors!
      res.sendStatus(500);
    } else {
      console.log(result);
      res.send('success');
    }
  });
  //}
});

/**
 * To clean up the collection. Used only for testing
 */
Routes.get('/deleteSoqqler', function(req, res) {
  const currentUser = req.query.currentUser;
  var myquery = { _id: currentUser };
  UserProfile.deleteOne(myquery, function(err, result) {
    if (err) {
      console.log(err); // handle errors!
      res.sendStatus(500);
    } else {
      console.log(result);
      res.send('success');
    }
  });
  //}
});
/**
 * Take action on the friend request either sent or received
 */
Routes.post('/connectSoqqler', function(req, res) {
  console.dir(req.body);

  const _currentUser = req.body.currentUser;
  const _otherUser = req.body.otherUser;

  const _currentUserId = _currentUser._id;
  const _otherUserId = _otherUser.id;

  // Get connect type
  let _action = req.body.connectAction;
  // Accept or Reject

  switch (_action) {
    case 'Accept':
      // Set requestStatus as 1
      var myquery = {
        $and: [{ userID1: _otherUserId }, { userID2: _currentUserId }],
      };
      var newvalues = { $set: { requestStatus: 1 } };
      SoqqlerConnections.updateOne(myquery, newvalues, function(err, result) {
        if (err) {
          console.log(err); // handle errors!
          res.sendStatus(500);
        } else {
          //add activity for current user
          ActivitiesHelper.addActivity(
            _currentUserId,
            ActivitiesHelper.generateActivity(
              ActivityTypes.FRIEND_NEW_FRIEND_ADDED,
              {
                userID: _currentUserId,
                friend: _otherUser,
              }
            )
          );

          //add activity for the user who've sent a request
          ActivitiesHelper.addActivity(
            _otherUserId,
            ActivitiesHelper.generateActivity(
              ActivityTypes.FRIEND_NEW_FRIEND_ADDED,
              {
                userID: _otherUserId,
                friend: _currentUser,
              }
            )
          );

          console.log(result);
          res.send('success');
        }
      });
      break;

    case 'Reject':
      // delete the entry
      var rejectQuery = {
        $and: [{ userID1: _otherUserId }, { userID2: _currentUserId }],
      };
      SoqqlerConnections.deleteOne(rejectQuery, function(err, result) {
        if (err) {
          console.log(err); // handle errors!
          res.sendStatus(500);
        } else {
          console.log(result);
          res.send('success');
        }
      });
      break;

    case 'Withdraw':
      // delete the entry
      var withDrawQuery = {
        $and: [{ userID1: _currentUserId }, { userID2: _otherUserId }],
      };
      SoqqlerConnections.deleteOne(withDrawQuery, function(err, result) {
        if (err) {
          console.log(err); // handle errors!
          res.sendStatus(500);
        } else {
          console.log(result);
          res.send('success');
        }
      });
      break;

    default:
    // Do nothing
  }
});

Routes.get('/getUserFriends', SocialNetworkController.get_friends_of_user); //temporary solution for list of friends

module.exports = Routes;
