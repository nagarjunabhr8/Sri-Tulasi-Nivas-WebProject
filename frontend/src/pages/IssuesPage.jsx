import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const empty = { flatNo: '', category: '', description: '', priority: 'Medium' };

const IssuesPage = () => {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const load = () => {
    api.get('/issues').then(r => setIssues(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const reportedBy = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/issues', { ...form, reportedBy, status: 'Open' });
      setForm(empty);
      setShowForm(false);
      load();
    } catch { } finally { setSaving(false); }
  };

  const filtered = filterStatus === 'All' ? issues : issues.filter(i => i.status === filterStatus);

  const statusColor = s => ({ Open: 'badge-inactive', 'In Progress': 'badge-role-owner', Resolved: 'badge-active', Closed: 'badge-role-admin' }[s] || 'badge-role-tenant');
  const priorityColor = p => ({ High: 'badge-inactive', Medium: 'badge-role-owner', Low: 'badge-active' }[p] || 'badge-role-tenant');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🔧 Issues</h1>
          <p>Maintenance requests &amp; complaint tracker</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Report Issue'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>Report Issue</h3>
          <div className="form-row-3">
            <div className="auth-field"><label>FLAT NO.</label>
              <input required value={form.flatNo} onChange={e => setForm({...form, flatNo: e.target.value})} placeholder="A-101" />
            </div>
            <div className="auth-field"><label>CATEGORY</label>
              <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="">Select…</option>
                {['Plumbing','Electrical','Carpentry','Cleaning','Security','Lift','Common Area','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="auth-field"><label>PRIORITY</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div className="auth-field"><label>DESCRIPTION</label>
            <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Describe the issue…" />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Submitting…' : 'Submit Issue'}</button>
        </form>
      )}

      <div className="filter-bar">
        {['All','Open','In Progress','Resolved','Closed'].map(s => (
          <button key={s} className={`filter-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Flat</th><th>Category</th><th>Description</th><th>Reported By</th><th>Priority</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">No issues found</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id}>
                  <td><span className="badge-flat">{i.flatNo}</span></td>
                  <td>{i.category}</td>
                  <td className="desc-cell">{i.description}</td>
                  <td>{i.reportedBy || '—'}</td>
                  <td><span className={`badge ${priorityColor(i.priority)}`}>{i.priority}</span></td>
                  <td><span className={`badge ${statusColor(i.status)}`}>{i.status}</span></td>
                  <td>{i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
