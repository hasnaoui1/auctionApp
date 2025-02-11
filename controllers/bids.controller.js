const Bid = require('../models/bids.model'); 
const Auction = require('../models/auction.model'); 
const User = require('../models/users.model');

const placeBid = async (req, res) => {
    const { auctionId, bidAmount } = req.body;

    try {
        const auction = await Auction.findById(auctionId);

        if (!auction) return res.status(404).send("Auction not found");
        if (!auction.isActive) return res.status(400).send("Auction is not active");

        
        if (!auction.participants.includes(req.user._id)) {
            return res.status(403).send("You are not allowed to bid in this auction");
        }

        if (bidAmount <= auction.currentPrice) {
            return res.status(400).send("Bid must be higher than the current price");
        }else{
            auction.currentPrice = bidAmount;
        }


        
        const newBid = new Bid({ user: req.user._id, bidAmount });
        await newBid.save();
       
        
       
        const user = await User.findById(req.user._id, 'name');
        console.log(`Bid placed by ${user.name} with amount ${bidAmount}`);

        
        if (!auction.bids) {
            auction.bids = [];
        }

     
        auction.bids.push(newBid._id);
        await auction.save();

        res.send({ message: "Bid placed successfully", newBid });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    placeBid
};
