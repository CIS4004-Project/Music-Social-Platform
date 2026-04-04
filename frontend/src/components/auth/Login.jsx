import React, { useState, useEffect } from "react";

const API = "http://localhost:3001";

// --- Artist Card Component ---
const ArtistCard = ({ artist }) => {
  const [expanded, setExpanded] = useState(null);

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
                    {pl.name} {expanded === i ? '▲' : '▼'}
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

function Login({ onLogin, onGoSignup, onGoReset }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Featured Artists State ---
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistsError, setArtistsError] = useState("");

  // --- Fetch Featured Artists ---
  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const res = await fetch(`${API}/artists/featured`, { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFeaturedArtists(data);
      } catch {
        setArtistsError("Could not load featured artists.");
      } finally {
        setArtistsLoading(false);
      }
    };
    fetchFeaturedArtists();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const normalizedUsername = username.toLowerCase();

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: normalizedUsername, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✓ Logged in!");
        setTimeout(
          () =>
            onLogin({ username: normalizedUsername, isAdmin: data.isAdmin }),
          800,
        );
      } else {
        setMessage(data.message || "Login failed.");
        setLoading(false);
      }
    } catch {
      setMessage("Could not connect to server.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-wrapper">
        <h1 className="brand-title">Audify</h1>

        <div className="auth-card">
          <h2>Welcome Back</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {message && (
            <p
              className={`message ${message.startsWith("✓") ? "success" : "error"}`}
            >
              {message}
            </p>
          )}

          <div className="auth-links">
            <button onClick={onGoSignup}>Sign Up</button>
            <button onClick={onGoReset}>Reset Password</button>
          </div>
        </div>
      
      
    {/* --- Featured Artists Section --- */}
      <section className="featured-section">
        <h2 className="featured-heading">Featured Artists</h2>
        {artistsLoading && <p className="empty-text" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading artists...</p>}
        {!artistsLoading && artistsError && (
          <p className="empty-text" style={{ color: '#ff6b6b' }}>{artistsError}</p>
        )}
        {!artistsLoading && !artistsError && featuredArtists.length === 0 && (
          <p className="empty-text" style={{ color: 'rgba(255,255,255,0.4)' }}>No featured artists yet.</p>
        )}
        {!artistsLoading && !artistsError && featuredArtists.length > 0 && (
          <div className="artists-grid">
            {featuredArtists.map((artist) => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
        )}
      </section>
    </div>
    </>
  );
}

export default Login;
