const Mongoose = require('mongoose');

const Schema = new Mongoose.Schema({
  index: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
});

module.exports = Mongoose.model('ExperienceRange', Schema, "ExperienceRanges");
