import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axiosInstance from "./services/axiosInstance";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

export default function JoinAuction() {
    const [auctionId, setAuctionId] = useState("");
    const [bid, setBid] = useState("");
    const [bids, setBids] = useState([]);
    const [socket, setSocket] = useState(null);
    const [winnerMessage, setWinnerMessage] = useState("");
    const [auctionStatus, setAuctionStatus] = useState("");

    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userName = decoded?.email || "Anonymous";

    useEffect(() => {
        const newSocket = io("http://localhost:3008");
        setSocket(newSocket);

        newSocket.on("new_Bid", (bidData) => {
            console.log("New bid received:", bidData);
            setBids((prevBids) => [...prevBids, bidData]);
        });

        newSocket.on("auctionClosed", (data) => {
            console.log("Auction closed:", data);
            setWinnerMessage(data.message);
            setAuctionStatus("Auction closed");
        });

        newSocket.on("auctionStarted", (data) => {
            console.log("Auction started:", data);
            setAuctionStatus("Auction is active");
            setWinnerMessage("");
            setBids([]);
        });

        return () => newSocket.disconnect();
    }, []);

    const joinAuction = async () => {
        if (!auctionId) {
            alert("Please enter an auction ID");
            return;
        }

        try {
            await axiosInstance.post(
                "/join-auction",
                { auctionId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (socket) {
                socket.emit("joinAuction", auctionId);
            }
        } catch (error) {
            console.error("Error joining auction:", error);
        }
    };

    const sendBid = async () => {
        if (!socket || !bid.trim()) return;

        try {
            const response = await axiosInstance.post(
                "/place-bid",
                { auctionId, bidAmount: bid },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            socket.emit("bid", { auctionId, amount: response.newBid.bidAmount, userName });
            setBid("");
        } catch (error) {
            console.error("Error placing bid:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <h2 className="card-title">Join Auction</h2>
                </div>
                <div className="card-body">
                    {/* Auction ID Input */}
                    <div className="mb-3">
                        <label htmlFor="auctionId" className="form-label">Auction ID</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Auction ID"
                                value={auctionId}
                                onChange={(e) => setAuctionId(e.target.value)}
                            />
                            <button className="btn btn-success" onClick={joinAuction}>Join Auction</button>
                        </div>
                    </div>

                    {/* Auction Status */}
                    <div className="alert alert-info">
                        <strong>Auction Status:</strong> {auctionStatus}
                    </div>

                    {/* Bids Section */}
                    <div className="mb-4">
                        <h3 className="mb-3">Bids</h3>
                        <div className="list-group">
                            {bids.map((bidData, index) => (
                                <div key={index} className="list-group-item">
                                    <strong>{bidData.userName}</strong> placed a bid of <strong>${bidData.amount}</strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Place Bid Section */}
                    <div className="mb-4">
                        <h3 className="mb-3">Place a Bid</h3>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter your bid amount"
                                value={bid}
                                onChange={(e) => setBid(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={sendBid}>Place Bid</button>
                        </div>
                    </div>

                    {/* Winner Message */}
                    {winnerMessage && (
                        <div className="alert alert-success mt-4">
                            <h2>Auction Result</h2>
                            <p>{winnerMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}