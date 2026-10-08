import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatArea({
  activeChannel,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
}) {
  if (!activeChannel) {
    return (
      <main className="chat-main" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Select or create a channel to begin.</p>
      </main>
    );
  }

  // Filter typing users for this channel
  const typingText = typingUsers.length > 0
    ? `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
    : '';

  return (
    <main className="chat-main">
      <header className="chat-header">
        <div className="chat-header-title">
          <h2>#{activeChannel.name}</h2>
          {activeChannel.description && (
            <span className="channel-desc">— {activeChannel.description}</span>
          )}
        </div>
        <span className="chat-badge">Real-time Sync</span>
      </header>

      <MessageList messages={messages} activeChannel={activeChannel} />

      <div className="typing-bar">
        {typingText}
      </div>

      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        activeChannel={activeChannel}
      />
    </main>
  );
}
