import React, { useEffect, useRef } from "react";
import keycloak from "../services/keycloak";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // If already authenticated, save token and redirect to auctions (only once)
    if (keycloak.authenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      // Save the token to localStorage so ProtectedRoute can access it
      if (keycloak.token) {
        localStorage.setItem("token", keycloak.token);
      }
      navigate("/auctions");
    }
  }, []);

  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin + "/auctions"
    }).then(() => {
      // Save token after successful login
      if (keycloak.token) {
        localStorage.setItem("token", keycloak.token);
      }
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body text-center p-5">
          <h2 className="mb-4">Auction Platform</h2>
          <p className="text-muted mb-4">Sign in to participate in auctions</p>
          <button 
            onClick={login} 
            className="btn btn-primary btn-lg w-100 mb-3"
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login with Keycloak
          </button>
          <p className="text-muted mb-0">
            Don't have an account? <a href="/auth/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}