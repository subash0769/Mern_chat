import React, { useState } from 'react';

export default function ChannelModal({ onClose, onCreateChannel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanName || cleanName.length < 2) {
      setError('Channel name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onCreateChannel({ name: cleanName, description: description.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create channel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Create a channel</h2>
        <p className="modal-subtitle">
          Channels are where your team communicates on a topic.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="channelName">Channel Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }}>#</span>
              <input
                id="channelName"
                type="text"
                className="form-input"
                style={{ paddingLeft: 28 }}
                placeholder="e.g. devops, design-review"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                maxLength={30}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="channelDesc">Description (optional)</label>
            <input
              id="channelDesc"
              type="text"
              className="form-input"
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={120}
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: 12 }}>{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
