const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const Content = new Schema({
  author: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  },
  data: {}
}, { autoIndex: false });

Content.index({ author: 1, _id: 1 });

module.exports = Mongoose.model('Content', Content);
