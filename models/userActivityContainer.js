const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const UserActivityContainerSchema = new Schema({
  userID: {
    type: String,
  },

  activities: [],
}, {
  usePushEach: true
});

module.exports = Mongoose.model('UserActivityContainer', UserActivityContainerSchema);
