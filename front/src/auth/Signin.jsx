import React, { useEffect, useRef, useState } from "react";
import keycloak from "../services/keycloak";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../services/keycloakSignup";


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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Auction Platform</h2>
          <p className="mt-2 text-sm text-slate-600">Sign in to participate in auctions</p>
        </div>

        {error && (
          <div className={`rounded-lg p-4 text-sm ${error.includes('successfully') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError("")}
                className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            onClick={loginWithKeycloak}
            className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white transition-all shadow-sm hover:shadow"
          >
            <svg className="mr-2 h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Keycloak
          </button>
        </div>

        <div className="text-center text-sm">
          <p className="text-slate-500">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}