const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const Following = new Schema({
  _f: {
    type: String,
    required: true,
  },
  _t: {
    type: String,
    required: true,
  }
}, { autoIndex: false });

Following.index({ _f: 1, _t: 1 }, { unique: true });

module.exports = Mongoose.model('Following', Following);
