import React, { useState, useEffect } from 'react';
import NotesBg from '../shared/NotesBg'; 
import './Home.css';


const API = 'http://localhost:3001';

// --- Artist Card Component ---
const ArtistCard = ({ artist }) => {
  const [expanded, setExpanded] = useState(null); // stores index of open playlist

  const displayName = artist.firstName && artist.lastName
    ? `${artist.firstName} ${artist.lastName}`
    : artist.username;

  return (
    <div className="artist-card">
      <div className="artist-avatar-fallback">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="artist-info">
        <p className="artist-name">{displayName}</p>
        <p className="artist-username">@{artist.username}</p>

        {artist.playlists?.length > 0 ? (
          <div className="artist-playlists">
            {artist.playlists.map((pl, i) => (
              <div key={pl._id} className="artist-playlist-entry">
                <button
                  className="btn-playlist-toggle"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  🎵 {pl.name} {expanded === i ? '▲' : '▼'}
                </button>
                {expanded === i && (
                  <ul className="playlist-songs">
                    {pl.songs.map((song, j) => (
                      <li key={j}>{song.title} <span>— {song.artist}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="artist-no-playlist">No playlists yet</p>
        )}
      </div>
    </div>
  );
};


const Home = ({ user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
// --- Playlist State ---
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [playlistsError, setPlaylistsError] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Featured Artists State ---
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistsError, setArtistsError] = useState('');

  // --- Fetch Featured Artists ---
  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const res = await fetch(`${API}/artists/featured`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFeaturedArtists(data);
      } catch {
        setArtistsError('Could not load featured artists.');
      } finally {
        setArtistsLoading(false);
      }
    };
    fetchFeaturedArtists();
  }, []);

  // --- Fetch User's Playlists ---
  useEffect(() => {
    if (!user?.username)
        return;
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`${API}/playlists/${user.username}`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPlaylists(data);
      }
      catch {
        setPlaylistsError('Could not load your playlists.');
      }
      finally {
        setPlaylistsLoading(false);
      }
    };
    fetchPlaylists();
  }, [user]);


  // --- Search Logic ---
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=5`
        );
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
  
  
  // --- Queue Logic ---
  const addToQueue = (song) => {
    if (!queue.find(q => q.id === song.id)) {
      setQueue((prev) => [...prev, song]);
    }
  };

  const deleteFromQueue = (songId) => {
    setQueue((prev) => prev.filter(s => s.id !== songId));
  };


  // --- Save Playlist to MongoDB ---
  const finishPlaylist = async () => {
    if (!playlistName.trim() || queue.length === 0) {
      alert("Please add a name and some songs to your queue first!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: playlistName,
          username: user.username,
          songs: queue,
        }),
      });
      
      const data = await res.json();

    if (!res.ok) {
      alert(data.message); // shows the specific error from the server
      return;
    }
      
      setPlaylists(prev => [data, ...prev]);
      setShowModal(true);
    }
    catch {
      alert('Failed to save playlist. Please try again.');
    }
    finally {
      setSaving(false);
    }
  };

  // --- Delete Playlist from MongoDB ---
  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Delete this playlist?'))
        return;
    try {
      const res = await fetch(`${API}/playlists/${playlistId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      setPlaylists(prev => prev.filter(pl => pl._id !== playlistId));
    }
    catch {
      alert('Failed to delete playlist.');
    }
  };

  const closeAndReset = () => {
    setShowModal(false);
    setQueue([]);
    setPlaylistName('');
    setSearchTerm('');
  };
  
  return (
    <div className="home-wrapper">
      <NotesBg /> 

      {/* --- Top Navigation Bar --- */}
      <header className="top-bar">
        <h1 className="brand-title" style={{ margin: 0, fontSize: '2rem' }}>Audify</h1>
        
        <div className="user-controls">
          <span className="welcome-text">Welcome Back, {user?.username || 'Guest'}!</span>
          {onLogout && <button className="btn-delete logout-btn" onClick={onLogout}>Log Out</button>}
        </div>
      </header>
      
    {/* --- Featured Artists Section --- */}
      <section className="featured-section">
        <h2 className="featured-heading">Featured Artists</h2>

        {artistsLoading && <p className="empty-text">Loading artists...</p>}
        {!artistsLoading && artistsError && <p className="empty-text" style={{ color: '#ff6b6b' }}>{artistsError}</p>}
        {!artistsLoading && !artistsError && featuredArtists.length === 0 && (
          <p className="empty-text">No featured artists yet.</p>
        )}
        {!artistsLoading && !artistsError && featuredArtists.length > 0 && (
          <div className="artists-grid">
            {featuredArtists.map((artist) => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
        )}
      </section>
      
      
      {/* --- Two-Column Layout --- */}
      <div className="dashboard-layout">
        
        {/* Left Side: Search & Queue */}
        <main className="dashboard-card main-panel">
          <div id="home-content">
            <div id="search-section">
              
              <div id="search-bar">
                <input 
                  type="text" 
                  placeholder="Search for songs..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              
              <div id="results">
                {searchResults.map((song) => (
                  <div key={song.id} className="song-card">
                    <img src={song.artwork} alt={song.title} />
                    <div className="song-info">
                      <p className="song-title">{song.title}</p>
                      <p className="song-artist">{song.artist}</p>
                      <audio controls src={song.preview} onError={(e) => e.stopPropagation()}></audio>
                    </div>
                    <button className="btn-add" onClick={() => addToQueue(song)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
            
            <h2>Your Song Queue</h2>
            <div className="input-group">
              <label htmlFor="playlistname">Playlist Name:</label>
              <input 
                type="text" 
                id="playlistname" 
                value={playlistName} 
                placeholder="E.g. Study Vibes"
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>
            
            <div id="queue">
              {queue.length > 0 ? (
                queue.map((song) => (
                  <div key={song.id} className="song-card queue-card">
                    <div className="song-info">
                      <p className="song-title">{song.title}</p>
                      <p className="song-artist">{song.artist}</p>
                    </div>
                    <button className="btn-delete" onClick={() => deleteFromQueue(song.id)}>Delete</button>
                  </div>
                ))
              ) : (
                <p className="empty-text">Your queue is empty. Search for songs to add!</p>
              )}
            </div>
            
            <button className="btn-primary finish-btn" onClick={finishPlaylist}>Finish Playlist</button>
          </div>
        </main>

        {/* Right Side: Saved Playlists */}
        <aside className="dashboard-card side-panel">
          <h2 style={{ marginTop: 0 }}>Your Saved Playlists</h2>
          {playlists.length > 0 ? (
            playlists.map((pl) => (
              <div key={pl._id} className="saved-playlist">
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 className="brand-title" style={{fontSize: '1.3rem', textAlign: 'left', margin: 0}}>{pl.name}</h3>
                  <button 
                    className="btn-delete" 
                    onClick={() => deletePlaylist(pl._id)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {pl.songs.map((song) => (
                    <div key={song.id} style={{padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.9rem'}}>
                      <strong>{song.title}</strong> by {song.artist}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-text">No playlists saved yet.</p>
          )}
        </aside>

      </div>

      {/* --- Success Modal --- */}
      {showModal && (
        <div id="playlist-modal">
          <div className="modal-content">
            <h2 style={{marginTop: 0, color: 'hsl(265, 100%, 70%)'}}>Playlist Saved!</h2>
            <p>Your playlist <strong>{playlistName}</strong> has been created successfully.</p>
            <button className="btn-primary" onClick={closeAndReset} style={{width: '100%', marginTop: '15px'}}>Awesome!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
