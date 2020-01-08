const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const Follower = new Schema({
  _f: {
    type: String,
    required: true,
  },
  _t: {
    type: String,
    required: true,
  }
}, { autoIndex: false });

Follower.index({ _f: 1, _t: 1 }, { unique: true });

module.exports = Mongoose.model('Follower', Follower);
