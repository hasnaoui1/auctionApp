// Service to handle user registration via Keycloak API

const KEYCLOAK_URL = "http://localhost:9090";
const REALM = "realm-demo";
const CLIENT_ID = "demo";

/**
 * Register a new user via Keycloak User Registration API
 */
export async function registerUser(username, email, password, firstName = "", lastName = "") {
    try {
        // Use Keycloak's user registration endpoint
        const response = await fetch(
            `${KEYCLOAK_URL}/realms/${REALM}/clients-registrations/openid-connect`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    username: username,
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    enabled: true,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || errorData.error || "Registration failed");
        }

        return { success: true, message: "User registered successfully" };
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}

/**
 * Login user with username/password and get token
 */
export async function loginUser(username, password) {
    try {
        const response = await fetch(
            `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "password",
                    client_id: CLIENT_ID,
                    username: username,
                    password: password,
                    scope: "openid profile email",
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || "Invalid username or password");
        }

        const data = await response.json();
        return {
            token: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        };
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}