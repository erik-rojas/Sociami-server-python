const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const UserLevelsSchema = new Schema({
  level: {
    type: Number,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  range: {
    type: Number,
    required: true,
  },
});

module.exports = Mongoose.model('UserLevel', UserLevelsSchema);
