/*import React from 'react';

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

export default Home;*/
/*import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState('');


  const searchMusic = () => {
    const searchMusic = async () => {
    if (!searchTerm.trim()) return;

    try{
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=5`
      );
      const data = await res.json();

      if (data.results.length == 0){
        setSearchResults([0]);
        return;
      }

      const formattedResults = data.results.map((song, index) => ({
        id: song.trackId,
        title: song.trackName,
        artist: song.artistName})
      );
      setSearchResults(formattedResults);
    }
      catch(err){
        console.error('Could not fetch songs', err);
        setSearchResults([]);
      }

  };

  const addToQueue = (song) => {
    setQueue((prevQueue) => [...prevQueue, song]);
  };

  const deleteFromQueue = (songId) => {
    setQueue((prevQueue) => prevQueue.filter((song) => song.id !== songId));
  };

  const finishPlaylist = () => {
    if (!playlistName.trim() || queue.length === 0) return;

  const newPlaylist = {
      name: playlistName,
      songs: [...queue],
      id: playlists.length 
    };

    setPlaylists((prev) => [...prev, newPlaylist]);
    setQueue([]); // clear queue
    setPlaylistName(''); // clear input
  };
    
  return (
    
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
  );
}

export default Home;*/
import React, { useState } from 'react';
import './Home.css';

function Home({ user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState('');

  const searchMusic = () => {
    const searchMusic = async () => {
    if (!searchTerm.trim()) return;

    try{
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=5`
      );
      const data = await res.json();

      if (data.results.length === 0){
        setSearchResults([0]);
        return;
      }

      const formattedResults = data.results.map((song, index) => ({
        id: song.trackId,
        title: song.trackName,
        artist: song.artistName})
      );
      setSearchResults(formattedResults);
    }
      catch(err){
        console.error('Could not fetch songs', err);
        setSearchResults([]);
      }

    };
  };

  const addToQueue = (song) => {
    setQueue((prevQueue) => [...prevQueue, song]);
  };

  const deleteFromQueue = (songId) => {
    setQueue((prevQueue) => prevQueue.filter((song) => song.id !== songId));
  };

  const finishPlaylist = () => {
    if (!playlistName.trim() || queue.length === 0) return;

  const newPlaylist = {
      name: playlistName,
      songs: [...queue],
      id: playlists.length 
    };

    setPlaylists((prev) => [...prev, newPlaylist]);
    setQueue([]); // clear queue
    setPlaylistName(''); // clear input
  };
    

  return (
    <main>
      <h1>Audify</h1>
      <h2>Welcome, [User]!</h2>

      <div id="home-content" className="hidden">
        <div id="search-section">
          <div id="search-bar">
            <input type="text" id="search" placeholder="Search for songs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onclick={searchMusic}>Search</button>
          </div>
          {searchResults.length > 0 && (
            <ul id="results">
              {searchResults.map((song) => (
                <div key={song.id} className="song-card">
                  <img src={song.artwork} alt={song.title} />
                  <div className="song-info">
                    <p className="song-title">{song.title}</p>
                    <p className="song-artist">{song.artist}</p>
                    <audio controls src={song.preview}></audio>
                  </div>
                  <button onClick={() => addToQueue(song)}>Add to Queue</button>
                </div>
                ))
              }
            </ul>
            )
          };
        </div> 
        <h2>Your Song Queue</h2>
        <label htmlFor="playlistname">Playlist Name:</label>
        <input type="text" id="playlistname" name="playlistname" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)}/>
        <br />
        <br />
        <div id="queue">
        {queue.length > 0 ? (
              <ul>
                {queue.map((song) => (
                  <li key={song.id}>{song.title} by {song.artist} <button onClick={() => deleteFromQueue(song.id)}>Delete</button> </li>
                ))}
              </ul>
            ) : (
              <p>Your queue is empty.</p>
            )}
        </div>
        <button onClick={finishPlaylist} >Finish Playlist</button>
        <h2>Your Playlists</h2>
        {playlists.map((pl)=>
          <div key={pl.id} className="playlist">
            <h3>{pl.name}</h3>
            <ul>
              {pl.songs.map((song) => (
                <li key={song.id}>
                  {song.title} by {song.artist}
                </li>
              )
              )}
            </ul>
          </div>
          )

        }
      </div>
    </main>
  );
    
}//end home
export default Home;
