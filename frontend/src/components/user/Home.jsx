import React, { useState, useEffect } from 'react';
import NotesBg from '../shared/NotesBg'; 
import './Home.css';

const Home = ({ user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const delaySearch = setTimeout(async () => {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=5`);
        const data = await res.json();

        if (data.results.length === 0) {
          setSearchResults([]);
          return;
        }

        const formattedResults = data.results.map((song) => ({
          id: song.trackId,
          title: song.trackName,
          artist: song.artistName,
          artwork: song.artworkUrl100,
          preview: song.previewUrl
        }));
        
        setSearchResults(formattedResults);
      } catch (err) {
        console.error('Could not fetch songs', err);
        setSearchResults([]);
      }
    }, 500); // Wait half a second

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // --- Queue & Playlist Logic ---
  const addToQueue = (song) => {
    if (!queue.find(qSong => qSong.id === song.id)) {
      setQueue((prevQueue) => [...prevQueue, song]);
    }
  };

  const deleteFromQueue = (songId) => {
    setQueue((prevQueue) => prevQueue.filter((song) => song.id !== songId));
  };

  const finishPlaylist = () => {
    if (!playlistName.trim() || queue.length === 0) {
      alert("Please add a name and some songs to your queue first!");
      return;
    }

    const newPlaylist = {
      name: playlistName,
      songs: [...queue],
      id: Date.now() 
    };

    setPlaylists((prev) => [...prev, newPlaylist]);
    setShowModal(true); 
  };

  const closeAndReset = () => {
    setShowModal(false);
    setQueue([]); 
    setPlaylistName(''); 
    setSearchTerm('');
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists((prevPlaylists) => prevPlaylists.filter((pl) => pl.id !== playlistId));
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
                      <audio controls src={song.preview}></audio>
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
              <div key={pl.id} className="saved-playlist">
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 className="brand-title" style={{fontSize: '1.3rem', textAlign: 'left', margin: 0}}>{pl.name}</h3>
                  <button 
                    className="btn-delete" 
                    onClick={() => deletePlaylist(pl.id)} 
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
