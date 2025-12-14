import React, { useEffect } from "react";
import keycloak from "../services/keycloak";

export default function Logout() {
  useEffect(() => {
    // Clear local storage
    localStorage.removeItem("token");
    
    // Logout from Keycloak
    keycloak.logout({
      redirectUri: window.location.origin + "/auth/signin"
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-slate-400">Logging out...</p>
      </div>
    </div>
  );
}