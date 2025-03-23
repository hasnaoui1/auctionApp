import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../services/axiosInstance";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function JoinAuction() {
    const [auction, setAuction] = useState(null);
    const [bid, setBid] = useState("");
    const [bids, setBids] = useState([]);
    const [winnerMessage, setWinnerMessage] = useState("");
    const [auctionStatus, setAuctionStatus] = useState('Inactive');
    

    let params = useParams();
    const auctionId = params.id;
   
    const socketRef = useRef(null);
    
    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userName = decoded?.email || "Anonymous";

    const fetchAuction = async () => {
        try {
            const response = await axiosInstance.get(`/auction/${auctionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAuction(response); 
        } catch (error) {
            console.error("Error fetching auction:", error);
        }
    };

    useEffect(() => {
        fetchAuction();
        
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:3008");
    
            socketRef.current.on("userJoined", (data) => {
                console.log("User joined:", data);
            });
    
            socketRef.current.on("auctionStarted", (data) => {
                console.log("Auction started:", data);
                setAuctionStatus("Auction is active");
                setWinnerMessage("");
                setBids([]);
            });
    
            socketRef.current.on("auctionClosed", (data) => {
                console.log("Auction closed:", data);
                setWinnerMessage(data.message);
                setAuctionStatus("Auction closed");
            });
    
            socketRef.current.on("newBid", (bidData) => {
                console.log("New bid received:", bidData);
                setBids((prevBids) => [...prevBids, bidData]);
            });
        }
    
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
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

            if (socketRef.current) {
                socketRef.current.emit("joinAuction", auctionId);
            }
        } catch (error) {
            console.error("Error joining auction:", error);
        }
    };

    const sendBid = async () => {
        if (!socketRef.current || !bid.trim()) return;
    
        try {
            const response = await axiosInstance.post(
                "/place-bid",
                { auctionId, bidAmount: bid },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            // Emit the bid event with userName and bid amount
            socketRef.current.emit("bid", { auctionId, bid: response.newBid.bidAmount, userName });
            setBid("");
        } catch (error) {
            console.error("Error placing bid:", error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h2 className="card-title">{auction ? auction.itemName : "Loading auction..."}</h2>
                        <button type="button" onClick={joinAuction} className="btn btn-dark">  Join</button>
                    </div>
                    <div className="card-body">
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
        </>
    );
}
