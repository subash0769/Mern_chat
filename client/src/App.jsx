import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import UserModal from './components/UserModal';
import ChannelModal from './components/ChannelModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5010';

export default function App() {
  const { socket, isConnected } = useSocket();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mern_chat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingMap, setTypingMap] = useState(new Set());
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);

  // Active channel ref for socket callbacks
  const activeChannelRef = useRef(activeChannel);
  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  // Fetch channels list
  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/channels`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
        if (data.length > 0 && !activeChannelRef.current) {
          setActiveChannel(data[0]);
        }
      }
    } catch (err) {
      console.warn('Backend server not connected yet:', err.message);
    }
  }, []);

  // Fetch messages for active channel
  const fetchMessages = useCallback(async (channelId) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/${channelId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err.message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Handle active channel change
  useEffect(() => {
    if (!activeChannel) return;

    fetchMessages(activeChannel._id);

    if (socket && isConnected) {
      socket.emit('join_channel', activeChannel._id);
    }

    // Clear typing users on channel switch
    setTypingMap(new Set());

    return () => {
      if (socket && isConnected) {
        socket.emit('leave_channel', activeChannel._id);
      }
    };
  }, [activeChannel, socket, isConnected, fetchMessages]);

  // Socket event subscriptions
  useEffect(() => {
    if (!socket) return;

    if (currentUser) {
      socket.emit('user_online', { username: currentUser.username });
    }

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleNewMessage = (msg) => {
      if (activeChannelRef.current && msg.channel === activeChannelRef.current._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleUserTyping = ({ username, channelId }) => {
      if (activeChannelRef.current && channelId === activeChannelRef.current._id) {
        setTypingMap((prev) => new Set(prev).add(username));
      }
    };

    const handleUserStopTyping = ({ username, channelId }) => {
      if (activeChannelRef.current && channelId === activeChannelRef.current._id) {
        setTypingMap((prev) => {
          const updated = new Set(prev);
          updated.delete(username);
          return updated;
        });
      }
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, currentUser]);

  // User Login
  const handleLogin = async (username) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        localStorage.setItem('mern_chat_user', JSON.stringify(user));
        if (socket) {
          socket.emit('user_online', { username: user.username });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mern_chat_user');
    setCurrentUser(null);
  };

  // Create Channel
  const handleCreateChannel = async ({ name, description }) => {
    const res = await fetch(`${API_BASE}/api/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create channel');
    }

    const newChannel = await res.json();
    setChannels((prev) => [...prev, newChannel]);
    setActiveChannel(newChannel);
  };

  // Send Message
  const handleSendMessage = (content) => {
    if (!currentUser || !activeChannel) return;

    if (socket && isConnected) {
      socket.emit('send_message', {
        channelId: activeChannel._id,
        sender: currentUser.username,
        avatar: currentUser.avatar,
        content,
      });
    } else {
      // HTTP fallback
      fetch(`${API_BASE}/api/messages/${activeChannel._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser.username,
          avatar: currentUser.avatar,
          content,
        }),
      })
        .then((res) => res.json())
        .then((msg) => setMessages((prev) => [...prev, msg]))
        .catch(console.error);
    }
  };

  // Typing event trigger
  const handleTyping = (isTyping) => {
    if (!socket || !isConnected || !currentUser || !activeChannel) return;
    const event = isTyping ? 'typing' : 'stop_typing';
    socket.emit(event, {
      channelId: activeChannel._id,
      username: currentUser.username,
    });
  };

  return (
    <div className="app-container">
      {!currentUser && <UserModal onLogin={handleLogin} />}

      {isChannelModalOpen && (
        <ChannelModal
          onClose={() => setIsChannelModalOpen(false)}
          onCreateChannel={handleCreateChannel}
        />
      )}

      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={setActiveChannel}
        onOpenCreateChannel={() => setIsChannelModalOpen(true)}
        onlineUsers={onlineUsers}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <ChatArea
        activeChannel={activeChannel}
        messages={messages}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        typingUsers={Array.from(typingMap).filter((u) => u !== currentUser?.username)}
      />
    </div>
  );
}
