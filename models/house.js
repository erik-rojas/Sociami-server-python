const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const HouseSchema = new Schema({
  category: String,
  subCategory: String,
  name: String,
  description: String,
  bonus: String,
  admin: String,
  imageUrl: String
}, {
    usePushEach: true
  });

module.exports = Mongoose.model('House', HouseSchema);
