import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';


export default function Home() {
  return (
    <>
      <Navbar/>
      <div className="container mt-5">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <h1 className="display-4 fw-bold">Discover Exclusive Auctions</h1>
            <p className="lead text-muted">Bid on unique items and get the best deals in real-time auctions.</p>
            <Link to="/auctions">
            <button className="btn btn-primary btn-lg">Explore Auctions</button>
            </Link>
          </div>
          <div className="col-md-6 text-center">
            <img src="auction.png" alt="Auction" className="img-fluid rounded shadow-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
