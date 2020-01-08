const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const Rating = new Schema({
  userID: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
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

module.exports = Mongoose.model('Rating', Rating, "Rating");
