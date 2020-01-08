const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const TeamsSchema = new Schema({
  name: {
    type: String
  },
  date: {
    type: String
  },
  emails: []
});

module.exports = Mongoose.model('Teams', TeamsSchema);