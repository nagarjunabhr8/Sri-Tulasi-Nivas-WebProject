import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const RSVP_OPTIONS = [
  { value: 'INTERESTED',     label: 'Interested',     emoji: '✅', bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', emoji: '❌', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  { value: 'NOT_AVAILABLE',  label: 'Not Available',  emoji: '🚫', bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  { value: 'OTHER_PLANS',    label: 'Other Plans',    emoji: '📅', bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [event, setEvent]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch {
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status) => {
    setRsvpLoading(true);
    try {
      const res = await api.post(`/events/${id}/rsvp`, { rsvpStatus: status });
      setEvent(res.data);
    } catch {
      // silent
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading event…</div>;
  if (!event)  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>{error || 'Event not found.'}</p>
      <Link to="/events" style={{ color: '#b45309' }}>← Back to Events</Link>
    </div>
  );

  const counts = event.rsvpCounts || {};

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px' }}>
      <Link to="/events" style={{ color: '#b45309', fontSize: 14, textDecoration: 'none' }}>← Back to Events</Link>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>{event.title}</h1>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 15, color: '#555', marginBottom: 20 }}>
        <span>📅 {formatDate(event.eventDate)}</span>
        <span>📍 {event.location}</span>
        {event.status && <span>📌 {event.status}</span>}
        {event.initiatedBy && <span>👤 Organised by <strong>{event.initiatedBy}</strong></span>}
      </div>

      {event.description && (
        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#333', marginBottom: 24 }}>{event.description}</p>
      )}

      {event.festivalLink && (
        <a href={event.festivalLink} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', marginBottom: 24, color: '#b45309', fontSize: 14, fontWeight: 500 }}>
          🔗 Learn about this festival
        </a>
      )}

      {/* RSVP */}
      {user && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Will you attend?</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {RSVP_OPTIONS.map(opt => {
              const selected = event.userRsvp === opt.value;
              return (
                <button key={opt.value} disabled={rsvpLoading}
                  onClick={() => handleRsvp(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 24, fontSize: 14,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: selected ? opt.border : opt.bg,
                    border: `2px solid ${opt.border}`,
                    color: selected ? '#fff' : opt.text,
                    fontWeight: selected ? 700 : 500,
                  }}>
                  {opt.emoji} {opt.label}
                  {counts[opt.value] > 0 && (
                    <span style={{ background: selected ? 'rgba(255,255,255,0.3)' : opt.border, color: '#fff', borderRadius: 999, padding: '1px 8px', fontSize: 12, fontWeight: 700 }}>
                      {counts[opt.value]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {event.userRsvp && (
            <div style={{ marginTop: 12, fontSize: 14, color: '#555' }}>
              Your response: <strong>{RSVP_OPTIONS.find(o => o.value === event.userRsvp)?.emoji} {RSVP_OPTIONS.find(o => o.value === event.userRsvp)?.label}</strong>
            </div>
          )}
        </div>
      )}

      {/* Attendance summary */}
      {Object.values(counts).some(c => c > 0) && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Attendance Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {RSVP_OPTIONS.map(opt => (
              <div key={opt.value} style={{ background: opt.bg, border: `1px solid ${opt.border}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, color: opt.text, fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: opt.text }}>{counts[opt.value] || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
