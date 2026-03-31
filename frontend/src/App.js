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

  // 1. ADD THIS BACK: The function logic
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

  // 2. Define the "Clean Pages" (No falling notes)
  const cleanPages = ['admin', 'settings', 'profile'];

  // 3. Check if the current page is in that list
  const showNotes = !cleanPages.includes(page);

  return (
    <div className="app">
      {/* Render the background only if it's NOT a clean page */}
      {showNotes && <NotesBg />}

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