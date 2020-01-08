const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const ConversationSchema = new Schema({
  participants: []
}, {
  usePushEach: true
});

module.exports = Mongoose.model('Conversation', ConversationSchema);