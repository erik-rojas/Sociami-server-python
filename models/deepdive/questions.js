const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const QuestionTypes = require('../../helpers/questionTypes.js');

const QuestionsSchema = new Schema({
  question: {
    type: String,
  },
  roadmapSkill: {
    type: String,
  },
  category: {
    type: String,
  },
  subCategory: {
    type: String,
  },
  description: {
    type: String,
  },
  conditions: {
    type: String,
  },
  evaluation: {
    type: String,
  },
  complexity: {
    type: String,
  },
  type: {
    type: String,
    default: QuestionTypes.SIMPLE,
  },
  answers: [],
  correctAnswers: [], //let's make it an array, to allow multiple correct answers in future
}, {
  usePushEach: true
});

module.exports = Mongoose.model('Questions', QuestionsSchema);
