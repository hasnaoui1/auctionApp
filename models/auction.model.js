const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 },
   
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: [] }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }], 
    isActive: { type: Boolean, default: false },
});

const Auction = mongoose.model('Auction', auctionSchema);
module.exports = Auction;
