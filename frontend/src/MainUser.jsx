import React, { useState } from 'react';

const main_page = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);

  const searchMusic = () => {
    console.log('Search');

  };

  return (
    <main>
    <h1>Audify</h1>
    <h2>Welcome, [User]!</h2>

    <div id="home-content" className="hidden">
      <div id="search-section">
        <div id="search-bar">
          <input type="text" id="search" placeholder="Search for songs..."/>
          <button onclick={searchMusic}>Search</button>
        </div>
        <div id="results" />
        {searchResults.length > 0 && (
          <ul>
            {searchResults.map((song) => (
              <li key={song.id}>{song.title} by {song.artist}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  <h2>Your Song Queue</h2>
  <label htmlFor="playlistname">Playlist Name:</label>
  <input type="text" id="playlistname" name="playlistname" />
  <br />
  <br />
  <div id="queue">
    {queue.length > 0 ? (
      <ul>
        {queue.map((song) => (
          <li key={song.id}>{song.title} by {song.artist}</li>
        ))}
      </ul>
    ) : (
      <p>Your queue is empty.</p>
    )}
  </div>
  <button>Finish Playlist</button>
  <h2>Your Playlists</h2>
  <h3>Your Liked Songs</h3>
</main>);
};

export default MainUser;
