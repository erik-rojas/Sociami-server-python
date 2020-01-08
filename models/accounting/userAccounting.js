const mongoose = require('mongoose');

const UserAccountingSchema = mongoose.Schema({
    userId: {
        type: String,
        unique: true,
    },
    numTokens: {
        type: Number,
        default: 0,
    }
});

module.exports = mongoose.model('UserAccounting', UserAccountingSchema);