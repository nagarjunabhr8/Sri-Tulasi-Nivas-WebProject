import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

const empty = { flatNo: '', residentName: '', month: '', year: new Date().getFullYear(), amount: '', paidStatus: 'Unpaid', paymentMode: '', receiptNo: '', notes: '' };

const MaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const load = () => {
    api.get('/maintenance').then(r => setRecords(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/maintenance', { ...form, amount: parseFloat(form.amount) || 0, year: parseInt(form.year) });
      setForm(empty);
      setShowForm(false);
      load();
    } catch { } finally { setSaving(false); }
  };

  const filtered = filterStatus === 'All' ? records : records.filter(r => r.paidStatus === filterStatus);

  const totalCollected = records.filter(r => r.paidStatus === 'Paid').reduce((s, r) => s + (r.amount || 0), 0);
  const totalPending  = records.filter(r => r.paidStatus === 'Unpaid').reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🏷️ Maintenance</h1>
          <p>Monthly maintenance fee tracking</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Record'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="summary-cards">
        <div className="summary-card green">
          <span className="summary-icon">✅</span>
          <div><div className="summary-val">₹{totalCollected.toLocaleString()}</div><div className="summary-label">Collected</div></div>
        </div>
        <div className="summary-card red">
          <span className="summary-icon">⏳</span>
          <div><div className="summary-val">₹{totalPending.toLocaleString()}</div><div className="summary-label">Pending</div></div>
        </div>
        <div className="summary-card blue">
          <span className="summary-icon">🏠</span>
          <div><div className="summary-val">{[...new Set(records.map(r => r.flatNo))].length}</div><div className="summary-label">Flats</div></div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>Add Maintenance Record</h3>
          <div className="form-row-3">
            <div className="auth-field"><label>FLAT NO.</label>
              <input required value={form.flatNo} onChange={e => setForm({...form, flatNo: e.target.value})} placeholder="A-101" />
            </div>
            <div className="auth-field"><label>RESIDENT NAME</label>
              <input value={form.residentName} onChange={e => setForm({...form, residentName: e.target.value})} placeholder="Optional" />
            </div>
            <div className="auth-field"><label>AMOUNT (₹)</label>
              <input required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="2000" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="auth-field"><label>MONTH</label>
              <select required value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                <option value="">Select month</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="auth-field"><label>YEAR</label>
              <select value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="auth-field"><label>STATUS</label>
              <select value={form.paidStatus} onChange={e => setForm({...form, paidStatus: e.target.value})}>
                <option>Unpaid</option><option>Paid</option><option>Partial</option>
              </select>
            </div>
          </div>
          <div className="form-row-2">
            <div className="auth-field"><label>PAYMENT MODE</label>
              <input value={form.paymentMode} onChange={e => setForm({...form, paymentMode: e.target.value})} placeholder="Cash / UPI / Bank Transfer" />
            </div>
            <div className="auth-field"><label>RECEIPT NO.</label>
              <input value={form.receiptNo} onChange={e => setForm({...form, receiptNo: e.target.value})} placeholder="Optional" />
            </div>
          </div>
          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Record'}</button>
        </form>
      )}

      {/* Filter */}
      <div className="filter-bar">
        {['All','Paid','Unpaid','Partial'].map(s => (
          <button key={s} className={`filter-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Flat</th><th>Resident</th><th>Month/Year</th><th>Amount</th><th>Mode</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No records found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td><span className="badge-flat">{r.flatNo}</span></td>
                  <td>{r.residentName || '—'}</td>
                  <td>{r.month} {r.year}</td>
                  <td>₹{(r.amount || 0).toLocaleString()}</td>
                  <td>{r.paymentMode || '—'}</td>
                  <td><span className={`badge badge-status-${(r.paidStatus || 'unpaid').toLowerCase()}`}>{r.paidStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
