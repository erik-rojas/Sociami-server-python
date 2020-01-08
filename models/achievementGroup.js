const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const AchievementGroupsSchema = new Schema({
  name: "",
  description: "",
  scope: {
    type: String,
    enum: ['Public', 'Private']
  },
  _company: {type:Schema.Types.ObjectId, ref: 'Company'},
  _achievements: [
    { type: Schema.Types.ObjectId,
      ref: 'Achievements'
    }
  ]

});

module.exports = Mongoose.model('AchievementGroups', AchievementGroupsSchema);
