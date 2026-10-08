import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages, activeChannel }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="empty-chat">
        <div style={{ fontSize: '2.5rem' }}>💬</div>
        <p style={{ fontWeight: 600 }}>Welcome to #{activeChannel?.name || 'channel'}!</p>
        <p style={{ fontSize: '0.85rem' }}>
          This is the start of the #{activeChannel?.name} channel. Send a message to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.map((msg) => (
        <div key={msg._id || Math.random()} className="message-row">
          <img
            className="message-avatar"
            src={msg.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(msg.sender)}`}
            alt={msg.sender}
          />
          <div className="message-body">
            <div className="message-meta">
              <span className="message-sender">{msg.sender}</span>
              <span className="message-time">{formatTime(msg.createdAt)}</span>
            </div>
            <div className="message-text">{msg.content}</div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
