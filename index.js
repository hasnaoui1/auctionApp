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


mongoose.connect(process.env.DB)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


require("./routes/routes")(app);


io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    
    socket.on('joinAuction', (auctionId) => {
        socket.join(`auction_${auctionId}`);
        console.log(`Client ${socket.id} joined auction ${auctionId}`);

        io.to(`auction_${auctionId}`).emit('userJoined', { userId: socket.id, auctionId });
    });

    socket.on('bid', (data) => {
        const { auctionId, bid, userName } = data;
        console.log(`New bid on auction ${auctionId}: ${bid} by ${userName}`);

       
        io.to(`auction_${auctionId}`).emit('newBid', { amount: bid, userName });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

     
        const rooms = Object.keys(socket.rooms);
        rooms.forEach((room) => {
            if (room.startsWith('auction_')) {
                io.to(room).emit('userLeft', userName);
            }
        });
    });
});
const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});