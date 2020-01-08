const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const CharacterClass = new Schema({
  name: {
    type: String,
    required: true,
  },
  description1: {
    type: String,
    required: true,
  },
  description2: {
    type: String,
    default: null,
  },
  description3: {
    type: String,
    default: null,
  },
  imageURL: {
    type: String,
    required: true,
  },
  imageBigURL: {
    type: String,
    required: true,
  },
  skills: [],
}, {
  usePushEach: true
});

module.exports = Mongoose.model('CharacterClass', CharacterClass, "CharacterClasses");
