const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const CharacterTraits = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = Mongoose.model('CharacterTraits', CharacterTraits, "CharacterTraitsList");
