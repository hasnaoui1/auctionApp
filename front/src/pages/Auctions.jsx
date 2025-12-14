import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

import { useNavigate } from "react-router-dom";
import keycloak from "../services/keycloak";
import Navbar from "../components/Navbar";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  async function fetchAuctions() {
    try {
      const token = keycloak.token || localStorage.getItem('token');
      console.log("Using token:", token ? "present" : "missing");
      
      const res = await axiosInstance.get("/auction", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res?.data)
      
      setAuctions(res?.data || [] );
    } catch (err) {
      console.error(err);
      setError("Failed to fetch auctions. Please try again later.");
      setAuctions([]);
    }
  }

  useEffect(() => {
    fetchAuctions();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar/>
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 text-center">Auction Listings</h2>
        
        {auctions?.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => navigate(`/auction/${auction.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 hover:border-slate-300"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${auction.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                      {auction.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-slate-500">ID: {auction.id}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {auction.itemName}
                  </h3>
                  <p className="mb-4 text-sm text-slate-600 line-clamp-2">
                    {auction.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Starting Price</span>
                      <span className="text-lg font-bold text-emerald-600">${auction.startingPrice}</span>
                    </div>
                    <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center flex-col items-center">
             <div className="rounded-lg bg-white p-12 text-center border border-slate-200 shadow-sm">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">No auctions available</h3>
                <p className="mt-1 text-sm text-slate-500">New auctions will appear here when they are created.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );

}