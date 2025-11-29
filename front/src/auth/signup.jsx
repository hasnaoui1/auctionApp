import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/keycloakSignup';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await registerUser(username, email, password, firstName, lastName);
      // Redirect to signin after successful registration
      navigate('/auth/signin');
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="card-body p-5">
          <h3 className="card-title text-center mb-4">Create Account</h3>
          {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">First Name (Optional)</label>
              <input 
                type="text" 
                id="firstName" 
                className="form-control" 
                onChange={(e) => setFirstName(e.target.value)} 
                value={firstName}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">Last Name (Optional)</label>
              <input 
                type="text" 
                id="lastName" 
                className="form-control" 
                onChange={(e) => setLastName(e.target.value)} 
                value={lastName}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input 
                type="text" 
                id="username" 
                className="form-control" 
                onChange={(e) => setUsername(e.target.value)} 
                value={username}
                required 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-control" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
                required 
              />
              <small className="text-muted">At least 8 characters</small>
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                className="form-control" 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                value={confirmPassword}
                required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <div className="text-center">
              <p className="text-muted">Already have an account? <a href="/auth/signin">Sign In</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
