import React from 'react';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="container dashboard">
      <h1>Welcome, {user?.firstName}!</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>👤 Profile</h3>
          <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <button className="btn-secondary">Edit Profile</button>
        </div>

        <div className="dashboard-card">
          <h3>🏠 My Apartments</h3>
          <p>Manage your apartment listings and details.</p>
          <button className="btn-secondary">View Apartments</button>
        </div>

        <div className="dashboard-card">
          <h3>🎉 My Contributions</h3>
          <p>Track your event contributions and history.</p>
          <button className="btn-secondary">View History</button>
        </div>

        <div className="dashboard-card">
          <h3>⚙️ Settings</h3>
          <p>Update your account settings and preferences.</p>
          <button className="btn-secondary">Go to Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
