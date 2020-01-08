const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const UserInteraction = new Schema({
  userID: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  subType: {
    type: String,
    required: true,
  },
  timeStamp: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    default: null,
    required: false,
  }
});

module.exports = Mongoose.model('UserInteraction', UserInteraction, "UserInteractions");
