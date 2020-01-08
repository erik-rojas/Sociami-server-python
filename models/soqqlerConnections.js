const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const SoqqlerConnectionsSchema = new Schema({
  userID1: {
    type: String,
  },
  userID2: {
    type: String,
  },
  requestStatus:{
    type:Number,  
  },
  creationDate: {
    type: Number,
  },
});

module.exports = Mongoose.model('SoqqlerConnections', SoqqlerConnectionsSchema);
