import React, { useState } from 'react';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/user/Home';
import AdminPanel from './components/admin/AdminPanel';
import NotesBg from './components/shared/NotesBg';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.isAdmin) {
      setPage('admin');
    } else {
      setPage('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  return (
    <div className="app">
      <NotesBg />

      {page === 'login' && (
        <Login onLogin={handleLogin} onGoSignup={() => setPage('signup')} />
      )}
      {page === 'signup' && (
        <Signup onSignup={() => setPage('login')} onGoLogin={() => setPage('login')} />
      )}
      {page === 'home' && (
        <Home user={user} onLogout={handleLogout} />
      )}
      {page === 'admin' && (
        <AdminPanel user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;