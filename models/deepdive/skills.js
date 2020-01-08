const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const SkillsSchema = new Schema(
  {
    skill: {
      type: String
    },
    description: {
      type: String
    },
    category: {
      type: String
    },
    subCategory: {
      type: String
    },
    relatedTopics: [],
    _achievements: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Achievements'
      }
    ],
    _objective: {
      type: Schema.Types.ObjectId,
      ref: 'TaskRefs'
    },
    objectiveValue: {
      type: String
    },
    reward: {
      type: {
        type: String
      },
      value: {
        type: Number
      },
      _achievement: {
        type: Schema.Types.ObjectId,
        ref: 'Achievements'
      }
    },
    quota: {
      type: Number
    },
    refresh: {
      type: String,
      enum: [ 'Daily', 'Weekly', 'Monthly' ]
    },
    insdt: Date
  },
  {
    usePushEach: true
  }
);

module.exports = Mongoose.model('Skills', SkillsSchema);
