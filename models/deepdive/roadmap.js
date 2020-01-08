const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const RoadmapSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  weightage1: [],
  weightage2: [],
  weightage3: [],
  keywords: [],
  relatedRoadmaps: [],
  category:[],
  backgroundimg: {
    type: String
  },
  heroimg: {
    type: String
  },
  icons: [],
  rating: {
    type: Number,
    default: 0,
  },
  insdt: Date,

  unlockConditions: [],

  deepDiveIntervalLimit: {
    type: Number,
    default: 60 * 60 * 24 * 1000,
  },
  levelMax: {
    type: Number,
    default: 5,
  }

}, {
  usePushEach: true
});

module.exports = Mongoose.model('Roadmap', RoadmapSchema);
