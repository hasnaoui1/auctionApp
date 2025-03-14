const Auction = require ('../models/auction.model')
const Bid = require('../models/bids.model')
const addAuction=(req,res)=>{
    let Auction = new auctionModel(req.body)
    try{
        Auction.save()
        res.status(200).send("Auction added successfully")
    }catch(err){
        res.status(410).send(err)
    }
    
    
}
const deleteAuction=(req,res)=>{
    let id = req.body.id;
    try{
        auctionModel.deleteOne({_id : id})
        res.status(200).send("Auction deleted")
    }catch(err){
        res.status(420).send(err)
    }
    
}
const updateAuction=async (req,res)=>{
    let id = req.params.id
    try{
       let result =await auctionModel.updateOne({_id : id} ,req.body)
       res.send(result)
    }catch(err){
        res.status(420).send(err)
    }
    
}
const getAllAuctions = async (req, res) => {
    data = await auctionModel.find()
    res.send(data)
    
}



const getAuctionById = async (req, res) => {
    let id = req.params.id
    try{
        data = await auctionModel.findOne({_id: id})
        res.send(data)
    }catch(err){
        res.status(420).send(err)   

    }
}


// controllers/auction.controller.js

const { broadcastToAuction } = require('./websocket.controller');

joinAuction = async (req, res) => {
    const { auctionId } = req.body;
    const userId = req.user.id;

    try {
        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).send("Auction not found");
        }

        // Add user to the auction's participants list
        if (!auction.participants.includes(userId)) {
            auction.participants.push(userId);
            await auction.save();
        }

        // Notify the user to join the WebSocket room
        broadcastToAuction(auctionId, { type: 'join', userId });

        res.status(200).send({ message: "Joined auction successfully", auction , auctionId });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER ,
        pass: process.env.EMAIL_PASS 
    }
});






    startAuction = async (req, res) => {
        const { auctionId } = req.body;

        try {
            const auction = await Auction.findById(auctionId);

            if (!auction) return res.status(404).send("Auction not found");
            if (auction.isActive) return res.status(400).send("Auction is already active");

            if (req.user.role !== 'admin') {
                return res.status(403).send("Only admins can start an auction");
            }
            if (auction.participants.length < 2) {
                return res.status(405).send("Participants number should be at least 2 or higher");
            }

            auction.isActive = true;
            await auction.save();

            // Notify all participants that the auction has started
            broadcastToAuction(auctionId, { type: 'start', message: 'Auction started!' });

            setTimeout(async () => {
                try {
                    const auctionToClose = await Auction.findById(auctionId)
                        .populate({
                            path: 'bids',
                            populate: { path: 'user', select: 'email' },
                        })
                        .populate({
                            path: 'participants',
                            select: 'email',
                        });

                    if (!auctionToClose || !auctionToClose.isActive) {
                        console.error(`Auction ${auctionId} not found or not active`);
                        return;
                    }

                    const highestBid = auctionToClose.bids.sort((a, b) => b.bidAmount - a.bidAmount)[0];

                    console.log(
                        highestBid
                            ? `Auction ${auctionId} closed. Winner: ${highestBid.user.email}`
                            : `Auction ${auctionId} closed with no bids.`
                    );

                    const participantsEmails = auctionToClose.participants
                        .map(user => user.email);

                    for (const email of participantsEmails) {
                        await transporter.sendMail({
                            from: "admin",
                            to: email,
                            subject: 'Auction Results',
                            text: highestBid
                                ? `The auction ${auctionToClose.itemName} has ended. Winner: ${highestBid.user.email}, Winning Bid: $${highestBid.bidAmount}`
                                : `The auction ${auctionToClose.itemName} has ended with no winning bids.`,
                        });
                    }

                    console.log('Emails sent to all participants.');

                    auctionToClose.isActive = false;
                    auctionToClose.highestBidder = highestBid ? highestBid.user : null;
                    auctionToClose.currentPrice = highestBid ? highestBid.bidAmount : auctionToClose.startingPrice;

                    auctionToClose.bids = [];
                    auctionToClose.participants = [];
                    auctionToClose.currentPrice = 0;
                    auctionToClose.endTime = auctionToClose.startTime;

                    await auctionToClose.save();

                    // Notify all participants that the auction has ended
                    broadcastToAuction(auctionId, { type: 'end', message: 'Auction ended!' });

                } catch (error) {
                    console.error(`Error closing auction ${auctionId}: ${error.message}`);
                }
            }, 400000);

            res.send({ message: "Auction started successfully", auction });
        } catch (error) {
            res.status(500).send(error.message);
        }
    };







module.exports= {addAuction,deleteAuction,updateAuction,getAuctionById,getAllAuctions,joinAuction, startAuction}