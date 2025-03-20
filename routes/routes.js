const userController = require("../controllers/users.controller");
const auctionController = require("../controllers/auction.controller");
const bidController = require("../controllers/bids.controller");
const authController = require("../controllers/auth.controller");


const { verifyToken } = require('../middlewares/verifyToken.middleware');
module.exports = (app) => {
   
    app.get('/users', userController.getAllUsers);
    app.get('/user/:x', userController.getUserById);
    app.post('/create-user', userController.addUser);
    app.put('/update-user/:id', userController.updateUser);
    app.delete('/remove-user/:id', userController.deleteUser);

 
    app.post('/register', authController.register);
    app.post('/login', authController.login);

   
    app.get('/auctions', auctionController.getAllAuctions);
    app.get('/auction/:id', auctionController.getAuctionById);
    app.post('/create-auction', auctionController.addAuction);
    app.put('/update-auction/:id', auctionController.updateAuction);
    app.delete('/delete-auction', auctionController.deleteAuction);
    app.post('/join-auction',verifyToken,auctionController.joinAuction)
    app.post('/startAuction',verifyToken,auctionController.startAuction)

    app.post('/place-bid',verifyToken, bidController.placeBid);
    
};
