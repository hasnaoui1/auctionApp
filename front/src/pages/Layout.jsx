import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar/>
        <main className="flex-grow">
            <Outlet/>
        </main>
        <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Auction Platform. All rights reserved.
        </footer>
    </div>
  )
}