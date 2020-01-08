const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const ChallengeSchema = new Schema({
  userID: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  success: {
    type: String,
  },
  validation: {
    type: String,
  },
  reward: {
    type: String,
  },
  rewardValue: {
    type: Schema.Types.Mixed,
  },
  
})

module.exports = Mongoose.model('Challenge', ChallengeSchema);