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

// Friendly action labels for each transition
const ACTION_LABELS = {
  'In Progress': { icon: '👤', label: 'Assign', modalTitle: 'Assign Issue' },
  'Resolved': { icon: '✅', label: 'Resolve', modalTitle: 'Resolve Issue' },
  'Closed': { icon: '🔒', label: 'Close', modalTitle: 'Close Issue' },
  'Open': { icon: '↩', label: 'Reopen', modalTitle: 'Reopen Issue' },
};

// Category-to-assignee label mapping
const CATEGORY_ASSIGNEE = {
  'Plumbing': 'Plumber',
  'Electrical': 'Electrician',
  'Carpentry': 'Carpenter',
  'Cleaning': 'Housekeeping Staff',
  'Security': 'Security Personnel',
  'Lift': 'Lift Technician',
  'Common Area': 'Maintenance Staff',
  'Other': 'Person',
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
  const [error, setError] = useState(null);

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
    setError(null);
  };

  const handleStatusUpdate = async e => {
    e.preventDefault();
    if (!statusModal) return;
    setUpdating(true);
    setError(null);
    try {
      await api.put(`/issues/${statusModal.issue.id}/status`, {
        status: statusModal.targetStatus,
        assignedTo: statusForm.assignedTo,
        resolutionNotes: statusForm.resolutionNotes,
      });
      setStatusModal(null);
      setFilterStatus(statusModal.targetStatus);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to update status. Please try again.';
      setError(msg);
    } finally { setUpdating(false); }
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
                        const act = ACTION_LABELS[target] || { icon: '→', label: target };
                        const assignee = CATEGORY_ASSIGNEE[i.category] || 'Person';
                        const label = target === 'In Progress' ? `Assign ${assignee}` : act.label;
                        return (
                          <button
                            key={target}
                            className={isForward ? 'btn-status-action' : 'btn-status-reopen'}
                            onClick={() => openStatusModal(i, target)}
                            title={`${label}`}
                          >
                            {act.icon} {label}
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
                            <div><strong>Assigned To:</strong> {i.assignedTo || <span style={{ color: '#999' }}>Not yet assigned</span>}</div>
                            <div><strong>Created:</strong> {i.createdAt ? new Date(i.createdAt).toLocaleString('en-IN') : '—'}</div>
                            <div><strong>Last Updated:</strong> {i.updatedAt ? new Date(i.updatedAt).toLocaleString('en-IN') : '—'}</div>
                            <div><strong>Resolved On:</strong> {i.resolvedAt ? new Date(i.resolvedAt).toLocaleString('en-IN') : <span style={{ color: '#999' }}>Not yet resolved</span>}</div>
                            <div><strong>Status:</strong> <span className={`badge ${statusColor(i.status)}`}>{i.status}</span></div>
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
            <h3>{statusModal.targetStatus === 'In Progress'
              ? `Assign ${CATEGORY_ASSIGNEE[statusModal.issue.category] || 'Person'}`
              : (ACTION_LABELS[statusModal.targetStatus] || {}).modalTitle || 'Update Status'}</h3>
            <div className="modal-issue-info">
              <span className="badge-flat">{statusModal.issue.flatNo}</span>
              <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{statusModal.issue.category}</span>
              <span style={{ marginLeft: '0.5rem', color: '#666' }}>— {statusModal.issue.description}</span>
            </div>
            <div className="modal-status-flow">
              <span className={`badge ${statusColor(statusModal.issue.status)}`}>{statusModal.issue.status}</span>
              <span className="modal-arrow">→</span>
              <span className={`badge ${statusColor(statusModal.targetStatus)}`}>{statusModal.targetStatus}</span>
            </div>
            <form onSubmit={handleStatusUpdate}>
              {statusModal.targetStatus === 'In Progress' && (
                <div className="auth-field">
                  <label>ASSIGN {(CATEGORY_ASSIGNEE[statusModal.issue.category] || 'PERSON').toUpperCase()} TO *</label>
                  <input
                    required
                    value={statusForm.assignedTo}
                    onChange={e => setStatusForm({...statusForm, assignedTo: e.target.value})}
                    placeholder={`Name of ${(CATEGORY_ASSIGNEE[statusModal.issue.category] || 'person').toLowerCase()} handling this issue`}
                  />
                  <small style={{ color: '#888', marginTop: '0.25rem', display: 'block' }}>This {(CATEGORY_ASSIGNEE[statusModal.issue.category] || 'person').toLowerCase()} will be responsible for resolving the issue.</small>
                </div>
              )}
              {statusModal.targetStatus === 'Resolved' && (
                <>
                  <div className="auth-field">
                    <label>RESOLUTION NOTES *</label>
                    <textarea
                      required
                      value={statusForm.resolutionNotes}
                      onChange={e => setStatusForm({...statusForm, resolutionNotes: e.target.value})}
                      rows={3}
                      placeholder="Describe how the issue was resolved…"
                    />
                    <small style={{ color: '#888', marginTop: '0.25rem', display: 'block' }}>Resolution date will be recorded automatically.</small>
                  </div>
                  {statusModal.issue.assignedTo && (
                    <p style={{ color: '#555', fontSize: '0.85rem' }}>Handled by: <strong>{statusModal.issue.assignedTo}</strong></p>
                  )}
                </>
              )}
              {statusModal.targetStatus === 'Closed' && (
                <div style={{ background: '#f9f3eb', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <p style={{ color: '#555', margin: 0 }}>This will mark the issue as <strong>Closed</strong>. Please confirm all work is complete.</p>
                  {statusModal.issue.resolvedAt && (
                    <p style={{ color: '#666', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Resolved on: <strong>{new Date(statusModal.issue.resolvedAt).toLocaleString('en-IN')}</strong></p>
                  )}
                  {statusModal.issue.resolutionNotes && (
                    <p style={{ color: '#666', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Notes: {statusModal.issue.resolutionNotes}</p>
                  )}
                </div>
              )}
              {statusModal.targetStatus === 'Open' && (
                <div style={{ background: '#fff8f0', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid #e8a040' }}>
                  <p style={{ color: '#555', margin: 0 }}>This will reopen the issue and reset assignments. The issue will go back to <strong>Open</strong> status.</p>
                </div>
              )}
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.75rem', color: '#b91c1c', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="auth-submit-btn" disabled={updating}>
                  {updating ? 'Updating…' : (() => {
                    const act = ACTION_LABELS[statusModal.targetStatus] || {};
                    if (statusModal.targetStatus === 'In Progress') {
                      return `${act.icon} Assign ${CATEGORY_ASSIGNEE[statusModal.issue.category] || 'Person'}`;
                    }
                    return `${act.icon || '→'} ${act.label || statusModal.targetStatus}`;
                  })()}
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
