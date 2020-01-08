const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const UserAchievementSchema = new Schema({
  userId: {
    type: String,
  },
  achievements: [
    {
      achievementId: {
        type: String,
      },
      conditions:  [],
      status: {
        type: String
      }
    }
  ]
});

module.exports = Mongoose.model('UserAchievement', UserAchievementSchema);