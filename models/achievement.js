const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const AchievementsSchema = new Schema({
  type: {
    type: String,
    enum: ['Achievement', 'Powerup', 'Story']
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  result: {
    type: String,
    enum: ['Title', 'Bonus Luck', 'Chapter']
  },
  resultValue: {
    type: String
  },
  generic: {
    type: Boolean,
    default: false
  },
  conditions: [
    {
      type: {
        type: String,
        enum: ['Task', 'Progression', 'Task and Progression', 'Achievements', 'Action', 'Level', 'Story']
      },
      taskType: {
        type: String,
        enum: ['Deepdive', 'Illuminate']
      },
      count: {
        type: Number
      },
      levelType: {
        type: String,
        enum: ['None', 'Roadmap']
      },
      _achievements: [''],
      _roadmap: {type:Schema.Types.ObjectId, ref: 'Roadmap'},
      _story: {type:Schema.Types.ObjectId, ref: 'Achievement'},
      action: {
        type: String
      }
    }
  ]
}, {
  usePushEach: true
});

module.exports = Mongoose.model('Achievements', AchievementsSchema);