import React from 'react';

export default function Sidebar({
  channels,
  activeChannel,
  onSelectChannel,
  onOpenCreateChannel,
  onlineUsers,
  currentUser,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">💬</div>
          <span className="brand-title">MERN Chat</span>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Channels Section */}
        <div>
          <div className="section-header">
            <span>Channels ({channels.length})</span>
            <button
              className="btn-icon-small"
              title="Create Channel"
              onClick={onOpenCreateChannel}
            >
              +
            </button>
          </div>
          <ul className="channel-list">
            {channels.map((ch) => (
              <li
                key={ch._id}
                className={`channel-item ${activeChannel?._id === ch._id ? 'active' : ''}`}
                onClick={() => onSelectChannel(ch)}
              >
                <span className="channel-hash">#</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ch.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Online Users Section */}
        <div>
          <div className="section-header">
            <span>Online Users ({onlineUsers.length})</span>
          </div>
          <ul className="user-list">
            {onlineUsers.map((username) => (
              <li key={username} className="user-item">
                <img
                  className="user-avatar-sm"
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`}
                  alt={username}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {username} {currentUser?.username === username && '(You)'}
                </span>
                <span className="status-dot"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User profile footer */}
      {currentUser && (
        <div className="sidebar-footer">
          <div className="current-user-info">
            <img
              className="user-avatar-sm"
              style={{ width: 32, height: 32 }}
              src={currentUser.avatar}
              alt={currentUser.username}
            />
            <div>
              <div className="current-user-name">{currentUser.username}</div>
              <div className="current-user-tag">● Online</div>
            </div>
          </div>
          <button
            className="btn-icon-small"
            title="Switch User"
            onClick={onLogout}
            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
          >
            Exit
          </button>
        </div>
      )}
    </aside>
  );
}
