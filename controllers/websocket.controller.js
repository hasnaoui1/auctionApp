// controllers/websocket.controller.js
const socketIO = require('socket.io');

let io = null;

// Initialize WebSocket server
exports.initializeWebSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: "http://127.0.0.1:5500", // Frontend URL
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type", "Authorization"],
        }
    });
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
};

// Broadcast a message to a specific auction room
exports.broadcastToAuction = (auctionId, message) => {
    if (io) {
        io.to(`auction_${auctionId}`).emit('message', message);
    }
};