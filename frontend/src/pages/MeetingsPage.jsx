import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const empty = {
  title: '', date: '', time: '', venue: 'Clubhouse', attendees: 0,
  agendaPoints: '', momPoints: '', actionItems: '', actionOwners: '',
  status: 'Upcoming',
  // WhatsApp settings
  reminderOption: 'NONE',
  notifyType: 'NONE',
  recipients: '',
  immediateNotify: false,
};

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/meetings').then(r => setMeetings(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/meetings', { ...form, attendees: parseInt(form.attendees) || 0 });
      setForm(empty);
      setShowForm(false);
      load();
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🗓️ Meetings</h1>
          <p>Committee meetings &amp; minutes of record</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Schedule Meeting'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>Schedule Meeting</h3>
          <div className="form-row-3">
            <div className="auth-field"><label>TITLE</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Monthly Committee Meeting" />
            </div>
            <div className="auth-field"><label>DATE</label>
              <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="auth-field"><label>TIME</label>
              <input value={form.time} onChange={e => setForm({...form, time: e.target.value})} placeholder="6:00 PM" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="auth-field"><label>VENUE</label>
              <input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
            </div>
            <div className="auth-field"><label>ATTENDEES</label>
              <input type="number" value={form.attendees} onChange={e => setForm({...form, attendees: e.target.value})} />
            </div>
            <div className="auth-field"><label>STATUS</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>Upcoming</option><option>Completed</option><option>Cancelled</option>
              </select>
            </div>
          </div>
          <div className="auth-field"><label>AGENDA POINTS</label>
            <textarea value={form.agendaPoints} onChange={e => setForm({...form, agendaPoints: e.target.value})} rows={3} placeholder="1. Maintenance collection\n2. Security update…" />
          </div>
          <div className="auth-field"><label>MINUTES OF MEETING</label>
            <textarea value={form.momPoints} onChange={e => setForm({...form, momPoints: e.target.value})} rows={3} placeholder="Meeting outcomes…" />
          </div>
          <div className="form-row-2">
            <div className="auth-field"><label>ACTION ITEMS</label>
              <textarea value={form.actionItems} onChange={e => setForm({...form, actionItems: e.target.value})} rows={2} placeholder="List of tasks…" />
            </div>
            <div className="auth-field"><label>ACTION OWNERS</label>
              <textarea value={form.actionOwners} onChange={e => setForm({...form, actionOwners: e.target.value})} rows={2} placeholder="Responsible persons…" />
            </div>
          </div>

          {/* ── WhatsApp Notifications ── */}
          <div className="whatsapp-section">
            <h4>📲 WhatsApp Notifications</h4>
            <div className="form-row-3">
              <div className="auth-field">
                <label>NOTIFY TYPE</label>
                <select value={form.notifyType} onChange={e => setForm({...form, notifyType: e.target.value})}>
                  <option value="NONE">None</option>
                  <option value="GROUP">All Residents (Group)</option>
                  <option value="INDIVIDUAL">Individual Numbers</option>
                </select>
              </div>
              <div className="auth-field">
                <label>REMINDER</label>
                <select value={form.reminderOption} onChange={e => setForm({...form, reminderOption: e.target.value})}>
                  <option value="NONE">No Reminder</option>
                  <option value="AT_TIME">At Meeting Time</option>
                  <option value="30_MIN">30 Minutes Before</option>
                  <option value="45_MIN">45 Minutes Before</option>
                  <option value="1_HOUR">1 Hour Before</option>
                  <option value="1_DAY">1 Day Before</option>
                </select>
              </div>
              <div className="auth-field whatsapp-immediate-row">
                <label>SEND ON CREATION</label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={form.immediateNotify}
                    onChange={e => setForm({...form, immediateNotify: e.target.checked})}
                  />
                  <span className="toggle-text">
                    {form.immediateNotify ? '✅ Send WhatsApp now' : 'Send WhatsApp on save'}
                  </span>
                </label>
              </div>
            </div>
            {form.notifyType === 'INDIVIDUAL' && (
              <div className="auth-field">
                <label>RECIPIENT PHONE NUMBERS</label>
                <input
                  value={form.recipients}
                  onChange={e => setForm({...form, recipients: e.target.value})}
                  placeholder="9876543210, 9123456789 (comma-separated, +91 added automatically)"
                />
              </div>
            )}
            {(form.notifyType !== 'NONE' || form.immediateNotify) && (
              <p className="whatsapp-hint">
                💡 Each resident must WhatsApp <strong>+34 644 82 70 37</strong> with "I allow callmebot to send me messages" to get their API key. Admin saves the key in their Residents profile. Apps Script URL must be set in <code>application-local.yml</code>.
              </p>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Meeting'}</button>
        </form>
      )}

      {loading ? <div className="loading-state">Loading…</div> : (
        meetings.length === 0 ? (
          <div className="empty-state">No meetings recorded yet.</div>
        ) : (
          <div className="meeting-list">
            {meetings.map(m => (
              <div key={m.id} className="meeting-card">
                <div className="meeting-header" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                  <div className="meeting-meta">
                    <span className="meeting-date">📅 {m.date}</span>
                    {m.time && <span className="meeting-time">🕐 {m.time}</span>}
                    <span className="meeting-venue">📍 {m.venue}</span>
                    {m.attendees > 0 && <span className="meeting-attendees">👥 {m.attendees}</span>}
                  </div>
                  <div className="meeting-title-row">
                    <h3>{m.title}</h3>
                    <span className={`badge badge-meeting-${(m.status||'upcoming').toLowerCase()}`}>{m.status}</span>
                    {m.notifyType && m.notifyType !== 'NONE' && (
                      <span className="badge-whatsapp" title={`WhatsApp: ${m.notifyType}`}>📲</span>
                    )}
                    <span className="expand-icon">{expanded === m.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expanded === m.id && (
                  <div className="meeting-body">
                    {m.agendaPoints && <div className="meeting-section"><h4>📋 Agenda</h4><pre>{m.agendaPoints}</pre></div>}
                    {m.momPoints && <div className="meeting-section"><h4>📝 Minutes</h4><pre>{m.momPoints}</pre></div>}
                    {m.actionItems && <div className="meeting-section"><h4>✅ Action Items</h4><pre>{m.actionItems}</pre></div>}
                    {m.actionOwners && <div className="meeting-section"><h4>👤 Owners</h4><pre>{m.actionOwners}</pre></div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MeetingsPage;
