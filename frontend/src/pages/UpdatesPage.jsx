import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const empty = { title: '', body: '', category: 'General', priority: 'Normal' };

const UpdatesPage = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/announcements').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const postedBy = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Admin';

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/announcements', { ...form, postedBy, status: 'Active' });
      setForm(empty);
      setShowForm(false);
      load();
    } catch { } finally { setSaving(false); }
  };

  const priorityColor = p => ({ High: 'badge-inactive', Normal: 'badge-active', Low: 'badge-role-tenant' }[p] || 'badge-active');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📢 Updates</h1>
          <p>Community announcements &amp; notices</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Post Update'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>Post Announcement</h3>
          <div className="form-row-3">
            <div className="auth-field"><label>TITLE</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Notice / Announcement title" />
            </div>
            <div className="auth-field"><label>CATEGORY</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>General</option><option>Maintenance</option><option>Event</option><option>Emergency</option><option>Finance</option>
              </select>
            </div>
            <div className="auth-field"><label>PRIORITY</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option>Normal</option><option>High</option><option>Low</option>
              </select>
            </div>
          </div>
          <div className="auth-field"><label>MESSAGE</label>
            <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={4} placeholder="Write your announcement…" />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Posting…' : 'Post Announcement'}</button>
        </form>
      )}

      {loading ? <div className="loading-state">Loading…</div> : (
        items.length === 0 ? (
          <div className="empty-state">No announcements yet.</div>
        ) : (
          <div className="update-list">
            {items.map(a => (
              <div key={a.id} className={`update-card priority-${(a.priority||'normal').toLowerCase()}`}>
                <div className="update-top">
                  <div className="update-badges">
                    <span className="badge badge-category">{a.category || 'General'}</span>
                    <span className={`badge ${priorityColor(a.priority)}`}>{a.priority || 'Normal'}</span>
                  </div>
                  <span className="update-date">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : ''}</span>
                </div>
                <h3 className="update-title">{a.title}</h3>
                {a.body && <p className="update-body">{a.body}</p>}
                {a.postedBy && <p className="update-poster">— {a.postedBy}</p>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default UpdatesPage;
