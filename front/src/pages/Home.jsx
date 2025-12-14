import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';


export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-16 py-12 lg:flex-row lg:py-24">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Discover Exclusive <span className="text-indigo-600">Auctions</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Bid on unique items and experience the thrill of real-time auctions. Your next treasure is just a bid away.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link to="/auctions">
                <button className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all transform hover:scale-105">
                  Explore Auctions
                </button>
              </Link>
              <Link to="/about" className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-2xl"></div>
            <img 
              src="auction.png" 
              alt="Auction" 
              className="relative rounded-2xl shadow-2xl ring-1 ring-slate-900/10 w-full object-cover transform hover:scale-[1.02] transition-transform duration-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
