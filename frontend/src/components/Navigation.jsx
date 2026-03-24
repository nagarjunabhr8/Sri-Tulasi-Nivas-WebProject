import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { label: 'Home', path: '/residents' },
  {
    label: 'Events', path: '/events', dropdown: [
      { label: '🎉 All Events', path: '/events' },
      { label: '📅 Upcoming Events', path: '/events' },
      { label: '🕉️ AP & TG Festivals', path: '/events?tab=festivals' },
    ]
  },
  {
    label: 'Maintenance', path: '/maintenance', dropdown: [
      { label: '🔧 Maintenance Requests', path: '/maintenance' },
      { label: '📋 Request History', path: '/maintenance' },
    ]
  },
  { label: 'Issues', path: '/issues' },
  {
    label: 'Meetings', path: '/meetings', dropdown: [
      { label: '📊 All Meetings', path: '/meetings' },
      { label: '📝 Meeting Minutes', path: '/meetings' },
    ]
  },
  {
    label: 'Apartment Funds', path: '/funds', dropdown: [
      { label: '💰 Fund Overview', path: '/funds' },
      { label: '📈 Contributions', path: '/funds' },
    ]
  },
  {
    label: 'Contacts', path: '/contacts', dropdown: [
      { label: '📞 All Contacts', path: '/contacts' },
      { label: '🏢 Management', path: '/contacts' },
    ]
  },
  {
    label: 'President', path: '/contacts', dropdown: [
      { label: '👤 About President', path: '/contacts' },
      { label: '📢 Announcements', path: '/updates' },
    ]
  },
  {
    label: 'Updates', path: '/updates', dropdown: [
      { label: '🔔 Latest Updates', path: '/updates' },
      { label: '📣 Notices', path: '/updates' },
    ]
  },
];

const Navigation = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : '';

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="site-header">
      {/* ── Banner ───────────────────────────────────────── */}
      <div className="site-banner">
        <div className="banner-motif" />
        <div className="banner-inner">
          <div className="banner-left">
            <div className="tulasi-icon">🌿</div>
            <div className="banner-title">
              <h1>Sri Tulasi Nivas</h1>
              <p>RESIDENTIAL APARTMENT COMMUNITY · HYDERABAD</p>
            </div>
          </div>
          <div className="banner-right">
            <div className="banner-tagline">"Where Community Blossoms"</div>
            <div className="banner-tel">Est. 2020 · Telangana, India</div>
          </div>
        </div>
      </div>

      {/* ── Navigation Bar ───────────────────────────────── */}
      <nav className="site-nav">
        <div className="site-nav-inner">
          {/* Tabs */}
          <div className="site-nav-tabs">
            {NAV_ITEMS.map(item => (
              <div key={item.label} className="site-nav-item">
                <Link
                  to={item.path}
                  className={`site-nav-link${isActive(item.path) ? ' active' : ''}`}
                >
                  {item.label}
                  {item.dropdown && <span className="nav-caret">▾</span>}
                </Link>
                {item.dropdown && (
                  <div className="site-nav-dropdown">
                    {item.dropdown.map(d => (
                      <Link key={d.label} to={d.path} className="site-dropdown-item">
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Info + Logout */}
          <div className="site-nav-user">
            <div className="nav-user-badge">
              <span className="nav-user-avatar">{initials}</span>
              <div className="nav-user-info">
                <span className="nav-user-name">{fullName}</span>
                <span className="nav-user-role">{user?.role || 'USER'}</span>
              </div>
            </div>
            <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
              ⏻ Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
