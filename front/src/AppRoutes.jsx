import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import JoinAuction from "./JoinAuction";
import Signin from "./auth/signin";
import Home from "./pages/Home";
import Logout from "./components/Logout";
import Auctions from "./pages/Auctions";



export default function AppRoutes() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={token ? <Home /> : <Navigate to="/auth/signin" />} />
                <Route path="auction" element={<JoinAuction />} />
                <Route path="auth/signin" element={<Signin/>} />
                <Route path="" element={<Home />} />
                <Route path="/logout" element={<Logout/>} />
                <Route path="/auctions" element={<Auctions/>} />


               
            </Routes>
        
        </BrowserRouter>
    );
}
