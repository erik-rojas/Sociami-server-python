const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const ProjectSchema = new Schema({
  userID: {
    type: String,
  },

  name: {
    type: String,
  },

  description: {
    type: String,
  },

  nature: {
    type: String,
  },

  milestones:[],

  creationDate: {
    type: Number,
  },
}, {
  usePushEach: true
});

module.exports = Mongoose.model('Project', ProjectSchema);
