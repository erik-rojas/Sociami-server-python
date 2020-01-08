const Mongoose = require('mongoose');
const Schema = new Mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
  },
  requirements: {
    type: Object,
    required: true,
  }
});

module.exports = Mongoose.model('TaskActivityUnlockRequirement', Schema, "TaskActivityUnlockRequirements");
