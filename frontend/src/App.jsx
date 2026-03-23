import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navigation from './components/Navigation';
import AuthPage from './pages/AuthPage';
import ApartmentList from './pages/ApartmentList';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import Dashboard from './pages/Dashboard';
import ResidentsPage from './pages/ResidentsPage';
import MaintenancePage from './pages/MaintenancePage';
import FundsPage from './pages/FundsPage';
import ContactsPage from './pages/ContactsPage';
import MeetingsPage from './pages/MeetingsPage';
import UpdatesPage from './pages/UpdatesPage';
import IssuesPage from './pages/IssuesPage';
import PrivateRoute from './components/PrivateRoute';
import VerifyEmailPage from './pages/VerifyEmailPage';
import './App.css';

function App() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Unauthenticated users always see the auth page (or verify-email page)
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/residents" replace />} />
          <Route path="/apartments" element={<ApartmentList />} />
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/funds" element={<FundsPage />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth" element={<Navigate to="/residents" replace />} />
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/residents" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
