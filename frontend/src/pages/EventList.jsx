import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

// ─── AP & Telangana Festivals 2026 ───────────────────────────────────────────
// Dates derived from confirmed anchor: Ugadi = Thu 19 Mar 2026 (Chaitra Shukla 1)
// Each subsequent Hindu date calculated via lunar month (~29.53 days/month).
const UPCOMING_FESTIVALS = [
  {
    name: 'Ugadi (Telugu New Year)',
    date: '2026-03-19',
    emoji: '🌸',
    type: 'Telugu',
    typeColor: '#f97316',
    description: 'Telugu New Year — Chaitra Shukla Pratipada. Celebrated with Ugadi Pachadi (six tastes of life), new clothes, mango leaves on doors, and reading of Panchanga (almanac) for the coming year.',
    link: 'https://en.wikipedia.org/wiki/Ugadi',
  },
  {
    name: 'Sri Rama Navami',
    date: '2026-03-27',
    emoji: '🏹',
    type: 'Hindu',
    typeColor: '#dc2626',
    description: 'Birthday of Lord Sri Rama — Chaitra Shukla Navami. Grand celebrations at Bhadrachalam temple in Telangana, Sita Kalyanam processions, and all-night bhajans across AP & Telangana.',
    link: 'https://en.wikipedia.org/wiki/Ram_Navami',
  },
  {
    name: 'Akshaya Tritiya',
    date: '2026-04-20',
    emoji: '✨',
    type: 'Hindu',
    typeColor: '#f97316',
    description: 'Vaisakha Shukla Tritiya — an auspicious day for new ventures, gold purchases, weddings, and charity. Prosperity earned on this day is said to never diminish.',
    link: 'https://en.wikipedia.org/wiki/Akshaya_Tritiya',
  },
  {
    name: 'Eid al-Adha (Bakrid)',
    date: '2026-06-07',
    emoji: '🕌',
    type: 'Islamic',
    typeColor: '#10b981',
    description: 'Festival of Sacrifice — Hyderabad\'s most celebrated Islamic festival. Marked with grand prayers at Mecca Masjid, Charminar gatherings, biryani feasts, and sharing with neighbours.',
    link: 'https://en.wikipedia.org/wiki/Eid_al-Adha',
  },
  {
    name: 'Bonalu',
    date: '2026-07-05',
    emoji: '🪔',
    type: 'Telangana',
    typeColor: '#7c3aed',
    description: 'Telangana\'s harvest thanksgiving to Goddess Mahakali. Bonalu (food offerings in decorated pots) carried in colourful processions to Ujjaini Mahankali, Lal Darwaza, and Golconda temples.',
    link: 'https://en.wikipedia.org/wiki/Bonalu',
  },
  {
    name: 'Independence Day',
    date: '2026-08-15',
    emoji: '🇮🇳',
    type: 'National',
    typeColor: '#3b82f6',
    description: 'India\'s 80th Independence Day — flag hoisting, patriotic programmes, and community celebrations commemorating freedom from British rule on August 15, 1947.',
    link: 'https://en.wikipedia.org/wiki/Independence_Day_(India)',
  },
  {
    name: 'Vinayaka Chavithi',
    date: '2026-08-19',
    emoji: '🐘',
    type: 'Telugu',
    typeColor: '#f97316',
    description: 'Bhadrapada Shukla Chaturthi — 10-day celebration of Lord Ganesha. AP & Telangana are famous for the largest Ganesh pandals, processions, and Nimarjanam (immersion) in lakes and tanks.',
    link: 'https://en.wikipedia.org/wiki/Ganesh_Chaturthi',
  },
  {
    name: 'Saddula Bathukamma',
    date: '2026-09-24',
    emoji: '🌺',
    type: 'Telangana',
    typeColor: '#7c3aed',
    description: 'The grandest day of Bathukamma — Telangana\'s floral festival to Goddess Gauri. Women stack seasonal flowers into cone-shaped arrangements and float them on water, singing folk songs (Bathukamma paatalu).',
    link: 'https://en.wikipedia.org/wiki/Bathukamma',
  },
  {
    name: 'Deepavali',
    date: '2026-10-14',
    emoji: '🪔',
    type: 'Hindu',
    typeColor: '#eab308',
    description: 'Festival of Lights — Ashwina Amavasya. Homes lit with diyas and rangoli, fireworks, exchange of sweets, and Lakshmi Puja. A major celebration across every AP & Telangana household.',
    link: 'https://en.wikipedia.org/wiki/Diwali',
  },
  {
    name: 'Karthika Pournami',
    date: '2026-10-29',
    emoji: '🏮',
    type: 'Telugu',
    typeColor: '#f97316',
    description: 'Full moon of Karthika masam — the holiest month in Telugu culture. Devotees light Karthika deepams (oil lamps) every evening, visit Shiva temples, take holy dips in rivers, and light sky lanterns.',
    link: 'https://en.wikipedia.org/wiki/Kartik_Purnima',
  },
];

const RSVP_OPTIONS = [
  { value: 'INTERESTED',     label: 'Interested',     emoji: '✅', bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', emoji: '❌', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  { value: 'NOT_AVAILABLE',  label: 'Not Available',  emoji: '🚫', bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  { value: 'OTHER_PLANS',    label: 'Other Plans',    emoji: '📅', bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
];

const daysAway = (dateStr) => {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff === 0) return 'Today! 🎉';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days away`;
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

const formatWhatsAppNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return '91' + cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned;
  return cleaned;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const EventList = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rsvpLoading, setRsvpLoading] = useState({});

  // Create event modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prefillFestival, setPrefillFestival]  = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', eventDate: '', location: 'Sri Tulasi Nivas Apartment Complex',
    festivalLink: '', initiatedBy: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError]     = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // WhatsApp modal
  const [showWAModal, setShowWAModal]           = useState(false);
  const [waEvent, setWaEvent]                   = useState(null);
  const [phones, setPhones]                     = useState([]);
  const [phonesLoading, setPhonesLoading]       = useState(false);
  const [copyMsg, setCopyMsg]                   = useState(false);

  // Tab from URL ?tab=festivals
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'festivals') setActiveTab('festivals');
  }, [location.search]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/events/public/upcoming', { params: { page, size: 6 } });
      setEvents(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (activeTab === 'events') fetchEvents();
  }, [activeTab, fetchEvents]);

  const handleRsvp = async (eventId, status) => {
    setRsvpLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      const res = await api.post(`/events/${eventId}/rsvp`, { rsvpStatus: status });
      setEvents(prev => prev.map(e => e.id === eventId ? res.data : e));
    } catch {
      // silent failure — network issue
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const openCreateModal = (festival = null) => {
    setPrefillFestival(festival);
    setCreateForm({
      title:       festival ? `${festival.emoji} ${festival.name} Celebration` : '',
      description: festival ? festival.description : '',
      eventDate:   festival ? festival.date + 'T10:00' : '',
      location:    'Sri Tulasi Nivas Apartment Complex',
      festivalLink: festival ? festival.link : '',
      initiatedBy:  user ? `${user.firstName} ${user.lastName}` : '',
    });
    setCreateError('');
    setCreateSuccess('');
    setShowCreateModal(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.eventDate || !createForm.location.trim()) {
      setCreateError('Title, Date & Time, and Location are required.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      await api.post('/events', {
        title:          createForm.title,
        description:    createForm.description,
        eventDate:      createForm.eventDate,
        location:       createForm.location,
        estimatedBudget: 0,
        festivalLink:   createForm.festivalLink,
        initiatedBy:    createForm.initiatedBy,
      });
      setCreateSuccess('Event created successfully! 🎉');
      setTimeout(() => {
        setShowCreateModal(false);
        setActiveTab('events');
        setPage(0);
        fetchEvents();
      }, 1500);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openWAModal = async (event) => {
    setWaEvent(event);
    setShowWAModal(true);
    setPhonesLoading(true);
    try {
      const res = await api.get('/residents/phones');
      setPhones(res.data || []);
    } catch {
      setPhones([]);
    } finally {
      setPhonesLoading(false);
    }
  };

  const buildWAMessage = (ev) => {
    if (!ev) return '';
    return (
      `🎉 *Sri Tulasi Nivas Community Event*\n\n` +
      `📋 *${ev.title}*\n` +
      `📅 *Date:* ${formatDate(ev.eventDate)}\n` +
      `📍 *Location:* ${ev.location}\n\n` +
      (ev.description ? `ℹ️ ${ev.description}\n\n` : '') +
      (ev.initiatedBy ? `👤 *Organised by:* ${ev.initiatedBy}\n\n` : '') +
      `🙏 Please mark your interest on the community app!\n` +
      `🔗 https://sritulasinivas.vercel.app/events`
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(true);
      setTimeout(() => setCopyMsg(false), 2000);
    });
  };

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderEventCard = (ev) => {
    const loading = rsvpLoading[ev.id];
    const counts  = ev.rsvpCounts || {};
    return (
      <div key={ev.id} style={styles.eventCard}>
        <div style={styles.eventCardHeader}>
          <h3 style={styles.eventTitle}>{ev.title}</h3>
          {ev.status && (
            <span style={{ ...styles.badge, background: ev.status === 'PLANNED' ? '#dbeafe' : '#dcfce7', color: ev.status === 'PLANNED' ? '#1e40af' : '#166534' }}>
              {ev.status}
            </span>
          )}
        </div>

        <div style={styles.eventMeta}>
          <span>📅 {formatDate(ev.eventDate)}</span>
          <span>📍 {ev.location}</span>
        </div>

        {ev.initiatedBy && (
          <div style={styles.initiatedBy}>👤 Organised by: <strong>{ev.initiatedBy}</strong></div>
        )}

        {ev.description && (
          <p style={styles.eventDesc}>{ev.description.substring(0, 140)}{ev.description.length > 140 ? '…' : ''}</p>
        )}

        {ev.festivalLink && (
          <a href={ev.festivalLink} target="_blank" rel="noopener noreferrer" style={styles.festivalLinkBtn}>
            🔗 Learn about this festival
          </a>
        )}

        {/* RSVP Section */}
        <div style={styles.rsvpSection}>
          <div style={styles.rsvpTitle}>How will you participate?</div>
          <div style={styles.rsvpButtons}>
            {RSVP_OPTIONS.map(opt => {
              const selected = ev.userRsvp === opt.value;
              return (
                <button
                  key={opt.value}
                  disabled={loading}
                  onClick={() => handleRsvp(ev.id, opt.value)}
                  style={{
                    ...styles.rsvpBtn,
                    background:   selected ? opt.border : opt.bg,
                    border:       `2px solid ${opt.border}`,
                    color:        selected ? '#fff' : opt.text,
                    fontWeight:   selected ? 700 : 500,
                    opacity:      loading ? 0.6 : 1,
                  }}
                >
                  {opt.emoji} {opt.label}
                  {counts[opt.value] > 0 && (
                    <span style={{ ...styles.countBadge, background: selected ? 'rgba(255,255,255,0.3)' : opt.border, color: selected ? '#fff' : '#fff' }}>
                      {counts[opt.value]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {ev.userRsvp && (
            <div style={styles.yourResponse}>
              Your response: <strong>{RSVP_OPTIONS.find(o => o.value === ev.userRsvp)?.emoji} {RSVP_OPTIONS.find(o => o.value === ev.userRsvp)?.label}</strong>
              &nbsp;·&nbsp;
              <button onClick={() => handleRsvp(ev.id, ev.userRsvp)} style={styles.clearLink} disabled={loading}>
                Change
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.eventActions}>
          <button onClick={() => openWAModal(ev)} style={styles.waBtn}>
            📱 Share on WhatsApp
          </button>
        </div>
      </div>
    );
  };

  const renderFestivalCard = (f) => {
    const days = daysAway(f.date);
    return (
      <div key={f.name} style={styles.festivalCard}>
        <div style={styles.festivalHeader}>
          <span style={styles.festivalEmoji}>{f.emoji}</span>
          <div style={styles.festivalInfo}>
            <h3 style={styles.festivalName}>{f.name}</h3>
            <div style={styles.festivalMeta}>
              <span>📅 {formatDate(f.date)}</span>
              {days && <span style={{ ...styles.daysAway, background: days.includes('Today') ? '#dcfce7' : '#fef3c7', color: days.includes('Today') ? '#166534' : '#92400e' }}>{days}</span>}
            </div>
          </div>
          <span style={{ ...styles.typeBadge, background: f.typeColor + '22', color: f.typeColor, border: `1px solid ${f.typeColor}` }}>
            {f.type}
          </span>
        </div>

        <p style={styles.festivalDesc}>{f.description}</p>

        <div style={styles.festivalActions}>
          <a href={f.link} target="_blank" rel="noopener noreferrer" style={styles.learnMoreBtn}>
            📖 Learn More
          </a>
          <button onClick={() => openCreateModal(f)} style={styles.createFromFestBtn}>
            ➕ Create Community Event
          </button>
        </div>
      </div>
    );
  };

  // ─── Modals (inline JSX – NOT nested components, to avoid remount on keystroke) ──

  const createEventModalJSX = (
    <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
      <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {prefillFestival ? `${prefillFestival.emoji} Create Festival Event` : '➕ Create Community Event'}
          </h2>
          <button onClick={() => setShowCreateModal(false)} style={styles.closeBtn}>✕</button>
        </div>

        {createSuccess ? (
          <div style={styles.successBanner}>{createSuccess}</div>
        ) : (
          <form onSubmit={handleCreateEvent} style={styles.modalForm}>
            {createError && <div style={styles.errorBanner}>{createError}</div>}

            <label style={styles.formLabel}>Event Title *</label>
            <input
              style={styles.formInput}
              value={createForm.title}
              onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. 🌸 Ugadi Celebration 2026"
              required
            />

            <label style={styles.formLabel}>Date & Time *</label>
            <input
              type="datetime-local"
              style={styles.formInput}
              value={createForm.eventDate}
              onChange={e => setCreateForm(p => ({ ...p, eventDate: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              required
            />

            <label style={styles.formLabel}>Location *</label>
            <input
              style={styles.formInput}
              value={createForm.location}
              onChange={e => setCreateForm(p => ({ ...p, location: e.target.value }))}
              placeholder="e.g. Community Hall, Rooftop Terrace"
              required
            />

            <label style={styles.formLabel}>Description</label>
            <textarea
              style={{ ...styles.formInput, height: 80, resize: 'vertical' }}
              value={createForm.description}
              onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the event, activities planned, what to bring…"
            />

            <label style={styles.formLabel}>Organiser / Who is initiating</label>
            <input
              style={styles.formInput}
              value={createForm.initiatedBy}
              onChange={e => setCreateForm(p => ({ ...p, initiatedBy: e.target.value }))}
              placeholder="Your name or committee name"
            />

            <label style={styles.formLabel}>Festival Reference Link (optional)</label>
            <input
              type="url"
              style={styles.formInput}
              value={createForm.festivalLink}
              onChange={e => setCreateForm(p => ({ ...p, festivalLink: e.target.value }))}
              placeholder="https://en.wikipedia.org/wiki/..."
            />

            <div style={styles.modalFooter}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" disabled={createLoading} style={styles.submitBtn}>
                {createLoading ? 'Creating…' : '🎉 Create Event'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  const waMessage = buildWAMessage(waEvent);
  const whatsAppModalJSX = (
    <div style={styles.modalOverlay} onClick={() => setShowWAModal(false)}>
      <div style={{ ...styles.modalBox, maxWidth: 600 }} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>📱 Share on WhatsApp</h2>
            <button onClick={() => setShowWAModal(false)} style={styles.closeBtn}>✕</button>
          </div>

        {waEvent && (
          <div style={styles.waEventPreview}>
            <strong>{waEvent.title}</strong><br />
            📅 {formatDate(waEvent.eventDate)} &nbsp;·&nbsp; 📍 {waEvent.location}
          </div>
        )}

        {/* Message preview */}
        <div style={styles.waMsgBox}>
          <div style={styles.waMsgLabel}>Pre-composed message:</div>
          <pre style={styles.waMsgText}>{waMessage}</pre>
          <button
            onClick={() => copyToClipboard(waMessage)}
            style={styles.copyBtn}
          >
            {copyMsg ? '✅ Copied!' : '📋 Copy Message'}
          </button>
        </div>

        {/* Phone list */}
        <div style={styles.waPhoneSection}>
          <div style={styles.waPhoneTitle}>
            Community Members {phones.length > 0 && `(${phones.length} with phone numbers)`}
          </div>
          {phonesLoading ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Loading members…</div>
          ) : phones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>No phone numbers found.</div>
          ) : (
            <div style={styles.phoneList}>
              {phones.map((p, i) => (
                <div key={i} style={styles.phoneRow}>
                  <div style={styles.phoneContact}>
                    <span style={styles.phoneAvatar}>{p.name.charAt(0).toUpperCase()}</span>
                    <div>
                      <div style={styles.phoneName}>{p.name}</div>
                      {p.flatNo && <div style={styles.phoneFlatNo}>Flat {p.flatNo}</div>}
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(p.phone)}?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.sendWaBtn}
                  >
                    📲 Send
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.waNote}>
          💡 <em>Tip: Copy the message above and paste it in your WhatsApp group to notify everyone at once.</em>
        </div>
      </div>
    </div>
  );

  // ─── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Community Events</h1>
          <p style={styles.pageSubtitle}>Sri Tulasi Nivas · Hyderabad</p>
        </div>
        <button onClick={() => openCreateModal()} style={styles.createEventBtn}>
          ➕ Create Event
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'events' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('events')}
        >
          📅 Community Events
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'festivals' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('festivals')}
        >
          🕉️ AP & Telangana Festivals 2026
        </button>
      </div>

      {/* ── Events Tab ── */}
      {activeTab === 'events' && (
        <div>
          {error && <div style={styles.errorBanner}>{error}</div>}

          {loading ? (
            <div style={styles.loadingBox}>Loading events…</div>
          ) : events.length === 0 ? (
            <div style={styles.emptyBox}>
              <div style={{ fontSize: 48 }}>🎊</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No upcoming events yet</div>
              <div style={{ color: '#666', marginBottom: 20 }}>Be the first to create a community event!</div>
              <button onClick={() => openCreateModal()} style={styles.createEventBtn}>
                ➕ Create Event
              </button>
            </div>
          ) : (
            <>
              <div style={styles.eventsGrid}>
                {events.map(renderEventCard)}
              </div>
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={styles.pageBtn}>
                    ← Previous
                  </button>
                  <span style={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
                  <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} style={styles.pageBtn}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Festivals Tab ── */}
      {activeTab === 'festivals' && (
        <div>
          <div style={styles.festivalsIntro}>
            🕉️ &nbsp;Upcoming AP & Telangana festivals in 2026 — click <strong>Create Community Event</strong> on any festival to organise a celebration for our apartment community!
          </div>
          <div style={styles.festivalsGrid}>
            {UPCOMING_FESTIVALS.map(renderFestivalCard)}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && createEventModalJSX}
      {showWAModal     && whatsAppModalJSX}
    </div>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  page:          { padding: '24px 20px', maxWidth: 1100, margin: '0 auto' },
  pageHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  pageTitle:     { fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 },
  pageSubtitle:  { color: '#666', margin: '4px 0 0' },
  createEventBtn:{ background: '#b45309', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer' },

  tabBar:     { display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb', marginBottom: 24 },
  tab:        { background: 'transparent', border: 'none', padding: '10px 20px', fontSize: 15, fontWeight: 500, cursor: 'pointer', color: '#666', borderBottom: '3px solid transparent', marginBottom: -2 },
  tabActive:  { color: '#b45309', borderBottomColor: '#b45309', fontWeight: 700 },

  eventsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },

  eventCard:       { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  eventCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  eventTitle:      { fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0, flex: 1 },
  badge:           { borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' },
  eventMeta:       { display: 'flex', gap: 12, fontSize: 13, color: '#555', marginBottom: 8, flexWrap: 'wrap' },
  initiatedBy:     { fontSize: 13, color: '#777', marginBottom: 8 },
  eventDesc:       { fontSize: 14, color: '#444', lineHeight: 1.5, marginBottom: 12 },
  festivalLinkBtn: { display: 'inline-block', fontSize: 12, color: '#b45309', textDecoration: 'none', marginBottom: 14, fontWeight: 500 },

  rsvpSection:  { borderTop: '1px solid #f0f0f0', paddingTop: 14, marginTop: 8 },
  rsvpTitle:    { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 },
  rsvpButtons:  { display: 'flex', gap: 6, flexWrap: 'wrap' },
  rsvpBtn:      { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' },
  countBadge:   { borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700, marginLeft: 2 },
  yourResponse: { fontSize: 12, color: '#555', marginTop: 10 },
  clearLink:    { background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', padding: 0 },

  eventActions: { marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0' },
  waBtn:        { background: '#25d366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },

  loadingBox:   { textAlign: 'center', padding: 60, color: '#666', fontSize: 16 },
  emptyBox:     { textAlign: 'center', padding: 60, background: '#fafafa', borderRadius: 12, border: '2px dashed #e5e7eb' },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 28 },
  pageBtn:      { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600 },
  pageInfo:     { color: '#555', fontSize: 14 },

  festivalsIntro: { background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontSize: 14, color: '#78350f' },
  festivalsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },

  festivalCard:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  festivalHeader:  { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  festivalEmoji:   { fontSize: 36, lineHeight: 1 },
  festivalInfo:    { flex: 1 },
  festivalName:    { fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' },
  festivalMeta:    { display: 'flex', gap: 10, fontSize: 13, color: '#555', flexWrap: 'wrap', alignItems: 'center' },
  daysAway:        { borderRadius: 999, padding: '1px 10px', fontSize: 12, fontWeight: 600 },
  typeBadge:       { borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' },
  festivalDesc:    { fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 14 },
  festivalActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  learnMoreBtn:    { flex: 1, textAlign: 'center', background: '#f3f4f6', color: '#1a1a1a', border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' },
  createFromFestBtn: { flex: 1, background: '#b45309', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalBox:     { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0', marginBottom: 16 },
  modalTitle:   { fontSize: 20, fontWeight: 700, margin: 0, color: '#1a1a1a' },
  closeBtn:     { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666', padding: '0 4px' },
  modalForm:    { padding: '0 24px 24px' },
  formLabel:    { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4, marginTop: 14 },
  formInput:    { width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  modalFooter:  { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  cancelBtn:    { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  submitBtn:    { background: '#b45309', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 },

  successBanner: { background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 8, padding: '14px 20px', margin: '0 24px 20px', textAlign: 'center', fontWeight: 600 },
  errorBanner:   { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 14 },

  waEventPreview: { margin: '0 24px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#374151' },
  waMsgBox:       { margin: '0 24px 16px' },
  waMsgLabel:     { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  waMsgText:      { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#166534', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 8px', fontFamily: 'inherit' },
  copyBtn:        { background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#166534' },
  waPhoneSection: { margin: '0 24px 16px' },
  waPhoneTitle:   { fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 },
  phoneList:      { maxHeight: 240, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 },
  phoneRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f3f4f6' },
  phoneContact:   { display: 'flex', alignItems: 'center', gap: 10 },
  phoneAvatar:    { width: 34, height: 34, borderRadius: '50%', background: '#b45309', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  phoneName:      { fontSize: 14, fontWeight: 600, color: '#1a1a1a' },
  phoneFlatNo:    { fontSize: 12, color: '#777' },
  sendWaBtn:      { background: '#25d366', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  waNote:         { margin: '0 24px 20px', fontSize: 13, color: '#666', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '10px 14px' },
};

export default EventList;

