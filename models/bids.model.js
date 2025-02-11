const mongoose = require('mongoose');

const bidsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bidAmount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Bid = mongoose.model('Bid', bidsSchema); 
module.exports = Bid;
