import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:9090/",
    realm: "realm-demo",
    clientId: "demo",
});

// Set up token interceptor to handle token refresh
keycloak.onTokenExpired = () => {
    keycloak.updateToken(5).catch(() => {
        console.log("Failed to refresh token");
    });
};

export default keycloak;
