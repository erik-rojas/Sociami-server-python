const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const TimersSchema = new Schema({
  name: {
    type: String
  },
  quota: {
    type: Number,
  },
  refresh: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly']
  },
  type:  {
    type: String,
    enum: ['Illuminate', 'Deepdive', "Decode"]
  },
  _roadmap: {type:Schema.Types.ObjectId, ref: 'Roadmap'}
});

module.exports = Mongoose.model('Timers', TimersSchema);