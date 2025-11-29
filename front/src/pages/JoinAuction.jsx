import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axiosInstance from "../services/axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import keycloak from "../services/keycloak";

export default function JoinAuction() {
    const [auction, setAuction] = useState(null);
    const [bid, setBid] = useState("");
    const [bids, setBids] = useState([]);
    const [winnerMessage, setWinnerMessage] = useState("");
    const [auctionStatus, setAuctionStatus] = useState('Inactive');
    
    let params = useParams();
    const auctionId = params.id;
   
    const stompClientRef = useRef(null);
    
    const token = keycloak.token || localStorage.getItem("token");
    const userName = keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.email || "Anonymous";

    const fetchAuction = async () => {
        try {
            const response = await axiosInstance.get(`/auction/${auctionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAuction(response.data);
        } catch (error) {
            console.error("Error fetching auction:", error);
        }
    };

    useEffect(() => {
        fetchAuction();
        
        // Initialize STOMP client for WebSocket
        if (!stompClientRef.current) {
            const socket = new SockJS("http://localhost:8080/ws");
            const client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (str) => {
                    console.log('STOMP: ' + str);
                },
                onConnect: () => {
                    console.log("Connected to WebSocket");

                    // Subscribe to auction start events
                    client.subscribe(`/topic/auction/${auctionId}/start`, (message) => {
                        console.log("Auction started:", message.body);
                        setAuctionStatus("Auction is active");
                        setWinnerMessage("");
                    });

                    // Subscribe to auction end events
                    client.subscribe(`/topic/auction/${auctionId}/end`, (message) => {
                        console.log("Auction ended:", message.body);
                        const data = JSON.parse(message.body);
                        setWinnerMessage(data.message || `Winner: ${data.winnerId || 'No winner'}`);
                        setAuctionStatus("Auction closed");
                    });

                    // Subscribe to new bids
                    client.subscribe(`/topic/auction/${auctionId}/bids`, (message) => {
                        console.log("New bid received:", message.body);
                        const bidData = JSON.parse(message.body);
                        setBids((prevBids) => [...prevBids, {
                            userName: bidData.userName || bidData.userId,
                            amount: bidData.bidAmount || bidData.amount
                        }]);
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                }
            });

            client.activate();
            stompClientRef.current = client;
        }
    
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [auctionId]);

    const sendBid = async () => {
        if (!bid.trim()) {
            alert("Please enter a bid amount");
            return;
        }
    
        try {
            const response = await axiosInstance.post(
                `/bids?auctionId=${auctionId}`,
                {
                    bidAmount: parseFloat(bid),
                    auctionId: parseInt(auctionId),
                    userId: userName
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            console.log("Bid placed successfully:", response.data);
            setBid("");
        } catch (error) {
            console.error("Error placing bid:", error);
            alert(error.response?.data?.message || "Failed to place bid");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h2 className="card-title">{auction ? auction.itemName : "Loading auction..."}</h2>
                    </div>
                    <div className="card-body">
                        {/* Auction Details */}
                        {auction && (
                            <div className="mb-4">
                                <p><strong>Description:</strong> {auction.description}</p>
                                <p><strong>Starting Price:</strong> ${auction.startingPrice}</p>
                            </div>
                        )}

                        {/* Auction Status */}
                        <div className="alert alert-info">
                            <strong>Auction Status:</strong> {auctionStatus}
                        </div>

                        {/* Bids Section */}
                        <div className="mb-4">
                            <h3 className="mb-3">Bids</h3>
                            <div className="list-group">
                                {bids.length > 0 ? (
                                    bids.map((bidData, index) => (
                                        <div key={index} className="list-group-item">
                                            <strong>{bidData.userName}</strong> placed a bid of <strong>${bidData.amount}</strong>
                                        </div>
                                    ))
                                ) : (
                                    <div className="list-group-item text-muted">No bids yet</div>
                                )}
                            </div>
                        </div>

                        {/* Place Bid Section */}
                        {auctionStatus === "Auction is active" && (
                            <div className="mb-4">
                                <h3 className="mb-3">Place a Bid</h3>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter your bid amount"
                                        value={bid}
                                        onChange={(e) => setBid(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                    <button className="btn btn-primary" onClick={sendBid}>Place Bid</button>
                                </div>
                            </div>
                        )}

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