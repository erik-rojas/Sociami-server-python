const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const TaskRefsSchema = new Schema({
  name: {
    type: String
  },
  type: {
    type: String
  },
  value: {
    type: String
  },
  group: {
    type: String
  }
});

module.exports = Mongoose.model('TaskRefs', TaskRefsSchema);