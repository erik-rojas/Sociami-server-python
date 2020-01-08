const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const MessageSchema = {
  sender: {
    type: String
  },
  message: {
    type: String
  },
  time: {
    type: Date,
    default: Date.now
  },
  conversationId: {
    type: String
  }
}

module.exports = Mongoose.model('Message', MessageSchema);