const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const CouponSetSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }
});

module.exports = Mongoose.model('CouponSet', CouponSetSchema);
