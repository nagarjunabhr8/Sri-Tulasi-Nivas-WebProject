import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const empty = { category: '', subCategory: '', type: 'Income', amount: '', date: new Date().toISOString().split('T')[0], description: '', receivedFrom: '', approvedBy: '', receiptNo: '' };

const FundsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('All');

  const load = () => {
    api.get('/funds').then(r => setRecords(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/funds', { ...form, amount: parseFloat(form.amount) || 0 });
      setForm(empty);
      setShowForm(false);
      load();
    } catch { } finally { setSaving(false); }
  };

  const income  = records.filter(r => r.type === 'Income').reduce((s, r) => s + (r.amount || 0), 0);
  const expense = records.filter(r => r.type === 'Expense').reduce((s, r) => s + (r.amount || 0), 0);
  const balance = income - expense;

  const filtered = filterType === 'All' ? records : records.filter(r => r.type === filterType);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>💰 Funds</h1>
          <p>Community income &amp; expense tracking</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Entry'}
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card green">
          <span className="summary-icon">📈</span>
          <div><div className="summary-val">₹{income.toLocaleString()}</div><div className="summary-label">Total Income</div></div>
        </div>
        <div className="summary-card red">
          <span className="summary-icon">📉</span>
          <div><div className="summary-val">₹{expense.toLocaleString()}</div><div className="summary-label">Total Expense</div></div>
        </div>
        <div className={`summary-card ${balance >= 0 ? 'green' : 'red'}`}>
          <span className="summary-icon">🏦</span>
          <div><div className="summary-val">₹{balance.toLocaleString()}</div><div className="summary-label">Balance</div></div>
        </div>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>Add Fund Entry</h3>
          <div className="form-row-3">
            <div className="auth-field"><label>TYPE</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option>Income</option><option>Expense</option>
              </select>
            </div>
            <div className="auth-field"><label>CATEGORY</label>
              <input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Maintenance / Event / Repair…" />
            </div>
            <div className="auth-field"><label>AMOUNT (₹)</label>
              <input required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="5000" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="auth-field"><label>DATE</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="auth-field"><label>FROM / TO</label>
              <input value={form.receivedFrom} onChange={e => setForm({...form, receivedFrom: e.target.value})} placeholder="Vendor / Resident name" />
            </div>
            <div className="auth-field"><label>RECEIPT NO.</label>
              <input value={form.receiptNo} onChange={e => setForm({...form, receiptNo: e.target.value})} />
            </div>
          </div>
          <div className="auth-field"><label>DESCRIPTION</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Details…" />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Entry'}</button>
        </form>
      )}

      <div className="filter-bar">
        {['All','Income','Expense'].map(t => (
          <button key={t} className={`filter-btn${filterType === t ? ' active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
        ))}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>From/To</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No entries found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td><span className={`badge ${r.type === 'Income' ? 'badge-active' : 'badge-inactive'}`}>{r.type}</span></td>
                  <td>{r.category}{r.subCategory ? ` / ${r.subCategory}` : ''}</td>
                  <td>{r.description || '—'}</td>
                  <td>{r.receivedFrom || '—'}</td>
                  <td className={r.type === 'Income' ? 'amount-positive' : 'amount-negative'}>
                    {r.type === 'Income' ? '+' : '-'}₹{(r.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FundsPage;
