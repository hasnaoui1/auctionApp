import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import keycloak from '../services/keycloak';
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const [userProfile, setUserProfile] = useState({
    username: "User",
    email: "No email available",
    name: "User",
  });

  useEffect(() => {
    const loadProfile = async () => {
      // Scenario 1: User logged in via Keycloak JS Adapter (e.g. "Keycloak" button)
      if (keycloak.authenticated) {
        try {
          const profile = await keycloak.loadUserProfile();
          setUserProfile({
            username: profile.username || keycloak.tokenParsed?.preferred_username || "User",
            email: profile.email || keycloak.tokenParsed?.email || "No email available",
            name: `${profile.firstName} ${profile.lastName}`.trim() || keycloak.tokenParsed?.name || "User",
          });
        } catch (err) {
          console.error("Failed to load user profile from Keycloak", err);
          // Fallback to token parsed if loadUserProfile fails
          if (keycloak.tokenParsed) {
             setUserProfile({
                username: keycloak.tokenParsed.preferred_username || "User",
                email: keycloak.tokenParsed.email || "No email available",
                name: keycloak.tokenParsed.name || keycloak.tokenParsed.given_name || "User",
             });
          }
        }
      } 
      // Scenario 2: User logged in via Custom Form (stored in localStorage)
      else {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = jwtDecode(token);
            setUserProfile({
              username: decoded.preferred_username || decoded.sub || "User",
              email: decoded.email || "No email available",
              name: decoded.name || decoded.given_name ? `${decoded.given_name} ${decoded.family_name || ''}`.trim() : "User",
            });
          } catch (err) {
            console.error("Failed to decode token from localStorage", err);
          }
        }
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-8 border-b border-slate-200 md:px-10">
            <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
            <p className="mt-2 text-slate-600">View your account information.</p>
          </div>
          <div className="px-6 py-8 md:px-10 space-y-8">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl border border-indigo-100 shadow-inner">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{userProfile.name}</h3>
                <p className="text-slate-500">@{userProfile.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 block mb-2">Email Address</span>
                <span className="text-lg text-slate-700">{userProfile.email}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 block mb-2">Account Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 border border-green-200">
                  Active
                </span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200">
               <button 
                onClick={() => {
                    if (keycloak.authenticated) {
                        keycloak.accountManagement();
                    } else {
                        window.open("http://localhost:9090/realms/realm-demo/account/", "_blank");
                    }
                }}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium transition-colors hover:translate-x-1 duration-200"
               >
                 Manage Account via Keycloak 
                 <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
