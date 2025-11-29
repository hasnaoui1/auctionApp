import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./services/keycloak";

keycloak
  .init({ onLoad: "check-sso", checkLoginIframe: false }) 
  .then((authenticated) => {
    console.log("Authenticated:", authenticated);
    console.log("Token:", keycloak.token);
    
    // Save token to localStorage if authenticated
    if (authenticated && keycloak.token) {
      localStorage.setItem("token", keycloak.token);
      console.log("Token saved to localStorage");
    }

    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((err) => console.error("Keycloak init failed", err));
