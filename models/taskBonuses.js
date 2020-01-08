const Mongoose = require('mongoose');

const Schema = new Mongoose.Schema({
  difficulty: {
    type: Number,
    required: true,
  },
  factor: {
    type: Number,
    required: true,
  },
});

module.exports = Mongoose.model('TaskBonus', Schema, "TaskBonuses");
