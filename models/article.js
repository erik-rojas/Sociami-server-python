const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const ArticleSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  title: String,
  subTitle: String,
  urlLink: String
}, {
    usePushEach: true
  });

module.exports = Mongoose.model('Article', ArticleSchema);
