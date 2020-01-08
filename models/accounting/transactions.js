const mongoose = require('mongoose');

const UserTransactionsSchema = mongoose.Schema({
    receiverId: {
        type: String,
    },
    numTokens: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Number,
        default: null,
    },
    source: {
        type: Object,
        default: null,
    }
});

module.exports = mongoose.model('UserTransactions', UserTransactionsSchema);