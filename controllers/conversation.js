var Conversation = require('../models/conversation');
var Message = require('../models/message');

exports.fetch_by_participants = function (req, response) {
  const participants = req.query.ids.split(';');

  Conversation.findOne({participants: {$all : participants}},
    (err, convo) => {
      if(err) {
        response.json('')
      }

      if(convo) {
        Message.find({conversationId:convo._id}).sort({time:-1}).skip(parseInt(req.query.skip) || 0).limit(20).then(messages => response.json(messages))
      } else {
        response.json('');
      }

    })
    .catch((reject) => {
      response.json('')
    });
};
