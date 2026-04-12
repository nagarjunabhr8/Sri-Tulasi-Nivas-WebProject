import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = Array.from({length: new Date().getFullYear() + 2 - 2020}, (_, i) => new Date().getFullYear() + 1 - i);
const CURRENT_MONTH = MONTHS[new Date().getMonth()];
const CURRENT_YEAR = new Date().getFullYear();

const TABS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'flats', label: '🏠 Flats' },
  { key: 'payments', label: '💰 Payments' },
  { key: 'corpus', label: '🏦 Corpus' },
  { key: 'loans', label: '🤝 Loans' },
  { key: 'settings', label: '⚙️ Rate' },
];

const emptyPayment = { flatNo: '', residentName: '', month: CURRENT_MONTH, year: CURRENT_YEAR, amount: '', paidStatus: 'Unpaid', paymentMode: '', receiptNo: '', notes: '' };
const emptyFlat = { flatNo: '', ownerName: '', ownerPhone: '', ownerEmail: '', occupantType: 'Owner', tenantName: '', tenantPhone: '', tenantEmail: '', isOccupied: true, notes: '' };
const emptySetting = { month: CURRENT_MONTH, year: CURRENT_YEAR, amount: '', decidedBy: '', decidedDate: new Date().toISOString().split('T')[0], notes: '' };
const emptyLoan = { memberName: '', flatNo: '', principalAmount: '', interestRate: '', durationMonths: '', startDate: new Date().toISOString().split('T')[0], notes: '' };

const MaintenancePage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const canManage = user?.role === 'ADMIN' || user?.role === 'TREASURER';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [funds, setFunds] = useState([]);
  const [loans, setLoans] = useState([]);

  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [flatForm, setFlatForm] = useState(emptyFlat);
  const [settingForm, setSettingForm] = useState(emptySetting);
  const [loanForm, setLoanForm] = useState(emptyLoan);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showFlatForm, setShowFlatForm] = useState(false);
  const [showSettingForm, setShowSettingForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [repayments, setRepayments] = useState({});
  const [repaymentForm, setRepaymentForm] = useState(null);
  const [interestDue, setInterestDue] = useState({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, s, f, fu, l] = await Promise.all([
        api.get('/maintenance').catch(() => ({ data: [] })),
        api.get('/maintenance-settings').catch(() => ({ data: [] })),
        api.get('/flat-details').catch(() => ({ data: [] })),
        api.get('/funds').catch(() => ({ data: [] })),
        api.get('/loans').catch(() => ({ data: [] })),
      ]);
      setPayments(p.data); setSettings(s.data); setFlats(f.data); setFunds(fu.data); setLoans(l.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  /* ── Computed values ─────────────────────────────────── */
  const currentSetting = useMemo(() =>
    settings.find(s => s.month === CURRENT_MONTH && s.year === CURRENT_YEAR), [settings]);

  const totalCollected = useMemo(() =>
    payments.filter(p => p.paidStatus === 'Paid').reduce((s, r) => s + (r.amount || 0), 0), [payments]);

  const totalPending = useMemo(() =>
    payments.filter(p => p.paidStatus !== 'Paid').reduce((s, r) => s + (r.amount || 0), 0), [payments]);

  const totalExpenses = useMemo(() =>
    funds.filter(f => f.type === 'Expense').reduce((s, r) => s + (r.amount || 0), 0), [funds]);

  const totalOtherIncome = useMemo(() =>
    funds.filter(f => f.type === 'Income').reduce((s, r) => s + (r.amount || 0), 0), [funds]);

  const totalLoansOutstanding = useMemo(() =>
    loans.filter(l => l.status === 'Active').reduce((s, l) => s + (l.outstandingPrincipal || 0), 0), [loans]);

  const totalInterestEarned = useMemo(() =>
    loans.reduce((s, l) => s + (l.totalInterestPaid || 0), 0), [loans]);

  const corpusBalance = totalCollected + totalOtherIncome + totalInterestEarned - totalExpenses - totalLoansOutstanding;

  /* ── Flat helpers ────────────────────────────────────── */
  const getFlatResident = (flatNo) => {
    const f = flats.find(fl => fl.flatNo === flatNo);
    if (!f) return '';
    return f.occupantType === 'Tenant' && f.tenantName ? f.tenantName : f.ownerName;
  };

  const handlePaymentFlatChange = (flatNo) => {
    const resident = getFlatResident(flatNo);
    const monthRate = currentSetting?.amount || '';
    setPaymentForm(prev => ({ ...prev, flatNo, residentName: resident, amount: prev.amount || monthRate.toString() }));
  };

  /* ── Payment handlers ────────────────────────────────── */
  const handlePaymentSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...paymentForm, amount: parseFloat(paymentForm.amount) || 0, year: parseInt(paymentForm.year) };
      if (editingId) { await api.put(`/maintenance/${editingId}`, data); }
      else { await api.post('/maintenance', data); }
      setPaymentForm(emptyPayment); setShowPaymentForm(false); setEditingId(null); loadAll();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };
  const editPayment = (r) => { setPaymentForm({ ...r, amount: r.amount?.toString() || '' }); setEditingId(r.id); setShowPaymentForm(true); };
  const deletePayment = async (id) => { if (!window.confirm('Delete this record?')) return; await api.delete(`/maintenance/${id}`); loadAll(); };

  /* ── Flat handlers ───────────────────────────────────── */
  const handleFlatSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) { await api.put(`/flat-details/${editingId}`, flatForm); }
      else { await api.post('/flat-details', flatForm); }
      setFlatForm(emptyFlat); setShowFlatForm(false); setEditingId(null); loadAll();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };
  const editFlat = (f) => { setFlatForm(f); setEditingId(f.id); setShowFlatForm(true); };
  const deleteFlat = async (id) => { if (!window.confirm('Delete this flat?')) return; await api.delete(`/flat-details/${id}`); loadAll(); };

  /* ── Setting handlers ────────────────────────────────── */
  const handleSettingSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...settingForm, amount: parseFloat(settingForm.amount) || 0, year: parseInt(settingForm.year) };
      if (editingId) { await api.put(`/maintenance-settings/${editingId}`, data); }
      else { await api.post('/maintenance-settings', data); }
      setSettingForm(emptySetting); setShowSettingForm(false); setEditingId(null); loadAll();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };
  const editSetting = (s) => { setSettingForm({ ...s, amount: s.amount?.toString() || '', decidedDate: s.decidedDate || '' }); setEditingId(s.id); setShowSettingForm(true); };

  /* ── Loan handlers ───────────────────────────────────── */
  const handleLoanSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...loanForm, principalAmount: parseFloat(loanForm.principalAmount) || 0, interestRate: parseFloat(loanForm.interestRate) || 0, durationMonths: parseInt(loanForm.durationMonths) || 0 };
      if (editingId) { await api.put(`/loans/${editingId}`, data); }
      else { await api.post('/loans', data); }
      setLoanForm(emptyLoan); setShowLoanForm(false); setEditingId(null); loadAll();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const loadRepayments = async (loanId) => {
    if (expandedLoan === loanId) { setExpandedLoan(null); return; }
    try {
      const [rep, intDue] = await Promise.all([
        api.get(`/loans/${loanId}/repayments`),
        api.get(`/loans/${loanId}/interest-due`),
      ]);
      setRepayments(prev => ({ ...prev, [loanId]: rep.data }));
      setInterestDue(prev => ({ ...prev, [loanId]: intDue.data }));
      setExpandedLoan(loanId);
    } catch {}
  };

  const startRepayment = (loan) => {
    const intInfo = interestDue[loan.id];
    setRepaymentForm({ repaymentDate: new Date().toISOString().split('T')[0], amount: '', principalPortion: '', interestPortion: intInfo ? Number(intInfo.interestDue).toFixed(2) : '0', notes: '' });
  };

  const handleRepaymentSubmit = async (e, loanId) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post(`/loans/${loanId}/repayments`, {
        ...repaymentForm,
        amount: parseFloat(repaymentForm.amount) || 0,
        principalPortion: parseFloat(repaymentForm.principalPortion) || 0,
        interestPortion: parseFloat(repaymentForm.interestPortion) || 0,
      });
      setRepaymentForm(null); loadAll();
      const [rep, intDue] = await Promise.all([
        api.get(`/loans/${loanId}/repayments`), api.get(`/loans/${loanId}/interest-due`),
      ]);
      setRepayments(prev => ({ ...prev, [loanId]: rep.data }));
      setInterestDue(prev => ({ ...prev, [loanId]: intDue.data }));
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const filteredPayments = filterStatus === 'All' ? payments : payments.filter(r => r.paidStatus === filterStatus);

  if (loading) return <div className="page-container"><div className="loading-state">Loading…</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🏷️ Maintenance & Corpus Fund</h1>
          <p>Monthly maintenance, fund tracking & member loans</p>
        </div>
      </div>

      {/* Current month rate banner */}
      {currentSetting && (
        <div className="maint-rate-banner">
          <div className="maint-rate-amount">₹{Number(currentSetting.amount).toLocaleString()}</div>
          <div className="maint-rate-info">
            <strong>Monthly Maintenance — {CURRENT_MONTH} {CURRENT_YEAR}</strong>
            {currentSetting.decidedBy && <span> · Decided by: {currentSetting.decidedBy}</span>}
            {currentSetting.notes && <span> · {currentSetting.notes}</span>}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards summary-cards-6">
        <div className={`summary-card ${corpusBalance >= 0 ? 'green' : 'red'}`}>
          <span className="summary-icon">🏦</span>
          <div><div className="summary-val">₹{corpusBalance.toLocaleString()}</div><div className="summary-label">Corpus Balance</div></div>
        </div>
        <div className="summary-card green">
          <span className="summary-icon">✅</span>
          <div><div className="summary-val">₹{totalCollected.toLocaleString()}</div><div className="summary-label">Collected</div></div>
        </div>
        <div className="summary-card red">
          <span className="summary-icon">⏳</span>
          <div><div className="summary-val">₹{totalPending.toLocaleString()}</div><div className="summary-label">Pending</div></div>
        </div>
        <div className="summary-card red">
          <span className="summary-icon">📉</span>
          <div><div className="summary-val">₹{totalExpenses.toLocaleString()}</div><div className="summary-label">Expenses</div></div>
        </div>
        <div className="summary-card blue">
          <span className="summary-icon">🤝</span>
          <div><div className="summary-val">₹{totalLoansOutstanding.toLocaleString()}</div><div className="summary-label">Loans Out</div></div>
        </div>
        <div className="summary-card green">
          <span className="summary-icon">💹</span>
          <div><div className="summary-val">₹{totalInterestEarned.toLocaleString()}</div><div className="summary-label">Interest Earned</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="maint-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`maint-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => { setActiveTab(t.key); setEditingId(null); setShowPaymentForm(false); setShowFlatForm(false); setShowSettingForm(false); setShowLoanForm(false); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="maint-tab-content">

        {/* ═══ DASHBOARD ═══ */}
        {activeTab === 'dashboard' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>📊 Financial Overview</h3>
            <div className="corpus-breakdown">
              <div className="corpus-row income"><span>Maintenance Collected</span><span>+ ₹{totalCollected.toLocaleString()}</span></div>
              <div className="corpus-row income"><span>Other Income (Funds)</span><span>+ ₹{totalOtherIncome.toLocaleString()}</span></div>
              <div className="corpus-row income"><span>Interest Earned from Loans</span><span>+ ₹{totalInterestEarned.toLocaleString()}</span></div>
              <div className="corpus-row expense"><span>Expenses (Funds)</span><span>− ₹{totalExpenses.toLocaleString()}</span></div>
              <div className="corpus-row expense"><span>Outstanding Loans Given</span><span>− ₹{totalLoansOutstanding.toLocaleString()}</span></div>
              <div className="corpus-row total"><span><strong>Corpus Fund Balance</strong></span><span><strong>₹{corpusBalance.toLocaleString()}</strong></span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="maint-stat-box">
                <h4>🏠 Flat Summary</h4>
                <p>Total Registered: <strong>{flats.length}</strong></p>
                <p>Owner Occupied: <strong>{flats.filter(f => f.occupantType === 'Owner').length}</strong></p>
                <p>Tenant Occupied: <strong>{flats.filter(f => f.occupantType === 'Tenant').length}</strong></p>
                <p>Vacant: <strong>{flats.filter(f => f.occupantType === 'Vacant' || !f.isOccupied).length}</strong></p>
              </div>
              <div className="maint-stat-box">
                <h4>🤝 Loan Summary</h4>
                <p>Active Loans: <strong>{loans.filter(l => l.status === 'Active').length}</strong></p>
                <p>Closed Loans: <strong>{loans.filter(l => l.status === 'Closed').length}</strong></p>
                <p>Total Disbursed: <strong>₹{loans.reduce((s, l) => s + (l.principalAmount || 0), 0).toLocaleString()}</strong></p>
                <p>Total Interest Earned: <strong>₹{totalInterestEarned.toLocaleString()}</strong></p>
              </div>
              <div className="maint-stat-box">
                <h4>💰 Payment Summary</h4>
                <p>Total Records: <strong>{payments.length}</strong></p>
                <p>Paid: <strong>{payments.filter(p => p.paidStatus === 'Paid').length}</strong></p>
                <p>Unpaid: <strong>{payments.filter(p => p.paidStatus === 'Unpaid').length}</strong></p>
                <p>Partial: <strong>{payments.filter(p => p.paidStatus === 'Partial').length}</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FLATS ═══ */}
        {activeTab === 'flats' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>🏠 Flat Details ({flats.length})</h3>
              {canManage && <button className="btn-add" onClick={() => { setShowFlatForm(!showFlatForm); setEditingId(null); setFlatForm(emptyFlat); }}>{showFlatForm ? '✕ Cancel' : '+ Add Flat'}</button>}
            </div>

            {showFlatForm && canManage && (
              <form className="inline-form" onSubmit={handleFlatSubmit}>
                <h3>{editingId ? 'Edit Flat' : 'Add Flat'}</h3>
                <div className="form-row-3">
                  <div className="auth-field"><label>FLAT NO.</label>
                    <input required value={flatForm.flatNo} onChange={e => setFlatForm({...flatForm, flatNo: e.target.value})} placeholder="A-101" disabled={!!editingId} />
                  </div>
                  <div className="auth-field"><label>OWNER NAME</label>
                    <input required value={flatForm.ownerName} onChange={e => setFlatForm({...flatForm, ownerName: e.target.value})} />
                  </div>
                  <div className="auth-field"><label>OCCUPANCY TYPE</label>
                    <select value={flatForm.occupantType} onChange={e => setFlatForm({...flatForm, occupantType: e.target.value})}>
                      <option>Owner</option><option>Tenant</option><option>Vacant</option>
                    </select>
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="auth-field"><label>OWNER PHONE</label>
                    <input value={flatForm.ownerPhone || ''} onChange={e => setFlatForm({...flatForm, ownerPhone: e.target.value})} />
                  </div>
                  <div className="auth-field"><label>OWNER EMAIL</label>
                    <input value={flatForm.ownerEmail || ''} onChange={e => setFlatForm({...flatForm, ownerEmail: e.target.value})} />
                  </div>
                </div>
                {flatForm.occupantType === 'Tenant' && (
                  <div className="form-row-3">
                    <div className="auth-field"><label>TENANT NAME</label>
                      <input value={flatForm.tenantName || ''} onChange={e => setFlatForm({...flatForm, tenantName: e.target.value})} />
                    </div>
                    <div className="auth-field"><label>TENANT PHONE</label>
                      <input value={flatForm.tenantPhone || ''} onChange={e => setFlatForm({...flatForm, tenantPhone: e.target.value})} />
                    </div>
                    <div className="auth-field"><label>TENANT EMAIL</label>
                      <input value={flatForm.tenantEmail || ''} onChange={e => setFlatForm({...flatForm, tenantEmail: e.target.value})} />
                    </div>
                  </div>
                )}
                <div className="auth-field"><label>NOTES</label>
                  <input value={flatForm.notes || ''} onChange={e => setFlatForm({...flatForm, notes: e.target.value})} placeholder="Any notes…" />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Flat' : 'Save Flat'}</button>
              </form>
            )}

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Flat</th><th>Owner</th><th>Type</th><th>Tenant</th><th>Phone</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
                <tbody>
                  {flats.length === 0 ? <tr><td colSpan={canManage ? 7 : 6} className="empty-row">No flats registered yet</td></tr>
                  : flats.map(f => (
                    <tr key={f.id}>
                      <td><span className="badge-flat">{f.flatNo}</span></td>
                      <td>{f.ownerName}</td>
                      <td><span className={`badge badge-status-${(f.occupantType || 'owner').toLowerCase()}`}>{f.occupantType}</span></td>
                      <td>{f.tenantName || '—'}</td>
                      <td>{f.occupantType === 'Tenant' ? (f.tenantPhone || '—') : (f.ownerPhone || '—')}</td>
                      <td><span className={`badge ${f.isOccupied !== false ? 'badge-active' : 'badge-inactive'}`}>{f.isOccupied !== false ? 'Occupied' : 'Vacant'}</span></td>
                      {canManage && <td><button className="btn-sm" onClick={() => editFlat(f)}>✏️</button> <button className="btn-sm" onClick={() => deleteFlat(f.id)}>🗑️</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ PAYMENTS ═══ */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>💰 Monthly Payments</h3>
              {canManage && <button className="btn-add" onClick={() => { setShowPaymentForm(!showPaymentForm); setEditingId(null); setPaymentForm(emptyPayment); }}>{showPaymentForm ? '✕ Cancel' : '+ Add Record'}</button>}
            </div>

            {showPaymentForm && canManage && (
              <form className="inline-form" onSubmit={handlePaymentSubmit}>
                <h3>{editingId ? 'Edit Payment' : 'Add Maintenance Record'}</h3>
                <div className="form-row-3">
                  <div className="auth-field"><label>FLAT NO.</label>
                    <input list="flat-list" required value={paymentForm.flatNo} onChange={e => handlePaymentFlatChange(e.target.value)} placeholder="Select or type flat no." />
                    <datalist id="flat-list">{flats.map(f => <option key={f.flatNo} value={f.flatNo}>{f.flatNo} — {f.ownerName}</option>)}</datalist>
                  </div>
                  <div className="auth-field"><label>RESIDENT NAME</label>
                    <input value={paymentForm.residentName} onChange={e => setPaymentForm({...paymentForm, residentName: e.target.value})} placeholder="Auto-filled from flat details" />
                  </div>
                  <div className="auth-field"><label>AMOUNT (₹)</label>
                    <input required type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} placeholder={currentSetting ? Number(currentSetting.amount).toString() : '2000'} />
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="auth-field"><label>MONTH</label>
                    <select required value={paymentForm.month} onChange={e => setPaymentForm({...paymentForm, month: e.target.value})}>
                      <option value="">Select month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="auth-field"><label>YEAR</label>
                    <select value={paymentForm.year} onChange={e => setPaymentForm({...paymentForm, year: e.target.value})}>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="auth-field"><label>STATUS</label>
                    <select value={paymentForm.paidStatus} onChange={e => setPaymentForm({...paymentForm, paidStatus: e.target.value})}>
                      <option>Unpaid</option><option>Paid</option><option>Partial</option>
                    </select>
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="auth-field"><label>PAYMENT MODE</label>
                    <select value={paymentForm.paymentMode || ''} onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value})}>
                      <option value="">Select mode</option><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option>
                    </select>
                  </div>
                  <div className="auth-field"><label>RECEIPT NO.</label>
                    <input value={paymentForm.receiptNo || ''} onChange={e => setPaymentForm({...paymentForm, receiptNo: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Record' : 'Save Record'}</button>
              </form>
            )}

            <div className="filter-bar">
              {['All','Paid','Unpaid','Partial'].map(s => (
                <button key={s} className={`filter-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
                  {s} <span className="filter-count">{s === 'All' ? payments.length : payments.filter(p => p.paidStatus === s).length}</span>
                </button>
              ))}
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Flat</th><th>Resident</th><th>Month/Year</th><th>Amount</th><th>Mode</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
                <tbody>
                  {filteredPayments.length === 0 ? <tr><td colSpan={canManage ? 7 : 6} className="empty-row">No records found</td></tr>
                  : filteredPayments.map(r => (
                    <tr key={r.id}>
                      <td><span className="badge-flat">{r.flatNo}</span></td>
                      <td>{r.residentName || '—'}</td>
                      <td>{r.month} {r.year}</td>
                      <td>₹{(r.amount || 0).toLocaleString()}</td>
                      <td>{r.paymentMode || '—'}</td>
                      <td><span className={`badge badge-status-${(r.paidStatus || 'unpaid').toLowerCase()}`}>{r.paidStatus}</span></td>
                      {canManage && <td><button className="btn-sm" onClick={() => editPayment(r)}>✏️</button> <button className="btn-sm" onClick={() => deletePayment(r.id)}>🗑️</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ CORPUS FUND ═══ */}
        {activeTab === 'corpus' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>🏦 Corpus Fund Breakdown</h3>
            <div className="corpus-breakdown" style={{ marginBottom: '1.5rem' }}>
              <div className="corpus-row income"><span>Maintenance Collected</span><span>+ ₹{totalCollected.toLocaleString()}</span></div>
              <div className="corpus-row income"><span>Other Income</span><span>+ ₹{totalOtherIncome.toLocaleString()}</span></div>
              <div className="corpus-row income"><span>Interest Earned</span><span>+ ₹{totalInterestEarned.toLocaleString()}</span></div>
              <div className="corpus-row expense"><span>Total Expenses</span><span>− ₹{totalExpenses.toLocaleString()}</span></div>
              <div className="corpus-row expense"><span>Outstanding Loans</span><span>− ₹{totalLoansOutstanding.toLocaleString()}</span></div>
              <div className="corpus-row total">
                <span><strong>Available Corpus Balance</strong></span>
                <span><strong className={corpusBalance >= 0 ? 'amount-positive' : 'amount-negative'}>₹{corpusBalance.toLocaleString()}</strong></span>
              </div>
            </div>

            <h4 style={{ margin: '1.5rem 0 .75rem' }}>📒 Recent Transactions (from Apartment Funds)</h4>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
                <tbody>
                  {funds.length === 0 ? <tr><td colSpan={5} className="empty-row">No fund entries. Add via Apartment Funds page.</td></tr>
                  : funds.slice(0, 25).map(f => (
                    <tr key={f.id}>
                      <td>{f.date}</td>
                      <td><span className={`badge ${f.type === 'Income' ? 'badge-active' : 'badge-inactive'}`}>{f.type}</span></td>
                      <td>{f.category}{f.subCategory ? ` / ${f.subCategory}` : ''}</td>
                      <td>{f.description || '—'}</td>
                      <td className={f.type === 'Income' ? 'amount-positive' : 'amount-negative'}>{f.type === 'Income' ? '+' : '−'}₹{(f.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ LOANS ═══ */}
        {activeTab === 'loans' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>🤝 Member Loans ({loans.length})</h3>
              {canManage && <button className="btn-add" onClick={() => { setShowLoanForm(!showLoanForm); setEditingId(null); setLoanForm(emptyLoan); }}>{showLoanForm ? '✕ Cancel' : '+ New Loan'}</button>}
            </div>

            {showLoanForm && canManage && (
              <form className="inline-form" onSubmit={handleLoanSubmit}>
                <h3>{editingId ? 'Edit Loan' : 'Disburse New Loan from Corpus'}</h3>
                <div className="form-row-3">
                  <div className="auth-field"><label>MEMBER NAME</label>
                    <input required value={loanForm.memberName} onChange={e => setLoanForm({...loanForm, memberName: e.target.value})} placeholder="Full name" />
                  </div>
                  <div className="auth-field"><label>FLAT NO.</label>
                    <input list="loan-flat-list" required value={loanForm.flatNo} onChange={e => setLoanForm({...loanForm, flatNo: e.target.value})} />
                    <datalist id="loan-flat-list">{flats.map(f => <option key={f.flatNo} value={f.flatNo} />)}</datalist>
                  </div>
                  <div className="auth-field"><label>PRINCIPAL AMOUNT (₹)</label>
                    <input required type="number" value={loanForm.principalAmount} onChange={e => setLoanForm({...loanForm, principalAmount: e.target.value})} />
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="auth-field"><label>INTEREST RATE (% per year)</label>
                    <input required type="number" step="0.1" value={loanForm.interestRate} onChange={e => setLoanForm({...loanForm, interestRate: e.target.value})} placeholder="12" />
                  </div>
                  <div className="auth-field"><label>DURATION (months)</label>
                    <input required type="number" value={loanForm.durationMonths} onChange={e => setLoanForm({...loanForm, durationMonths: e.target.value})} placeholder="12" />
                  </div>
                  <div className="auth-field"><label>START DATE</label>
                    <input type="date" required value={loanForm.startDate} onChange={e => setLoanForm({...loanForm, startDate: e.target.value})} />
                  </div>
                </div>
                <div className="auth-field"><label>NOTES / PURPOSE</label>
                  <input value={loanForm.notes || ''} onChange={e => setLoanForm({...loanForm, notes: e.target.value})} placeholder="Purpose of loan…" />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Loan' : 'Disburse Loan'}</button>
              </form>
            )}

            {loans.length === 0 ? <div className="empty-state">No loans recorded yet</div>
            : loans.map(loan => (
              <div key={loan.id} className={`loan-card${loan.status === 'Closed' ? ' loan-closed' : ''}`}>
                <div className="loan-card-header" onClick={() => loadRepayments(loan.id)}>
                  <div className="loan-card-title">
                    <strong>{loan.memberName}</strong>
                    <span className="badge-flat">{loan.flatNo}</span>
                    <span className={`badge ${loan.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{loan.status}</span>
                  </div>
                  <div className="loan-card-amounts">
                    <span>Principal: <strong>₹{Number(loan.principalAmount).toLocaleString()}</strong></span>
                    <span>Outstanding: <strong className="amount-negative">₹{Number(loan.outstandingPrincipal).toLocaleString()}</strong></span>
                    <span>Rate: <strong>{loan.interestRate}%</strong> / {loan.durationMonths}mo</span>
                  </div>
                  <span className="loan-expand">{expandedLoan === loan.id ? '▲' : '▼'}</span>
                </div>

                {expandedLoan === loan.id && (
                  <div className="loan-card-detail">
                    <div className="loan-info-grid">
                      <div>Start: <strong>{loan.startDate}</strong></div>
                      <div>Expected Return: <strong>{loan.expectedReturnDate}</strong></div>
                      <div>Principal Paid: <strong className="amount-positive">₹{Number(loan.totalPrincipalPaid || 0).toLocaleString()}</strong></div>
                      <div>Interest Paid: <strong className="amount-positive">₹{Number(loan.totalInterestPaid || 0).toLocaleString()}</strong></div>
                      {loan.notes && <div style={{ gridColumn: '1 / -1' }}>Notes: {loan.notes}</div>}
                    </div>

                    {interestDue[loan.id] && loan.status === 'Active' && (
                      <div className="loan-interest-due">
                        <span>💡 Interest due as of today: <strong>₹{Number(interestDue[loan.id].interestDue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>
                        <span> (on ₹{Number(interestDue[loan.id].outstandingPrincipal).toLocaleString()} for {interestDue[loan.id].daysSinceLastPayment} days @ {loan.interestRate}% p.a.)</span>
                      </div>
                    )}

                    {canManage && loan.status === 'Active' && !repaymentForm && (
                      <button className="btn-add" style={{ margin: '1rem 0' }} onClick={() => startRepayment(loan)}>+ Record Repayment</button>
                    )}

                    {repaymentForm && expandedLoan === loan.id && (
                      <form className="inline-form" style={{ margin: '1rem 0' }} onSubmit={e => handleRepaymentSubmit(e, loan.id)}>
                        <h3>Record Repayment</h3>
                        <div className="form-row-3">
                          <div className="auth-field"><label>DATE</label>
                            <input type="date" required value={repaymentForm.repaymentDate} onChange={e => setRepaymentForm({...repaymentForm, repaymentDate: e.target.value})} />
                          </div>
                          <div className="auth-field"><label>INTEREST PORTION (₹)</label>
                            <input type="number" step="0.01" required value={repaymentForm.interestPortion}
                              onChange={e => { const int = parseFloat(e.target.value) || 0; const tot = parseFloat(repaymentForm.amount) || 0;
                                setRepaymentForm({...repaymentForm, interestPortion: e.target.value, principalPortion: Math.max(0, tot - int).toFixed(2) }); }} />
                          </div>
                          <div className="auth-field"><label>TOTAL PAYMENT (₹)</label>
                            <input type="number" step="0.01" required value={repaymentForm.amount}
                              onChange={e => { const tot = parseFloat(e.target.value) || 0; const int = parseFloat(repaymentForm.interestPortion) || 0;
                                setRepaymentForm({...repaymentForm, amount: e.target.value, principalPortion: Math.max(0, tot - int).toFixed(2) }); }} />
                          </div>
                        </div>
                        <div className="form-row-2">
                          <div className="auth-field"><label>PRINCIPAL PORTION (₹) — auto</label>
                            <input type="number" step="0.01" value={repaymentForm.principalPortion} readOnly style={{ background: '#f0ede6' }} />
                          </div>
                          <div className="auth-field"><label>NOTES</label>
                            <input value={repaymentForm.notes || ''} onChange={e => setRepaymentForm({...repaymentForm, notes: e.target.value})} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Repayment'}</button>
                          <button type="button" className="auth-submit-btn" style={{ background: '#888' }} onClick={() => setRepaymentForm(null)}>Cancel</button>
                        </div>
                      </form>
                    )}

                    <h4 style={{ margin: '1rem 0 .5rem' }}>Repayment History</h4>
                    {(!repayments[loan.id] || repayments[loan.id].length === 0)
                      ? <p style={{ color: '#999', fontSize: '.85rem' }}>No repayments recorded yet</p>
                      : (
                      <div className="data-table-wrapper">
                        <table className="data-table">
                          <thead><tr><th>Date</th><th>Total</th><th>Principal</th><th>Interest</th><th>Outstanding After</th><th>Notes</th></tr></thead>
                          <tbody>
                            {repayments[loan.id].map(r => (
                              <tr key={r.id}>
                                <td>{r.repaymentDate}</td>
                                <td>₹{Number(r.amount).toLocaleString()}</td>
                                <td className="amount-positive">₹{Number(r.principalPortion).toLocaleString()}</td>
                                <td>₹{Number(r.interestPortion).toLocaleString()}</td>
                                <td><strong>₹{Number(r.outstandingAfter).toLocaleString()}</strong></td>
                                <td>{r.notes || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══ RATE SETTINGS ═══ */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>⚙️ Monthly Maintenance Rate</h3>
              {canManage && <button className="btn-add" onClick={() => { setShowSettingForm(!showSettingForm); setEditingId(null); setSettingForm(emptySetting); }}>{showSettingForm ? '✕ Cancel' : '+ Set Rate'}</button>}
            </div>
            <p style={{ color: 'var(--text-soft)', fontSize: '.85rem', marginBottom: '1rem' }}>
              The monthly maintenance amount is decided collectively by all flat owners and tenants. Set the rate here — it will be highlighted on the Maintenance page.
            </p>

            {showSettingForm && canManage && (
              <form className="inline-form" onSubmit={handleSettingSubmit}>
                <h3>{editingId ? 'Edit Rate' : 'Set Monthly Rate'}</h3>
                <div className="form-row-3">
                  <div className="auth-field"><label>MONTH</label>
                    <select required value={settingForm.month} onChange={e => setSettingForm({...settingForm, month: e.target.value})}>
                      <option value="">Select</option>{MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="auth-field"><label>YEAR</label>
                    <select value={settingForm.year} onChange={e => setSettingForm({...settingForm, year: e.target.value})}>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="auth-field"><label>AMOUNT (₹)</label>
                    <input required type="number" value={settingForm.amount} onChange={e => setSettingForm({...settingForm, amount: e.target.value})} placeholder="2000" />
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="auth-field"><label>DECIDED BY</label>
                    <input value={settingForm.decidedBy || ''} onChange={e => setSettingForm({...settingForm, decidedBy: e.target.value})} placeholder="Committee meeting / All members" />
                  </div>
                  <div className="auth-field"><label>DECIDED DATE</label>
                    <input type="date" value={settingForm.decidedDate || ''} onChange={e => setSettingForm({...settingForm, decidedDate: e.target.value})} />
                  </div>
                </div>
                <div className="auth-field"><label>NOTES</label>
                  <input value={settingForm.notes || ''} onChange={e => setSettingForm({...settingForm, notes: e.target.value})} placeholder="Reason for this rate…" />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Rate' : 'Save Rate'}</button>
              </form>
            )}

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Month</th><th>Year</th><th>Amount</th><th>Decided By</th><th>Date</th><th>Notes</th>{canManage && <th>Actions</th>}</tr></thead>
                <tbody>
                  {settings.length === 0 ? <tr><td colSpan={canManage ? 7 : 6} className="empty-row">No rates set yet</td></tr>
                  : settings.map(s => (
                    <tr key={s.id} className={s.month === CURRENT_MONTH && s.year === CURRENT_YEAR ? 'row-highlight' : ''}>
                      <td>{s.month}</td>
                      <td>{s.year}</td>
                      <td><strong>₹{Number(s.amount).toLocaleString()}</strong></td>
                      <td>{s.decidedBy || '—'}</td>
                      <td>{s.decidedDate || '—'}</td>
                      <td>{s.notes || '—'}</td>
                      {canManage && <td><button className="btn-sm" onClick={() => editSetting(s)}>✏️</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MaintenancePage;
