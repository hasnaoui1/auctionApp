
import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axiosInstance from "../services/axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import keycloak from "../services/keycloak";

import "./JoinAuction.css";

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
            
            // Get bids from auction data
            if (response.data.bids) {
                const formattedBids = response.data.bids.map((b, index) => ({
                    key: index,
                    userName: b.bidderId || b.userId || 'Unknown User',
                    amount: b.amount || 0
                }));
                setBids(formattedBids);
            }

            console.log("Auction fetched - Status:", status, "Active:", response.data.active, "Participants:", response.data.participants);
        } catch (error) {
            console.error("Error fetching auction:", error);
            setAuctionStatus('Error loading auction');
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
            // alert("You've successfully joined the auction!"); // Removed alert for smoother UX
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
                        try {
                            const newBid = JSON.parse(message.body);
                            setBids(prev => {
                                // Check if bid already exists to avoid duplicates
                                const exists = prev.some(b => b.amount === newBid.amount && b.userName === (newBid.bidderId || newBid.userId));
                                if (exists) return prev;
                                
                                return [...prev, {
                                    key: prev.length,
                                    userName: newBid.bidderId || newBid.userId || 'Unknown User',
                                    amount: newBid.amount
                                }];
                            });
                        } catch (e) {
                            console.error("Error parsing bid message:", e);
                        }
                        fetchAuction(); 
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
            await fetchAuction(); // Refresh auction and bids
        } catch (error) {
            console.error("Error placing bid:", error);
            alert(error.response?.data?.message || "Failed to place bid");
        }
    };

    if (!auction) {
        return (
            <>
                <Navbar />
                <div className="loading-spinner"></div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="auction-container">
                <div className="auction-card">
                    <div className="auction-header">
                        <h1 className="auction-title">{auction.itemName}</h1>
                        <div style={{marginTop: '10px'}}>
                            <span className={`status-badge ${auctionStatus === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                {auctionStatus}
                            </span>
                        </div>
                    </div>
                    
                    <div className="auction-body">
                        {/* Left Column: Details & Participants */}
                        <div className="info-section">
                            <h3 style={{marginBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '10px'}}>Auction Details</h3>
                            
                            <div className="info-item">
                                <span className="info-label">Description</span>
                                <span className="info-value">{auction.description}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Starting Price</span>
                                <span className="info-value">${auction.startingPrice}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Current Price</span>
                                <span className="info-value" style={{color: '#4cd137', fontSize: '1.2rem'}}>${auction.currentPrice || auction.startingPrice}</span>
                            </div>

                            <div style={{marginTop: '30px'}}>
                                <h4 style={{color: '#a0a0a0', marginBottom: '15px'}}>Participants ({participants.length})</h4>
                                <div className="participants-list">
                                    {participants.length > 0 ? (
                                        participants.map((participant, index) => (
                                            <div key={index} className={`participant-chip ${participant === userName ? 'is-me' : ''}`}>
                                                <i className="bi bi-person-fill"></i>
                                                {participant}
                                            </div>
                                        ))
                                    ) : (
                                        <span style={{color: '#666'}}>No participants yet</span>
                                    )}
                                </div>
                            </div>

                            {!hasJoined && (
                                <button 
                                    className="join-btn-large" 
                                    onClick={joinAuction}
                                    disabled={loading}
                                >
                                    {loading ? 'Joining...' : 'Join Auction Now'}
                                </button>
                            )}
                        </div>

                        {/* Right Column: Bids & Actions */}
                        <div className="action-section">
                            <h3 style={{marginBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '10px'}}>Live Bidding</h3>
                            
                            {winnerMessage && (
                                <div className="winner-banner">
                                    🎉 {winnerMessage}
                                </div>
                            )}

                            <div className="bids-container">
                                {bids.length > 0 ? (
                                    [...bids].reverse().map((bidData, index) => (
                                        <div key={index} className="bid-item">
                                            <span className="bid-user">{bidData.userName}</span>
                                            <span className="bid-amount">${bidData.amount}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                                        <i className="bi bi-hammer" style={{fontSize: '2rem', display: 'block', marginBottom: '10px'}}></i>
                                        No bids placed yet
                                    </div>
                                )}
                            </div>

                            {auctionStatus === 'Active' && (
                                <div className="bid-input-group">
                                    <input
                                        type="number"
                                        className="bid-input"
                                        placeholder="Enter amount..."
                                        value={bid}
                                        onChange={(e) => setBid(e.target.value)}
                                        min={auction.currentPrice ? auction.currentPrice + 1 : 0}
                                        step="1"
                                    />
                                    <button className="btn-place-bid" onClick={sendBid}>
                                        Place Bid
                                    </button>
                                </div>
                            )}
                            
                            {auctionStatus !== 'Active' && !winnerMessage && (
                                <div style={{textAlign: 'center', marginTop: '20px', color: '#e74c3c'}}>
                                    Auction is currently inactive
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}