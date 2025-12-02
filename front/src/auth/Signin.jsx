import React, { useEffect, useRef, useState } from "react";
import keycloak from "../services/keycloak";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../services/keycloakSignup";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated via Keycloak, redirect to auctions (only once)
    if (keycloak.authenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      if (keycloak.token) {
        localStorage.setItem("token", keycloak.token);
      }
      navigate("/auctions");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(username, password);
      // Save token to localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("refreshToken", result.refreshToken);
      
      // Redirect to auctions
      navigate("/auctions");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithKeycloak = () => {
    keycloak.login({
      redirectUri: window.location.origin + "/auctions"
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center mb-4">Auction Platform</h2>
          <p className="text-muted text-center mb-4">Sign in to participate in auctions</p>

          {error && (
            <div className={`alert alert-${error.includes('successfully') ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username or Email</label>
              <input 
                type="text" 
                id="username" 
                className="form-control" 
                onChange={(e) => setUsername(e.target.value)} 
                value={username}
                placeholder="Enter your username"
                required 
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-control" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
                placeholder="Enter your password"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <hr className="my-3" />

          <button 
            onClick={loginWithKeycloak} 
            className="btn btn-outline-primary btn-lg w-100 mb-3"
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login with Keycloak
          </button>

          <div className="text-center">
            <p className="text-muted">Don't have an account? <Link to="/auth/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}