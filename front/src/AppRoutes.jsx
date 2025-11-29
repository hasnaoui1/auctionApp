import { useState, useEffect } from "react"; 
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import JoinAuction from "./pages/JoinAuction";
import Signin from "./auth/Signin";
import Signup from "./auth/signup";
import Home from "./pages/Home";
import Logout from "./components/Logout";
import Auctions from "./pages/Auctions";
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/auth/signin" />;
};

export default function AppRoutes() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth/signin" element={<Signin />} />
                <Route path="/auth/signup" element={<Signup />} />
                
              
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/auction/:id" element={<ProtectedRoute><JoinAuction /></ProtectedRoute>} />
                <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
                <Route path="/auctions" element={<ProtectedRoute><Auctions /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}
