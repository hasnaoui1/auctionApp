
import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axiosInstance from "../services/axiosInstance";
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
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-6 md:p-10 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{auction.itemName}</h1>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${auctionStatus === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                {auctionStatus}
                            </span>
                        </div>
                        {!hasJoined && (
                            <button 
                                onClick={joinAuction}
                                disabled={loading}
                                className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Joining...' : 'Join Auction Now'}
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                        {/* Left Column: Details & Participants */}
                        <div className="col-span-2 p-6 md:p-10 space-y-8">
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Auction Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-slate-500 text-sm block mb-1">Description</span>
                                        <p className="text-slate-700 leading-relaxed">{auction.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-slate-500 text-sm block mb-1">Starting Price</span>
                                            <span className="text-xl font-medium text-slate-700">${auction.startingPrice}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 text-sm block mb-1">Current Price</span>
                                            <span className="text-2xl font-bold text-emerald-600">${auction.currentPrice || auction.startingPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-medium text-slate-600 mb-4 flex items-center">
                                    Participants 
                                    <span className="ml-2 bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full border border-slate-300">{participants.length}</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {participants.length > 0 ? (
                                        participants.map((participant, index) => (
                                            <div key={index} className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border ${participant === userName ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                                <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-75"></div>
                                                {participant}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 italic">No participants yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bids & Actions */}
                        <div className="p-6 md:p-10 flex flex-col h-full min-h-[500px]">
                            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Live Bidding
                            </h3>
                            
                            {winnerMessage && (
                                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center animate-pulse">
                                    <p className="text-amber-700 font-bold text-lg">🎉 {winnerMessage}</p>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto max-h-[400px] mb-6 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                {bids.length > 0 ? (
                                    [...bids].reverse().map((bidData, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                            <span className="text-slate-600 font-medium">{bidData.userName}</span>
                                            <span className="text-emerald-600 font-bold font-mono">${bidData.amount}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                        <div className="p-4 rounded-full bg-slate-100">
                                            <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p>No bids placed yet</p>
                                    </div>
                                )}
                            </div>

                            {auctionStatus === 'Active' ? (
                                <div className="mt-auto pt-6 border-t border-slate-200">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 transition-all shadow-inner"
                                            placeholder="Enter amount..."
                                            value={bid}
                                            onChange={(e) => setBid(e.target.value)}
                                            min={auction.currentPrice ? auction.currentPrice + 1 : 0}
                                            step="1"
                                        />
                                        <button 
                                            onClick={sendBid}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                                        >
                                            Place Bid
                                        </button>
                                    </div>
                                </div>
                            ) : !winnerMessage && (
                                <div className="mt-auto pt-6 border-t border-slate-200 text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                                    Auction is currently inactive
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}