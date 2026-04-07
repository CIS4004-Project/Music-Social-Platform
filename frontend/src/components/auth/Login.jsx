import React, { useState, useEffect, useRef } from "react";
import textLogo from "../Logos/transparent logo.png";

const API = "http://localhost:3001";

// ---Featured Artists Carousel Cards---
const FeaturedCarousel = ({ artists }) => {
  const [current, setCurrent] = useState(0);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const timerRef = useRef(null);

  const getIndex = (offset) =>
    (current + offset + artists.length) % artists.length;

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % artists.length);
      setExpandedPlaylist(null);
    }, 2000);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [artists.length]);

  const getDisplayName = (artist) =>
    artist.firstName && artist.lastName
      ? `${artist.firstName} ${artist.lastName}`
      : artist.username;

  // ---Profile icon initials---
  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const renderCard = (offsetIndex, role) => {
    const artist = artists[getIndex(offsetIndex)];
    const isCenter = role === "center";
    const displayName = getDisplayName(artist);

    const cardStyle = {
      position: "absolute",
      left: "50%",
      width: "200px",
      transform: isCenter
        ? "translateX(-50%) scale(1)"
        : role === "left"
          ? "translateX(calc(-50% - 140px)) scale(0.75)"
          : "translateX(calc(-50% + 140px)) scale(0.75)",
      opacity: isCenter ? 1 : 0.45,
      zIndex: isCenter ? 10 : 5,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      background: "rgba(13, 0, 21, 0.85)",
      border: `1px solid ${isCenter ? "hsl(265, 100%, 65%)" : "hsl(265, 40%, 30%)"}`,
      borderRadius: "14px",
      padding: "20px 14px",
      textAlign: "center",
      pointerEvents: isCenter ? "auto" : "none",
      boxSizing: "border-box",
    };

    return (
      <div key={role} style={cardStyle}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, hsl(265, 100%, 35%), hsl(265, 100%, 55%))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "white",
            margin: "0 auto 10px",
          }}
        >
          {getInitials(displayName)}
        </div>

        <p
          style={{
            margin: "0 0 2px",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "#fff",
          }}
        >
          {displayName}
        </p>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          @{artist.username}
        </p>
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "260px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderCard(-1, "left")}
        {renderCard(0, "center")}
        {renderCard(1, "right")}
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
        const res = await fetch(`${API}/artists/featured`, {
          credentials: "include",
        });
        if (!res.ok)
            throw new Error();
        const data = await res.json();
        setFeaturedArtists(data);
      } catch {
        setArtistsError("Could not load featured artists.");
      }
      finally {
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
        <img src={textLogo} style={{ width: "250px" }} alt="AudifyLogo" />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', letterSpacing: '1px', textAlign: 'center' }}>
                A music social platform where users can come together to search for songs,
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginBottom: '30px', letterSpacing: '1px', textAlign: 'center' }}>
                build and save playlists, and discover featured artists and their curated playlists.
            </p>

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
        <section className="featured-section" style={{ marginTop: "40px" }}>
          <h2 className="featured-heading">Featured Artists</h2>
          {artistsLoading && (
            <p
              className="empty-text"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Loading artists...
            </p>
          )}
          {!artistsLoading && artistsError && (
            <p className="empty-text" style={{ color: "#ff6b6b" }}>
              {artistsError}
            </p>
          )}
          {!artistsLoading && !artistsError && featuredArtists.length === 0 && (
            <p
              className="empty-text"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              No featured artists yet.
            </p>
          )}
          {!artistsLoading && !artistsError && featuredArtists.length > 0 && (
            <FeaturedCarousel artists={featuredArtists} />
          )}
        </section>
      </div>
    </>
  );
}

export default Login;
