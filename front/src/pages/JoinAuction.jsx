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
    const [auctionStatus, setAuctionStatus] = useState('Loading...');
    const [hasJoined, setHasJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [participants, setParticipants] = useState([]);
    
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
            // Set status based on the active boolean from backend
            const status = response.data.active ? 'Active' : 'Inactive';
            setAuctionStatus(status);
            // Get participants list
            setParticipants(response.data.participants || []);
            console.log("Auction fetched - Status:", status, "Active:", response.data.active, "Participants:", response.data.participants);
        } catch (error) {
            console.error("Error fetching auction:", error);
            setAuctionStatus('Error loading auction');
        }
    };

    const fetchBids = async () => {
        try {
            const response = await axiosInstance.get(`/bids`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("All bids from backend:", response.data);
            
            // Filter bids for this auction
            const auctionBids = response.data.filter(b => {
                const bidAuctionId = b.auction?.id || b.auctionId;
                return bidAuctionId === parseInt(auctionId);
            });
            
            console.log("Filtered bids for auction", auctionId, ":", auctionBids);
            
            // Map bids to display format
            const formattedBids = auctionBids.map((b, index) => ({
                key: index,
                userName: b.bidderId || b.userId || 'Unknown User',
                amount: b.amount || 0
            }));
            
            setBids(formattedBids);
            console.log("Formatted bids:", formattedBids);
        } catch (error) {
            console.error("Error fetching bids:", error);
        }
    };

    const joinAuction = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/auction/join/${auctionId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Successfully joined auction:", response.data);
            setHasJoined(true);
            alert("You've successfully joined the auction!");
            fetchAuction(); // Refresh participants list
        } catch (error) {
            console.error("Error joining auction:", error);
            alert(error.response?.data?.message || "Failed to join auction");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {},[auction?.status , participants])


    useEffect(() => {
        fetchAuction();
        fetchBids();
            
         if (!stompClientRef.current) {
            const socket = new SockJS("http://localhost:8080/ws", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

                    client.subscribe(`/topic/auction/${auctionId}/start`, (message) => {
                        console.log("Auction started via WebSocket:", message.body);
                        setAuctionStatus('Active');
                        setWinnerMessage("");
                        fetchAuction(); 
                    });

                    
                    client.subscribe(`/topic/auction/${auctionId}/end`, (message) => {
                        console.log("Auction ended via WebSocket:", message.body);
                        setWinnerMessage(`Winner: ${message.body || 'No winner'}`);
                        setAuctionStatus('Inactive');
                        fetchAuction(); 
                    });

                 
                    client.subscribe(`/topic/auction/${auctionId}/bids`, (message) => {
                        console.log("New bid received via WebSocket:", message.body);
                        fetchBids(); 
                    });

                    // Subscribe to participant join events
                    client.subscribe(`/topic/auction/${auctionId}/participants`, (message) => {
                        console.log("New participant joined:", message.body);
                        fetchAuction(); // Refresh auction to get updated participants list
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
    }, [auctionId, token]);

    const sendBid = async () => {
        if (!bid.trim()) {
            alert("Please enter a bid amount");
            return;
        }
    
        try {
            const response = await axiosInstance.post(
                `/bids/${auctionId}`,
                {
                    amount: parseFloat(bid),
                   
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            console.log("Bid placed successfully:", response.data);
            setBid("");
            await fetchBids(); // Refresh bids list
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
                            <strong>Auction Status:</strong> {auctionStatus || (auction ? (auction.active ? 'Active' : 'Inactive') : 'Loading...')}
                        </div>

                        {/* Participants Section */}
                        <div className="mb-4">
                            <h3 className="mb-3">Participants ({participants.length})</h3>
                            <div className="list-group">
                                {participants.length > 0 ? (
                                    participants.map((participant, index) => (
                                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>
                                                <i className="bi bi-person-circle me-2"></i>
                                                <strong>{participant}</strong>
                                            </span>
                                            {participant === userName && <span className="badge bg-success">You</span>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="list-group-item text-muted">No participants yet</div>
                                )}
                            </div>
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
                        {auctionStatus === 'Active' ? (
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
                        ) : (
                            <div className="alert alert-warning mt-4">
                                <strong>Auction is not active.</strong> You cannot place bids at this time.
                            </div>
                        )}

                        {/* Winner Message */}
                        {winnerMessage && (
                            <div className="alert alert-success mt-4">
                                <h2>Auction Result</h2>
                                <p>{winnerMessage}</p>
                            </div>
                        )}

                        {!hasJoined && (
                            <button 
                                className="btn btn-success mt-3" 
                                onClick={joinAuction}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Joining...
                                    </>
                                ) : (
                                    'Join Auction'
                                )}
                            </button>
                        )}
                        {hasJoined && <p className="text-success mt-3"><strong>✓ You have joined this auction</strong></p>}
                    </div>
                </div>
            </div>
        </>
    );
}