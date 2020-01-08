const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const TaskSchema = new Schema({
  userID: {
    type: String,
  },
  userName: {
    type: String,
  },
  assignees:[],

  roadmapID: {
    type: String,
  },
  roadmapName: {
    type: String,
  },
  type: {
    type: String,
  },
  difficulty: {
    type: Number,
    default: 1,
  },
  creationDate: {
    type: Number,
  },

  isHidden: {
    type: Boolean,
  },

  status: {
    type: String,
    default: "None",
  },

  timeStatusChanged: {
    type: Number,
    default: null,
  },

  //TODO: check if this fields are needed here(was done for Project Management)
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  date: {
    type: Number,
    default: 0,
  },

  creator: {
    type: Object,
  },

  metaData: Object,
  //TODO: check if this fields are needed here(was done for Project Management)
}, {
  usePushEach: true
});

module.exports = Mongoose.model('Task', TaskSchema);
