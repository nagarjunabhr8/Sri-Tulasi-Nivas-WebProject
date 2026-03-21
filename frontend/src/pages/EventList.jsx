import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/public/upcoming', {
        params: { page, size: 10 },
      });
      setEvents(response.data.content);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading events...</p></div>;

  return (
    <div className="container">
      <h1>Upcoming Community Events</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="event-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.title}</h3>
            <p className="event-date">📅 {new Date(event.eventDate).toLocaleDateString()}</p>
            <p className="event-location">📍 {event.location}</p>
            <p className="event-description">{event.description?.substring(0, 100)}...</p>
            <div className="event-stats">
              <span>Contributors: {event.contributionCount}</span>
              <span>Raised: ${event.totalContributed}</span>
              <span>Goal: ${event.estimatedBudget}</span>
            </div>
            <a href={`/events/${event.id}`} className="btn-primary">
              View & Contribute
            </a>
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

export default EventList;
