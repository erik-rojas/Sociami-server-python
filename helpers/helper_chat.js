var async = require('async');

var Conversation = require('../models/conversation');
var Message = require('../models/message');

exports.persistMessage = function (data) {

  if(data.conversationId) {
    new Message(data).save((err, data) => {
      if(err) {
        console.error(err)
      }
    });
  } else {
    async.waterfall([
      (callback) => {
        Conversation.findOne({participants: {$all : [data.sender, data.receiver]}}, callback);
      },
      (convo, callback) => {
        if(!convo) {
          return new Conversation({participants: [data.sender, data.receiver]}).save(callback);
        }
        return callback(null, convo)
      },
      (convo, callback) => {
        data.conversationId = convo._id;
        new Message(data).save(callback);
      }
    ], (err, data) => {
      if(err) {
        console.error(err)
      }
    })
  }
}
