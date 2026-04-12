import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const ROLES = [
  'President',
  'Vice President',
  'Ex-President',
  'Treasurer',
  'Secretary',
  'Joint Secretary',
  'Committee Member',
];

const TERM_DURATIONS = [
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '1 Year', months: 12 },
  { label: '2 Years', months: 24 },
  { label: '3 Years', months: 36 },
  { label: '5 Years', months: 60 },
  { label: 'Custom', months: 0 },
];

const TERM_LIMITED_ROLES = ['President', 'Vice President'];
const MAX_TERM_MONTHS = 60; // 5 years

const ROLE_ICONS = {
  'President': '🏛️',
  'Vice President': '🏢',
  'Ex-President': '📜',
  'Treasurer': '💰',
  'Secretary': '📝',
  'Joint Secretary': '📋',
  'Committee Member': '👥',
};

const ROLE_ORDER = {
  'President': 0,
  'Vice President': 1,
  'Ex-President': 2,
  'Treasurer': 3,
  'Secretary': 4,
  'Joint Secretary': 5,
  'Committee Member': 6,
};

const empty = {
  role: '', name: '', flatNo: '', phone: '', email: '',
  termStart: '', termEnd: '', termDuration: '', notes: '', isActive: true,
};

const CommitteePage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filterRole, setFilterRole] = useState('All');

  const load = () => {
    api.get('/committee').then(r => setMembers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDurationChange = (durLabel) => {
    const dur = TERM_DURATIONS.find(d => d.label === durLabel);
    if (!dur || dur.months === 0) {
      setForm({ ...form, termDuration: durLabel });
      return;
    }
    const start = form.termStart || new Date().toISOString().split('T')[0];
    const startDate = new Date(start);
    startDate.setMonth(startDate.getMonth() + dur.months);
    const endDate = startDate.toISOString().split('T')[0];
    setForm({ ...form, termStart: start || form.termStart, termEnd: endDate, termDuration: durLabel });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    // Client-side term validation for President/VP
    if (TERM_LIMITED_ROLES.includes(form.role) && form.termStart && form.termEnd) {
      const start = new Date(form.termStart);
      const end = new Date(form.termEnd);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (diffMonths > MAX_TERM_MONTHS) {
        setError(`${form.role} term cannot exceed 5 years.`);
        return;
      }
    }

    setSaving(true);
    try {
      if (editId) {
        await api.put(`/committee/${editId}`, form);
      } else {
        await api.post('/committee', form);
      }
      setForm(empty);
      setEditId(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  const handleEdit = (m) => {
    setForm({
      role: m.role, name: m.name, flatNo: m.flatNo || '', phone: m.phone || '',
      email: m.email || '', termStart: m.termStart || '', termEnd: m.termEnd || '',
      termDuration: m.termDuration || '', notes: m.notes || '', isActive: m.isActive,
    });
    setEditId(m.id);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this committee member?')) return;
    try { await api.delete(`/committee/${id}`); load(); } catch {}
  };

  // Group and sort
  const sorted = [...members].sort((a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99));
  const filtered = filterRole === 'All' ? sorted : sorted.filter(m => m.role === filterRole);

  const grouped = filtered.reduce((acc, m) => {
    const key = m.role || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const isTermActive = (m) => {
    if (!m.termEnd) return m.isActive;
    return new Date(m.termEnd) >= new Date();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🏛️ Committee</h1>
          <p>Apartment association office bearers &amp; committee members</p>
        </div>
        {isAdmin && (
          <button className="btn-add" onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); setError(null); }}>
            {showForm ? '✕ Cancel' : '+ Add Member'}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>{editId ? 'Edit Committee Member' : 'Add Committee Member'}</h3>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.75rem', color: '#b91c1c', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <div className="form-row-3">
            <div className="auth-field"><label>ROLE *</label>
              <select required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="">Select role…</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="auth-field"><label>NAME *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="auth-field"><label>FLAT NO.</label>
              <input value={form.flatNo} onChange={e => setForm({ ...form, flatNo: e.target.value })} placeholder="e.g. 303" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="auth-field"><label>PHONE</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="auth-field"><label>EMAIL</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="auth-field"><label>STATUS</label>
              <select value={form.isActive ? 'Active' : 'Inactive'} onChange={e => setForm({ ...form, isActive: e.target.value === 'Active' })}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-row-3">
            <div className="auth-field"><label>TERM DURATION</label>
              <select value={form.termDuration} onChange={e => handleDurationChange(e.target.value)}>
                <option value="">Select duration…</option>
                {TERM_DURATIONS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
              </select>
              {TERM_LIMITED_ROLES.includes(form.role) && (
                <small style={{ color: '#b45309', display: 'block', marginTop: '0.25rem' }}>⚠ {form.role} max term: 5 years</small>
              )}
            </div>
            <div className="auth-field"><label>TERM START *</label>
              <input type="date" required value={form.termStart} onChange={e => setForm({ ...form, termStart: e.target.value })} />
            </div>
            <div className="auth-field"><label>TERM END *</label>
              <input type="date" required value={form.termEnd} onChange={e => setForm({ ...form, termEnd: e.target.value })} />
            </div>
          </div>
          <div className="auth-field"><label>NOTES</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Additional notes…" />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : (editId ? 'Update Member' : 'Add Member')}</button>
        </form>
      )}

      <div className="filter-bar">
        {['All', ...ROLES].map(r => {
          const count = r === 'All' ? members.length : members.filter(m => m.role === r).length;
          return (
            <button key={r} className={`filter-btn${filterRole === r ? ' active' : ''}`} onClick={() => setFilterRole(r)}>
              {r} {count > 0 && <span className="filter-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        Object.keys(grouped).length === 0 ? (
          <div className="empty-state">No committee members added yet.</div>
        ) : (
          Object.entries(grouped).map(([role, items]) => (
            <div key={role} className="committee-section">
              <h3 className="committee-section-title">{ROLE_ICONS[role] || '👤'} {role}</h3>
              <div className="committee-cards">
                {items.map(m => {
                  const active = isTermActive(m);
                  return (
                    <div key={m.id} className={`committee-card ${active ? '' : 'committee-card-inactive'}`}>
                      <div className="committee-card-header">
                        <div className="committee-avatar">{m.name?.[0]?.toUpperCase() || '?'}</div>
                        <div className="committee-card-title">
                          <div className="committee-name">{m.name}</div>
                          <div className="committee-role-badge">
                            <span className={`badge ${active ? 'badge-active' : 'badge-inactive'}`}>
                              {active ? 'Active' : 'Term Ended'}
                            </span>
                            {m.flatNo && <span className="badge-flat">{m.flatNo}</span>}
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="committee-card-actions">
                            <button className="btn-status-reopen" onClick={() => handleEdit(m)} title="Edit">✏️</button>
                            <button className="btn-status-reopen" onClick={() => handleDelete(m.id)} title="Remove">🗑️</button>
                          </div>
                        )}
                      </div>
                      <div className="committee-card-body">
                        {m.phone && <div className="committee-detail">📱 {m.phone}</div>}
                        {m.email && <div className="committee-detail">✉️ {m.email}</div>}
                        <div className="committee-detail">📅 {formatDate(m.termStart)} — {formatDate(m.termEnd)}</div>
                        {m.termDuration && <div className="committee-detail">⏱️ {m.termDuration}</div>}
                        {m.notes && <div className="committee-detail committee-notes">📝 {m.notes}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default CommitteePage;
