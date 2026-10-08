import React, { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSendMessage, onTyping, activeChannel }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setText('');
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="input-container">
      <div className="input-box">
        <input
          type="text"
          className="message-input"
          placeholder={`Message #${activeChannel?.name || 'channel'}...`}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          className="send-btn"
          disabled={!text.trim()}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
