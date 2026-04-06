import React, { useState, useEffect, useCallback } from "react";
import "./AdminPanel.css";
const API = "http://localhost:3001";

function AdminPanel({ user, onLogout }) {
  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [search, setSearch] = useState(""); 
  const [editForm, setEditForm] = useState({}); 
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState("username");
  
  // --- Playlist States ---
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState('');
  
  // Playlist Editing States
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [queue, setQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savingPlaylist, setSavingPlaylist] = useState(false);

  const [createForm, setCreateForm] = useState({
    firstName: "", lastName: "", email: "", username: "", password: "",
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/users`, { credentials: "include" });
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      showMessage("Could not load users.", "error");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search
  useEffect(() => {
    let result = [...users];
    if (search) {
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (sortBy === "username") {
      result.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === "created") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFilteredUsers(result);
  }, [search, users, sortBy]);
  
  // --- Fetch Selected User's Playlists ---
  useEffect(() => {
    if (!selectedUser?.username) return;
    setPlaylistsLoading(true);
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`${API}/playlists/${selectedUser.username}`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPlaylists(data);
      } catch {
        setPlaylistsError('Could not load user playlists.');
      } finally {
        setPlaylistsLoading(false);
      }
    };
    fetchPlaylists();
  }, [selectedUser]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=5`);
        const data = await res.json();
        if (data.results.length === 0) { setSearchResults([]); return; }
        setSearchResults(data.results.map((song) => ({
          id: song.trackId,
          title: song.trackName,
          artist: song.artistName,
          artwork: song.artworkUrl100,
          preview: song.previewUrl,
        })));
      } catch {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setEditForm({
      firstName: u.firstName || "", lastName: u.lastName || "",
      email: u.email || "", username: u.username || "",
    });
    setMessage("");
    cancelEditPlaylist(); // Close the playlist editor if they click a new user
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API}/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("✓ User updated!", "success");
        fetchUsers();
        setSelectedUser({ ...selectedUser, ...editForm });
      } else {
        showMessage(data.message || "Update failed.", "error");
      }
    } catch {
      showMessage("Could not connect to server.", "error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedUser.username}?`)) return;
    try {
      const res = await fetch(`${API}/admin/users/${selectedUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("✓ User deleted!", "success");
        setSelectedUser(null);
        fetchUsers();
      } else {
        showMessage(data.message || "Delete failed.", "error");
      }
    } catch {
      showMessage("Could not connect to server.", "error");
    }
  };

  const handleToggleAdmin = async () => {
    try {
      const res = await fetch(`${API}/admin/users/${selectedUser._id}/admin`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message, "success");
        fetchUsers();
        setSelectedUser({ ...selectedUser, isAdmin: !selectedUser.isAdmin });
      } else {
        showMessage(data.message || "Failed.", "error");
      }
    } catch {
      showMessage("Could not connect to server.", "error");
    }
  };

  const handleCreateUser = async () => {
    try {
      const res = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("✓ User created!", "success");
        setShowCreateForm(false);
        setCreateForm({ firstName: "", lastName: "", email: "", username: "", password: "" });
        fetchUsers();
      } else {
        showMessage(data.message || "Failed to create user.", "error");
      }
    } catch {
      showMessage("Could not connect to server.", "error");
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  // --- Queue & Editor Functions ---
  const handleEditPlaylist = (playlist) => {
    setPlaylistName(playlist.name);
    setQueue(playlist.songs);
    setEditingPlaylistId(playlist._id);
  };

  const cancelEditPlaylist = () => {
    setEditingPlaylistId(null);
    setPlaylistName('');
    setQueue([]);
    setSearchTerm('');
  };

  const addToQueue = (song) => {
    if (!queue.find(q => q.id === song.id)) {
      setQueue((prev) => [...prev, song]);
    }
  };

  const deleteFromQueue = (songId) => {
    setQueue((prev) => prev.filter(s => s.id !== songId));
  };

  // --- Save Edited Playlist to Database ---
  const saveEditedPlaylist = async () => {
    if (!playlistName.trim() || queue.length === 0) {
      showMessage("Please provide a name and add songs to the queue.", "error");
      return;
    }
    setSavingPlaylist(true);
    try {
      const res = await fetch(`${API}/playlists/${editingPlaylistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: playlistName,
          username: selectedUser.username, // Make sure it stays on the target user's account
          songs: queue,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlaylists(prev => prev.map(pl => pl._id === editingPlaylistId ? { ...pl, name: playlistName, songs: queue } : pl));
        showMessage("✓ Playlist updated successfully!", "success");
        cancelEditPlaylist();
      } else {
        showMessage(data.message || "Failed to update playlist.", "error");
      }
    } catch {
      showMessage("Failed to connect to server.", "error");
    } finally {
      setSavingPlaylist(false);
    }
  };

  // --- Delete Playlist ---
  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Delete this playlist permanently?')) return;
    try {
      const res = await fetch(`${API}/playlists/${playlistId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      setPlaylists(prev => prev.filter(pl => pl._id !== playlistId));
      if (editingPlaylistId === playlistId) cancelEditPlaylist();
    } catch {
      showMessage("Failed to delete playlist.", "error");
    }
  };
  
  return (
    <div className="admin-wrapper">
      {/* TOP NAV */}
      <div className="admin-nav">
        <h1 className="admin-brand">Audify</h1>
        <div className="admin-nav-right">
          <span className="admin-welcome">👑 {user?.username}</span>
          <button className="admin-logout-btn" onClick={onLogout}>
            Log Out
          </button>
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
          </div>

          <div className="sort-bar">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-dropdown">
              <option value="username">Alphabetical</option>
              <option value="created">Date Created</option>
            </select>
          </div>

          <button className="btn-create-user" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "✕ Cancel" : "+ Create User"}
          </button>

          {showCreateForm && (
            <div className="create-user-form">
              <input placeholder="First Name" value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} />
              <input placeholder="Last Name" value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
              <input placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              <input placeholder="Username" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
              <input type="password" placeholder="Password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              <button className="btn-save" onClick={handleCreateUser}>Create User</button>
            </div>
          )}

          <div className="admin-user-list">
            {filteredUsers.length === 0 && <p className="no-users">No users found.</p>}
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className={`admin-user-item ${selectedUser?._id === u._id ? "active" : ""}`}
                onClick={() => handleSelectUser(u)}
              >
                <span>{u.username}</span>
                <span className={u.isAdmin ? "role-badge admin" : "role-badge standard"} title={u.isAdmin ? "Administrator" : "Standard User"}>
                  {u.isAdmin ? "👑" : "🎵"}
                </span>
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
                  <input type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange} />
                </div>
                <div className="admin-form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange} />
                </div>
                <div className="admin-form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange} />
                </div>
                <div className="admin-form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={editForm.username} onChange={handleEditChange} />
                </div>
              </div>

              <div className="admin-actions">
                <button className="btn-save" onClick={handleUpdate}>Save Changes</button>
                <button className={selectedUser.isAdmin ? "btn-remove-admin" : "btn-make-admin"} onClick={handleToggleAdmin}>
                  {selectedUser.isAdmin ? "Remove Admin" : "Make Admin"}
                </button>
                <button className="btn-delete" onClick={handleDelete}>Delete User</button>
              </div>

              {message && (
                <p className={`admin-message ${messageType}`}>{message}</p>
              )}

              {/* USER'S PLAYLISTS SECTION */}
              <h2 style={{ marginTop: "32px", marginBottom: "16px" }}>
                {selectedUser.username}'s Playlists
              </h2>

              {/* POP-UP PLAYLIST EDITOR */}
              {editingPlaylistId && (
                <div className="admin-playlist-editor">
                  <h3 style={{ color: "hsl(265, 100%, 75%)", marginTop: 0 }}>Editing: {playlistName}</h3>
                  
                  {/* iTunes Search for Admin */}
                  <div className="admin-search-bar" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <input 
                      type="text" 
                      placeholder="Search iTunes to add songs..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  
                  <div className="admin-editor-results">
                    {searchResults.map((song) => (
                      <div key={song.id} className="admin-editor-song">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img src={song.artwork} alt={song.title} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{song.title}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{song.artist}</p>
                          </div>
                        </div>
                        <button className="admin-btn-add" onClick={() => addToQueue(song)}>Add</button>
                      </div>
                    ))}
                  </div>

                  {/* Queue Editor */}
                  <div className="admin-form-group" style={{ marginBottom: "15px" }}>
                    <label>Playlist Name</label>
                    <input type="text" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} />
                  </div>

                  <div className="admin-editor-queue">
                    {queue.map((song) => (
                      <div key={song.id} className="admin-editor-song">
                        <div>
                          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{song.title}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{song.artist}</p>
                        </div>
                        <button className="btn-delete" style={{ padding: "4px 8px", fontSize: "0.8rem" }} onClick={() => deleteFromQueue(song.id)}>Remove</button>
                      </div>
                    ))}
                    {queue.length === 0 && <p className="empty-text" style={{ fontSize: '0.9rem' }}>Queue is empty.</p>}
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn-save" style={{ flex: 1 }} onClick={saveEditedPlaylist} disabled={savingPlaylist}>
                      {savingPlaylist ? "Saving..." : "Save Playlist Updates"}
                    </button>
                    <button className="btn-delete" onClick={cancelEditPlaylist}>Cancel</button>
                  </div>
                </div>
              )}

              {/* PLAYLIST GRID */}
              <div className="admin-playlists-container">
                {playlistsLoading ? (
                  <p className="empty-text">Loading playlists...</p>
                ) : playlists.length > 0 ? (
                  playlists.map((pl) => (
                    <div key={pl._id} className="saved-playlist" style={editingPlaylistId === pl._id ? { border: "2px solid hsl(265, 100%, 60%)" } : {}}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 className="brand-title" style={{ fontSize: '1.3rem', textAlign: 'left', margin: 0 }}>{pl.name}</h3>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="admin-btn-add"
                            onClick={() => handleEditPlaylist(pl)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => deletePlaylist(pl._id)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pl.songs.map((song, idx) => (
                          <div key={`${song.id}-${idx}`} style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.9rem' }}>
                            <strong>{song.title}</strong> by {song.artist}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">No playlists saved yet.</p>
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