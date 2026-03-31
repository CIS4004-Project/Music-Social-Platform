import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const API = 'http://localhost:3001';

function AdminPanel({ user, onLogout }) {
  const [users, setUsers] = useState([]); // all users from database
  const [filteredUsers, setFilteredUsers] = useState([]); // users after search filter
  const [selectedUser, setSelectedUser] = useState(null); // user clicked on
  const [search, setSearch] = useState(''); // search input value
  const [editForm, setEditForm] = useState({}); // form values for editing
  const [message, setMessage] = useState(''); // success/error message
  const [messageType, setMessageType] = useState('');

  // Fetch all users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (!search) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(u =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/users`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      showMessage('Could not load users.', 'error');
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setEditForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      username: u.username || '',
    });
    setMessage('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API}/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('✓ User updated!', 'success');
        fetchUsers();
        setSelectedUser({ ...selectedUser, ...editForm });
      } else {
        showMessage(data.message || 'Update failed.', 'error');
      }
    } catch {
      showMessage('Could not connect to server.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedUser.username}?`)) return;
    try {
      const res = await fetch(`${API}/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('✓ User deleted!', 'success');
        setSelectedUser(null);
        fetchUsers();
      } else {
        showMessage(data.message || 'Delete failed.', 'error');
      }
    } catch {
      showMessage('Could not connect to server.', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="admin-wrapper">
      {/* TOP NAV */}
      <div className="admin-nav">
        <h1 className="admin-brand">Audify</h1>
        <div className="admin-nav-right">
          <span className="admin-welcome">👑 {user?.username}</span>
          <button className="admin-logout-btn" onClick={onLogout}>Log Out</button>
        </div>
      </div>

      <div className="admin-body">
        {/* LEFT PANEL — USER LIST */}
        <div className="admin-left">
          <h2>Administrator View</h2>
          <p className="admin-subtitle">Welcome, {user?.username}!</p>

          <div className="admin-search-bar">
            <span>☰</span>
            <input
              type="text"
              placeholder="Search for Users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span>🔍</span>
          </div>

          <div className="admin-user-list">
            {filteredUsers.length === 0 && (
              <p className="no-users">No users found.</p>
            )}
            {filteredUsers.map(u => (
              <div
                key={u._id}
                className={`admin-user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                onClick={() => handleSelectUser(u)}
              >
                <span>{u.username}</span>
                <span className="view-icon">👁</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — SELECTED USER */}
        <div className="admin-right">
          {!selectedUser ? (
            <div className="admin-placeholder">
              <p>← Select a user to view their details</p>
            </div>
          ) : (
            <>
              <h2>Selected User</h2>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="admin-actions">
                <button className="btn-save" onClick={handleUpdate}>Save Changes</button>
                <button className="btn-delete" onClick={handleDelete}>Delete User</button>
              </div>

              {message && (
                <p className={`admin-message ${messageType}`}>{message}</p>
              )}

              {/* USER'S LIKED SONGS */}
              <h2 style={{ marginTop: '32px' }}>
                {selectedUser.username}'s Liked Songs
              </h2>

              <div className="admin-songs-grid">
                {!selectedUser.songs || selectedUser.songs.length === 0 ? (
                  <p className="no-songs">This user has no saved songs.</p>
                ) : (
                  selectedUser.songs.map((song, index) => (
                    <div key={index} className="admin-song-card">
                      {song.image && (
                        <img src={song.image} alt={song.title} />
                      )}
                      <p className="song-title">{song.title}</p>
                      <p className="song-artist">{song.artist}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;