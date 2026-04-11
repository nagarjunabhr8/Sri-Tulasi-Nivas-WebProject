import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const empty = { flatNo: '', category: '', description: '', priority: 'Medium' };

const NEXT_STATUS = {
  'Open': 'In Progress',
  'In Progress': 'Resolved',
  'Resolved': 'Closed',
};

// All valid forward/backward transitions per status
const ALL_TRANSITIONS = {
  'Open': ['In Progress'],
  'In Progress': ['Resolved', 'Open'],
  'Resolved': ['Closed', 'In Progress'],
  'Closed': ['Open'],
};

const IssuesPage = () => {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  // Status update modal state
  const [statusModal, setStatusModal] = useState(null); // { issue, targetStatus }
  const [statusForm, setStatusForm] = useState({ assignedTo: '', resolutionNotes: '' });
  const [updating, setUpdating] = useState(false);

  // Issue detail expand
  const [expandedId, setExpandedId] = useState(null);

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

  const openStatusModal = (issue, targetStatus) => {
    setStatusModal({ issue, targetStatus });
    setStatusForm({ assignedTo: issue.assignedTo || '', resolutionNotes: '' });
  };

  const handleStatusUpdate = async e => {
    e.preventDefault();
    if (!statusModal) return;
    setUpdating(true);
    try {
      await api.patch(`/issues/${statusModal.issue.id}/status`, {
        status: statusModal.targetStatus,
        assignedTo: statusForm.assignedTo,
        resolutionNotes: statusForm.resolutionNotes,
      });
      setStatusModal(null);
      setFilterStatus(statusModal.targetStatus);
      load();
    } catch { } finally { setUpdating(false); }
  };

  const handleReopen = async (issue) => {
    setUpdating(true);
    try {
      await api.patch(`/issues/${issue.id}/status`, { status: 'Open' });
      setFilterStatus('Open');
      load();
    } catch { } finally { setUpdating(false); }
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
        {['All','Open','In Progress','Resolved','Closed'].map(s => {
          const count = s === 'All' ? issues.length : issues.filter(i => i.status === s).length;
          return (
            <button key={s} className={`filter-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s} {count > 0 && <span className="filter-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Flat</th><th>Category</th><th>Description</th><th>Reported By</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="empty-row">No issues found</td></tr>
              ) : filtered.map(i => (
                <React.Fragment key={i.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}>
                    <td><span className="badge-flat">{i.flatNo}</span></td>
                    <td>{i.category}</td>
                    <td className="desc-cell">{i.description}</td>
                    <td>{i.reportedBy || '—'}</td>
                    <td>{i.assignedTo || <span style={{ color: '#999' }}>Unassigned</span>}</td>
                    <td><span className={`badge ${priorityColor(i.priority)}`}>{i.priority}</span></td>
                    <td><span className={`badge ${statusColor(i.status)}`}>{i.status}</span></td>
                    <td>{i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {(ALL_TRANSITIONS[i.status] || []).map(target => {
                        const isForward = NEXT_STATUS[i.status] === target;
                        const isReopen = target === 'Open';
                        return (
                          <button
                            key={target}
                            className={isForward ? 'btn-status-action' : 'btn-status-reopen'}
                            onClick={() => isReopen && i.status !== 'Resolved' && i.status !== 'Closed' ? handleReopen(i) : openStatusModal(i, target)}
                            title={isReopen ? 'Reopen' : `Move to ${target}`}
                          >
                            {isReopen ? '↩ Reopen' : `→ ${target}`}
                          </button>
                        );
                      })}
                    </td>
                  </tr>
                  {expandedId === i.id && (
                    <tr className="issue-detail-row">
                      <td colSpan={9}>
                        <div className="issue-detail-panel">
                          <div className="issue-detail-grid">
                            <div><strong>Reported By:</strong> {i.reportedBy || '—'}</div>
                            <div><strong>Assigned To:</strong> {i.assignedTo || 'Unassigned'}</div>
                            <div><strong>Created:</strong> {i.createdAt ? new Date(i.createdAt).toLocaleString('en-IN') : '—'}</div>
                            <div><strong>Last Updated:</strong> {i.updatedAt ? new Date(i.updatedAt).toLocaleString('en-IN') : '—'}</div>
                            {i.resolvedAt && <div><strong>Resolved At:</strong> {new Date(i.resolvedAt).toLocaleString('en-IN')}</div>}
                            {i.resolutionNotes && <div className="issue-resolution-notes"><strong>Resolution Notes:</strong> {i.resolutionNotes}</div>}
                          </div>
                          <div className="issue-status-timeline">
                            {['Open', 'In Progress', 'Resolved', 'Closed'].map((s, idx) => {
                              const statusOrder = { 'Open': 0, 'In Progress': 1, 'Resolved': 2, 'Closed': 3 };
                              const current = statusOrder[i.status];
                              const step = statusOrder[s];
                              return (
                                <div key={s} className={`timeline-step ${step < current ? 'completed' : step === current ? 'current' : 'pending'}`}>
                                  <div className="timeline-dot">{step < current ? '✓' : step === current ? '●' : '○'}</div>
                                  <div className="timeline-label">{s}</div>
                                  {idx < 3 && <div className={`timeline-line ${step < current ? 'completed' : ''}`} />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Update Status → {statusModal.targetStatus}</h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Issue: <strong>{statusModal.issue.description}</strong> (Flat {statusModal.issue.flatNo})
            </p>
            <form onSubmit={handleStatusUpdate}>
              {statusModal.targetStatus === 'In Progress' && (
                <div className="auth-field">
                  <label>ASSIGNED TO *</label>
                  <input
                    required
                    value={statusForm.assignedTo}
                    onChange={e => setStatusForm({...statusForm, assignedTo: e.target.value})}
                    placeholder="Enter name of person handling this issue"
                  />
                </div>
              )}
              {statusModal.targetStatus === 'Resolved' && (
                <div className="auth-field">
                  <label>RESOLUTION NOTES</label>
                  <textarea
                    value={statusForm.resolutionNotes}
                    onChange={e => setStatusForm({...statusForm, resolutionNotes: e.target.value})}
                    rows={3}
                    placeholder="Describe how the issue was resolved…"
                  />
                </div>
              )}
              {statusModal.targetStatus === 'Closed' && (
                <p style={{ color: '#666' }}>This will close the issue. Are you sure?</p>
              )}
              {statusModal.targetStatus === 'Open' && statusModal.issue.status === 'Closed' && (
                <p style={{ color: '#666' }}>This will reopen the closed issue. It will be set back to Open status.</p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="auth-submit-btn" disabled={updating}>
                  {updating ? 'Updating…' : `Confirm → ${statusModal.targetStatus}`}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setStatusModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
