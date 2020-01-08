const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const PreferenceSchema = new Schema({
    userID: {
      type: String,
      required: true,
    },
    theme: {
      type: Object,
      required: true,
    },
});

module.exports = Mongoose.model('Preference', PreferenceSchema);
