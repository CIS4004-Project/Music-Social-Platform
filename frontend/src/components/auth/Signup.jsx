import React, { useState } from 'react';
import textLogo from '../Logos/transparent logo.png';

const API = 'http://localhost:3001';

function Signup({ onSignup, onGoLogin }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if(form.username.includes(' ')) {
        setMessage('Your username cannot contain spaces.')
        return;
}

    const normalizedUsername = form.username.toLowerCase();

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          username: normalizedUsername,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✓ Account created! Redirecting to login...');
        setTimeout(() => onSignup(), 1500);
      } else {
        setMessage(data.message || 'Signup failed.');
        setLoading(false);
      }
    } catch {
      setMessage('Could not connect to server.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-wrapper">
        <img id="homeLogo" src={textLogo} alt="AudifyLogo"/>

        <div className="auth-card">
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Retype Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {message && (
            <p className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}

          <div className="auth-links">
            <button onClick={onGoLogin}>Sign In</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
