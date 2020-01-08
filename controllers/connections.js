const async = require('async');

var SoqqlerConnections = require('../models/soqqlerConnections');
var UserProfile = require('../models/userProfile');
var Project = require('../models/project');
var Task = require('../models/task');

exports.fetch_counts = function (id, callback) {
  const connectionCounts = {};

  async.parallel([
    (cb) => {
      
      SoqqlerConnections.find({
        $and:[
          {requestStatus: {$eq:1}}, 
          { $or:[
            {userID1: id}, 
            {userID2:id}
          ]}
        ]
      }).count((err, count) => {
        connectionCounts.friendCount = count;
        cb(err)
      });
    },
    (cb) => {
      Project.find({userID: id}).count((err,count) => {
        connectionCounts.projectCount = count;
        cb(err)
      })
    },
    (cb) => {
      Task.find({'metaData.participants': {$elemMatch: { 'user._id': id}}}).count((err,count) => {
        connectionCounts.taskCount = count;
        cb(err)
      })
    }
  ], (err) => {
    callback(err, connectionCounts);
  })
}