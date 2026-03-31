<main_page>
  <h1>Audify</h1>
  <h2>Welcome, [User]!</h2>
  <div id="home-content" className="hidden">
    <div id="search-section">
      <div id="search-bar">
        <input type="text" id="search" placeholder="Search for songs..." />
        <button onclick="searchMusic()">Search</button>
      </div>
      <div id="results" />
    </div>
  </div>
  <h2>Your Song Queue</h2>
  <label htmlFor="playlistname">Playlist Name:</label>
  <input type="text" id="playlistname" name="playlistname" />
  <br />
  <br />
  <div id="queue">
    <p>songs should be added below when clicking "add to playlist":</p>
  </div>
  <button>Finish Playlist</button>
  <h2>Your Playlists</h2>
  <h3>Your Liked Songs</h3>
</main_page>
