const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const CooldownTrackerSchema = new Schema({
  _timer: {type:Schema.Types.ObjectId, ref: 'Timers'},
  _userProfile: {type:Schema.Types.ObjectId, ref: 'UserProfile'},
  count: {
    type: Number
  }
});

module.exports = Mongoose.model('CooldownTracker', CooldownTrackerSchema);