import React, { useState } from "react";
import textLogo from "../Logos/transparent logo.png";

const API = "http://localhost:3001";

function ResetPassword({ onGoLogin }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — verify username + email
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/auth/verify-identity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✓ Identity verified!");
        setStep(2);
      } else {
        setMessage(data.message || "Username and email do not match.");
      }
    } catch {
      setMessage("Could not connect to server.");
    }
    setLoading(false);
  };

  // Step 2 — set new password
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✓ Password reset! Redirecting to login...");
        setTimeout(() => onGoLogin(), 2000);
      } else {
        setMessage(data.message || "Reset failed.");
      }
    } catch {
      setMessage("Could not connect to server.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <img src={textLogo} style={{ width: "250px" }} alt="AudifyLogo" />
      <div className="auth-card">
        <h2>{step === 1 ? "Reset Password" : "New Password"}</h2>

        {step === 1 ? (
          <form onSubmit={handleVerify}>
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
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify Identity"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <p
            className={`message ${message.startsWith("✓") ? "success" : "error"}`}
          >
            {message}
          </p>
        )}

        <div className="auth-links">
          <button onClick={onGoLogin}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
