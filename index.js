const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors())
const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }
});
global.io=io;


app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DB)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Import and use routes
require("./routes/routes")(app);

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle joining an auction room
    socket.on('joinAuction', (auctionId) => {
        socket.join(`auction_${auctionId}`);
        console.log(`Client ${socket.id} joined auction ${auctionId}`);
    });

    // Handle placing a bid
    socket.on('placeBid', (data) => {
        const { auctionId, bid } = data;
        console.log(`New bid on auction ${auctionId}: ${bid}`);

        // Broadcast the bid to all participants in the auction room
        io.to(`auction_${auctionId}`).emit('newBid', bid);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});