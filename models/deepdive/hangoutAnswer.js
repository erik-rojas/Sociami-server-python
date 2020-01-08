const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const HangoutAnswerSchema = new Schema({
  taskID: {
    type: String,
  },
  userAnswers: [], //user: {_id, answers: {question_id_0, question_id_1...} }
}, {
  usePushEach: true
});

module.exports = Mongoose.model('HangoutAnswer', HangoutAnswerSchema);
