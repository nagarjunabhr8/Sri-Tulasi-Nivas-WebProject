import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const ResidentsPage = () => {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/residents')
      .then(r => setResidents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = residents.filter(r =>
    [r.firstName, r.lastName, r.email, r.flatNo, r.phone].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditData({
      firstName: r.firstName || '',
      lastName: r.lastName || '',
      flatNo: r.flatNo || '',
      phone: r.phone || '',
      role: r.role || 'TENANT',
      isActive: r.isActive ?? true,
      whatsappApiKey: r.whatsappApiKey || '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await api.put(`/residents/${id}`, editData);
      setEditingId(null);
      load();
    } catch {
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return '—';
    const atIdx = email.indexOf('@');
    if (atIdx < 0) return email.slice(0, 2) + 'X'.repeat(Math.max(4, email.length - 2));
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx);
    const visible = local.slice(0, 2);
    const masked = 'X'.repeat(Math.max(4, local.length - 2));
    return `${visible}${masked}${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return '—';
    const str = phone.toString().replace(/\s/g, '');
    return str.slice(0, 2) + 'X'.repeat(Math.max(4, str.length - 2));
  };

  const deleteResident = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/residents/${id}`);
      load();
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>👥 Residents</h2>
          <p>All registered residents of Sri Tulasi Nivas</p>
        </div>
        <input
          className="search-input"
          placeholder="Search by name, email, flat…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">Loading residents…</div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Flat No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th title="WhatsApp (CallMeBot API key)">WA 📲</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="empty-row">No residents found</td></tr>
              ) : filtered.map(r => editingId === r.id ? (
                <tr key={r.id} className="editing-row">
                  <td>
                    <input className="table-input" value={editData.flatNo}
                      onChange={e => setEditData({ ...editData, flatNo: e.target.value })} />
                  </td>
                  <td style={{ display: 'flex', gap: '4px' }}>
                    <input className="table-input" placeholder="First" value={editData.firstName}
                      onChange={e => setEditData({ ...editData, firstName: e.target.value })} />
                    <input className="table-input" placeholder="Last" value={editData.lastName}
                      onChange={e => setEditData({ ...editData, lastName: e.target.value })} />
                  </td>
                  <td style={{ color: '#aaa', fontSize: '0.85rem' }}>{r.email}</td>
                  <td>
                    <input className="table-input" value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                  </td>
                  <td>
                    <select className="table-input" value={editData.role}
                      onChange={e => setEditData({ ...editData, role: e.target.value })}>
                      <option value="TENANT">TENANT</option>
                      <option value="OWNER">OWNER</option>
                      {isAdmin && <option value="ADMIN">ADMIN</option>}
                    </select>
                  </td>
                  <td>
                    <select className="table-input" value={editData.isActive ? 'true' : 'false'}
                      onChange={e => setEditData({ ...editData, isActive: e.target.value === 'true' })}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="table-input"
                      placeholder="e.g. 123456"
                      value={editData.whatsappApiKey}
                      onChange={e => setEditData({ ...editData, whatsappApiKey: e.target.value })}
                      style={{ width: '80px' }}
                      title="CallMeBot API key for WhatsApp notifications"
                    />
                  </td>
                  <td className="action-cell">
                    <button className="btn-save" onClick={() => saveEdit(r.id)} disabled={saving}>
                      {saving ? '…' : 'Save'}
                    </button>
                    <button className="btn-cancel-sm" onClick={cancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td><span className="badge badge-flat">{r.flatNo || '—'}</span></td>
                  <td>{r.firstName} {r.lastName}</td>
                  <td title={r.email} style={{ color: '#555', fontSize: '0.85rem' }}>{maskEmail(r.email)}</td>
                  <td title={r.phone}>{maskPhone(r.phone)}</td>
                  <td><span className={`badge badge-role-${(r.role || 'tenant').toLowerCase()}`}>{r.role || 'TENANT'}</span></td>
                  <td><span className={`badge ${r.isActive ? 'badge-active' : 'badge-inactive'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td title={r.whatsappApiKey ? `Key: ${r.whatsappApiKey}` : 'No CallMeBot key set'}>
                    {r.whatsappApiKey ? '✅' : <span style={{color:'#bbb'}}>—</span>}
                  </td>
                  <td className="action-cell">
                    {(isAdmin || currentUser?.id === r.id) && (
                      <button className="btn-edit" onClick={() => startEdit(r)}>Edit</button>
                    )}
                    {isAdmin && (
                      <button className="btn-delete" onClick={() => deleteResident(r.id, `${r.firstName} ${r.lastName}`)}>Delete</button>
                    )}
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

export default ResidentsPage;
