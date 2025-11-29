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
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Logging out...</span>
      </div>
    </div>
  );
}