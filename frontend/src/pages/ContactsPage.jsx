import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const empty = { role: '', name: '', phone: '', alternatePhone: '', email: '', availableHours: '9AM-6PM', block: '', notes: '' };

const ContactsPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/contacts').then(r => setContacts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/contacts/${editingId}`, form);
      } else {
        await api.post('/contacts', form);
      }
      setForm(empty);
      setEditingId(null);
      setShowForm(false);
      load();
    } catch { } finally { setSaving(false); }
  };

  const editContact = (c) => {
    setForm({ role: c.role || '', name: c.name || '', phone: c.phone || '', alternatePhone: c.alternatePhone || '', email: c.email || '', availableHours: c.availableHours || '', block: c.block || '', notes: c.notes || '' });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try { await api.delete(`/contacts/${id}`); load(); } catch {}
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(empty); };

  const grouped = contacts.reduce((acc, c) => {
    const key = c.role || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📞 Contacts</h1>
          <p>Staff, service providers &amp; emergency numbers</p>
        </div>
        {isAdmin && (
          <button className="btn-add" onClick={() => showForm ? cancelForm() : setShowForm(true)}>
            {showForm ? '✕ Cancel' : '+ Add Contact'}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Contact' : 'Add Contact'}</h3>
          <div className="form-row-3">
            <div className="auth-field"><label>ROLE</label>
              <input required value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Watchman / Plumber / Emergency…" />
            </div>
            <div className="auth-field"><label>NAME</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" />
            </div>
            <div className="auth-field"><label>PHONE</label>
              <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="auth-field"><label>ALTERNATE PHONE</label>
              <input value={form.alternatePhone} onChange={e => setForm({...form, alternatePhone: e.target.value})} />
            </div>
            <div className="auth-field"><label>EMAIL</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="auth-field"><label>AVAILABLE HOURS</label>
              <input value={form.availableHours} onChange={e => setForm({...form, availableHours: e.target.value})} placeholder="9AM-6PM / 24x7" />
            </div>
          </div>
          <button type="submit" className="auth-submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Contact' : 'Save Contact'}</button>
        </form>
      )}

      {loading ? <div className="loading-state">Loading…</div> : (
        contacts.length === 0 ? (
          <div className="empty-state">No contacts added yet. Add your first contact above.</div>
        ) : (
          Object.entries(grouped).map(([role, items]) => (
            <div key={role} className="contact-group">
              <h3 className="contact-group-title">{role}</h3>
              <div className="contact-cards">
                {items.map(c => (
                  <div key={c.id} className="contact-card">
                    <div className="contact-avatar">{c.name?.[0]?.toUpperCase() || '?'}</div>
                    <div className="contact-info">
                      <div className="contact-name">{c.name}</div>
                      <div className="contact-phone">📱 {c.phone}</div>
                      {c.alternatePhone && <div className="contact-phone">📱 {c.alternatePhone}</div>}
                      {c.email && <div className="contact-phone">✉️ {c.email}</div>}
                      {c.availableHours && <div className="contact-hours">🕐 {c.availableHours}</div>}
                    </div>
                    {isAdmin && (
                      <div className="contact-actions">
                        <button className="btn-sm" onClick={() => editContact(c)} title="Edit">✏️</button>
                        <button className="btn-sm" onClick={() => deleteContact(c.id)} title="Delete">🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default ContactsPage;
