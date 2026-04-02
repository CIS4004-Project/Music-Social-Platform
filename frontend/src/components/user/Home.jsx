import React, { useState } from 'react';
import './Home.css';

const Home = ({ user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [showModal, setShowModal] = useState(false);

  // --- Search Logic ---
  const searchMusic = async () => {
    if (!searchTerm.trim()) return;

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
  };

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
  };

  return (
    <div className="home-wrapper">
      {/* Renders the background animation behind everything! */}
      
      <main className="dashboard-card">
        <h1 className="brand-title">Audify</h1>
        
        <h2>Welcome Back, {user?.username || 'Guest'}!</h2>
        {onLogout && <button className="btn-delete" onClick={onLogout} style={{marginBottom: '20px'}}>Log Out</button>}

        <div id="home-content">
          <div id="search-section">
            <div id="search-bar">
              <input 
                type="text" 
                placeholder="Search for songs..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
              />
              <button className="btn-primary" onClick={searchMusic}>Search</button>
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
          
          <h2>Your Saved Playlists</h2>
          {playlists.length > 0 ? (
            playlists.map((pl) => (
              <div key={pl.id} className="saved-playlist">
                <h3 className="brand-title" style={{fontSize: '1.5rem', textAlign: 'left'}}>{pl.name}</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {pl.songs.map((song) => (
                    <div key={song.id} style={{padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px'}}>
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
      </main>

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