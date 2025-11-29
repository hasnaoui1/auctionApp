import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import keycloak from "../services/keycloak";

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
      setAuctions(res.data || []);
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
    return <div className="container mt-4 text-center text-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Auction Listings</h2>
      <div className="row">
        {auctions.length > 0 ? (
          auctions.map((auction) => (
            <div
              key={auction.id}
              className="col-md-4 mb-4"
              onClick={() => navigate(`/auction/${auction.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{auction.itemName}</h5>
                  <p className="card-text">{auction.description}</p>
                  <p className="card-text fw-bold">Starting Price: ${auction.startingPrice}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      Status: {auction.active ? 'Active' : 'Inactive'}
                    </small>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">No auctions available.</div>
        )}
      </div>
    </div>
  );
}