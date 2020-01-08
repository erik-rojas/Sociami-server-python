const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const CompanySchema = new Schema({
  name: {
    type: String,
    index: true
  },
  emails: [""],
  description: {
    type: String
  },
  category: {
    type: String
  },
  sub_category: {
    type: String
  },
  comments: {
    type: String
  },
  subscription: {
    type: String
  },
  imageUrl: {
    type: String
  }
}, {
  usePushEach: true
});

module.exports = Mongoose.model('Company', CompanySchema);