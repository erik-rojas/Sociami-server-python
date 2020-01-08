const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const SettingSchema = new Schema({
    defaultBonus: Number
});

module.exports = Mongoose.model('Setting', SettingSchema);
