// Frontend code
async function joinAuction(auctionId) {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzYyMGY3NjZiZWI0MmU5NmM4NGEyYjEiLCJlbWFpbCI6InRlbXA2NnRAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDIxNzUwMTMsImV4cCI6MTc0MjE3ODYxM30.IXAx4xq5fTW8cncR_Kc0ByVwc0tRh-GfsWNLbI3cMB0"
    try {
        const response = await fetch('http://localhost:3008/join-auction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ auctionId }),
        });

        if (!response.ok) {
            throw new Error('Failed to join auction');
        }

        const data = await response.json();
        console.log(data.message);

        // Connect to the Socket.IO server and join the auction room
        const socket = io('http://localhost:3008');
        socket.emit('joinAuction', auctionId);

        // Listen for auction events
        socket.on('auctionEvent', (message) => {
            console.log('Auction event:', message);
        });

        // Listen for new bids
        socket.on('newBid', (bid) => {
            console.log('New bid:', bid);
        });
    } catch (error) {
        console.error('Error joining auction:', error.message);
    }
}

// Example: Join an auction when the user clicks a button
document.getElementById('joinAuctionButton').addEventListener('click', () => {
    const auctionId = document.getElementById('auctionIdInput').value.trim(); // Get the value from the input field
    if (!auctionId) {
        alert("Please enter an auction ID");
        return;
    }
    joinAuction(auctionId);
});