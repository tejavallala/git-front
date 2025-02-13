import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaClock, FaShoppingCart, FaFilter } from 'react-icons/fa';

function BuyLand() {
  const [lands, setLands] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllLands();
  }, []);

  const fetchAllLands = async () => {
    try {
      const response = await axios.get('http://localhost:4000/landRoute/available-lands');
      const availableLands = response.data.filter(land => land.verificationStatus !== 'rejected');
      setLands(availableLands);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching lands:', error);
      setError('Failed to fetch lands');
      setIsLoading(false);
    }
  };

  const handleBuyRequest = async (landId) => {
    try {
      const buyerId = sessionStorage.getItem('userId');
      const response = await axios.post(`http://localhost:4000/landRoute/buy-request/${landId}`, {
        buyerId,
        requestDate: new Date()
      });
      alert('Buy request sent successfully!');
    } catch (error) {
      console.error('Error sending buy request:', error);
      alert('Failed to send buy request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success rounded-pill shadow-sm"><FaCheckCircle className="me-1" /> Verified</span>;
      case 'rejected':
        return <span className="badge bg-danger rounded-pill shadow-sm"><FaTimesCircle className="me-1" /> Rejected</span>;
      default:
        return <span className="badge bg-warning rounded-pill shadow-sm"><FaClock className="me-1" /> Pending Verification</span>;
    }
  };

  const filteredLands = lands.filter(land => {
    if (filter === 'verified') return land.verificationStatus === 'approved';
    if (filter === 'unverified') return land.verificationStatus === 'pending';
    return true; // 'all'
  });

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
  if (error) return <div className="alert alert-danger m-3 shadow-sm">{error}</div>;

  return (
    <div className="container mt-5">
      {/* Inline CSS for text gradient */}
      <style>
        {`
          .text-gradient {
            background: linear-gradient(90deg, #007bff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .hover-scale {
            transition: transform 0.2s ease-in-out;
          }
          .hover-scale:hover {
            transform: scale(1.02);
          }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="mb-0 display-5 fw-bold text-gradient">Available Lands</h2>
        <div className="btn-group shadow-sm">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-start-pill`}
            onClick={() => setFilter('all')}
          >
            All Lands
          </button>
          <button 
            className={`btn ${filter === 'verified' ? 'btn-primary' : 'btn-outline-primary'} rounded-0`}
            onClick={() => setFilter('verified')}
          >
            Verified Only
          </button>
          <button 
            className={`btn ${filter === 'unverified' ? 'btn-primary' : 'btn-outline-primary'} rounded-end-pill`}
            onClick={() => setFilter('unverified')}
          >
            Unverified Only
          </button>
        </div>
      </div>

      {filteredLands.length === 0 ? (
        <div className="alert alert-info shadow-sm text-center py-4">
          <h5 className="mb-0">No lands found matching the selected filter.</h5>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredLands.map((land) => (
            <div key={land._id} className="col">
              <div className="card h-100 shadow-sm border-0 hover-scale" style={{ transition: 'transform 0.2s ease-in-out' }}>
                {land.landImages && land.landImages[0] && (
                  <img
                    src={`data:${land.landImages[0].contentType};base64,${land.landImages[0].data}`}
                    className="card-img-top img-fluid rounded-top"
                    alt="Land"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0 text-gradient">{land.location}</h5>
                    {getStatusBadge(land.verificationStatus)}
                  </div>

                  <div className="mb-4">
                    <p className="mb-2"><strong>Survey Number:</strong> {land.surveyNumber}</p>
                    <p className="mb-2"><strong>Area:</strong> {land.area} sq ft</p>
                    <p className="mb-2"><strong>Price:</strong> ₹{land.price.toLocaleString('en-IN')}</p>
                    <p className="mb-0"><strong>Owner:</strong> {land.name}</p>
                  </div>

                  <div className="mt-auto">
                    {land.verificationStatus === 'approved' ? (
                      <button
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center py-2 fw-bold hover-scale"
                        onClick={() => handleBuyRequest(land._id)}
                        style={{ transition: 'transform 0.2s ease-in-out' }}
                      >
                        <FaShoppingCart className="me-2" />
                        Send Buy Request
                      </button>
                    ) : (
                      <div className="alert alert-warning mb-0 shadow-sm">
                        <small>
                          <FaTimesCircle className="me-1" />
                          This land needs to be verified before purchase
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyLand;