const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const SocialRequest = new Schema({
  type: {
    type: String,
  },

  recepientID: { 
    type: String,
  },

  recepient: { 
    type: Object,
  },

  requester: { 
    type: Object,
  },

  requesterID: { 
    type: String,
  },

  metaData: {
    type: Object
  },

});

module.exports = Mongoose.model('SocialRequest', SocialRequest);
