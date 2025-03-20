import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import axiosInstance from '../services/axiosInstance';

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance.post('/login', { email, password })
      .then((res) =>{console.log(res);
         localStorage.setItem('token', res);
                navigate('/auction');})
      .catch((err) => setError(err.response.data.message));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h3 className="card-title text-center mb-4">Sign In</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
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
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}
