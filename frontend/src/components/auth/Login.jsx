import React, { useState } from "react";

const API = "http://localhost:3001";

function Login({ onLogin, onGoSignup, onGoReset }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      </div>
    </>
  );
}

export default Login;
