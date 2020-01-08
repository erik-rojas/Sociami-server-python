const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const TicketSchema = new Schema({
  reference_number: {
    type: String,
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  reporter: {
    type: String
  },
  assignee: {
    type: String
  },
  date_created: {
    type: Date  
  },
  last_updated: {
    type: Date
  },
  status: {
    type: String
  },
  priority: {
    type: Number
  },
  history: [],
  comments: []
}, {
  usePushEach: true
});

module.exports = Mongoose.model('Ticket', TicketSchema);