import React from 'react';

function Home({ user, onLogout }) {
  return (
    <>
      <div className="auth-wrapper">
        <h1 className="brand-title">Audify</h1>
        <div className="auth-card">
          <h2>Welcome, {user?.username}!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px', marginBottom: '24px' }}>
            {user?.isAdmin ? '👑 Admin Account' : '🎵 Standard User'}
          </p>
          <button className="btn-primary" onClick={onLogout}>Log Out</button>
        </div>
      </div>
    </>
  );
}

export default Home;
