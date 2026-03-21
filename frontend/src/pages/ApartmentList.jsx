import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ApartmentList = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchApartments();
  }, [page]);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/apartments/public', {
        params: { page, size: 10 },
      });
      setApartments(response.data.content);
    } catch (err) {
      setError('Failed to load apartments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading apartments...</p></div>;

  return (
    <div className="container">
      <h1>Available Apartments</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="apartment-grid">
        {apartments.map((apt) => (
          <div key={apt.id} className="apartment-card">
            <div className="apt-header">
              <h3>{apt.unitNumber}</h3>
              <span className="apt-status">{apt.status}</span>
            </div>
            <div className="apt-info">
              <p><strong>Floor:</strong> {apt.floor}</p>
              <p><strong>Bedrooms:</strong> {apt.bedrooms} | <strong>Bathrooms:</strong> {apt.bathrooms}</p>
              <p><strong>Area:</strong> {apt.area} sq ft</p>
              <p><strong>Maintenance Fee:</strong> ${apt.maintenanceFee}/month</p>
              <p><strong>Owner:</strong> {apt.ownerName}</p>
            </div>
            {apt.description && <p className="apt-description">{apt.description}</p>}
            <div className="apt-amenities">
              <strong>Amenities:</strong> {apt.amenities}
            </div>
            <button className="btn-primary">View Details</button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default ApartmentList;
