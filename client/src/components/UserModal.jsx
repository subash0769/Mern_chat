import React, { useState } from 'react';

export default function UserModal({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Username must be at least 2 characters long.');
      return;
    }
    setSubmitting(true);
    onLogin(trimmed);
  };

  const previewAvatar = username.trim()
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`
    : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src={previewAvatar}
            alt="Avatar Preview"
            style={{ width: 72, height: 72, borderRadius: '50%', background: '#334155', padding: 4 }}
          />
        </div>
        <h2 className="modal-title" style={{ textAlign: 'center' }}>Welcome to MERN Chat</h2>
        <p className="modal-subtitle" style={{ textAlign: 'center' }}>
          Choose a username to join the channels and start chatting.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="usernameInput">Username</label>
            <input
              id="usernameInput"
              type="text"
              className="form-input"
              placeholder="e.g. alex_dev, sarah, neo"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              maxLength={25}
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 12, padding: 12 }}
            disabled={submitting}
          >
            {submitting ? 'Entering...' : 'Join Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
