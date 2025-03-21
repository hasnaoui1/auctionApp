exports.broadcastToAuction = (auctionId, eventName, data) => {
  if (io) {
      console.log(`DEBUG: broadcastToAuction() executing for ${auctionId}`);
      console.log(`Broadcasting to auction ${auctionId}:`, eventName, data);
      io.to(`auction_${auctionId}`).emit(eventName, data); // Emit the event with the correct name and data
  } else {
      console.error("DEBUG: io is not defined, cannot emit events.");
  }
};