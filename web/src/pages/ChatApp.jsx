import React, { useState, useEffect, useRef } from 'react';
import { useAuth, api } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { LogOut, Send, Hash, Settings, Search, Users, Plus, X } from 'lucide-react';

const ChatApp = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const { showNotification, playNotificationSound } = useSettings();
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch user rooms
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data);
        if (res.data.length > 0) {
          setActiveRoom(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom || !socket) return;

    // Fetch message history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/rooms/${activeRoom.id}/messages`);
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error('Failed fetching messages', err);
      }
    };

    fetchMessages();

    // Join room via socket
    socket.emit('join_room', { roomId: activeRoom.id });

    const handleReceiveMessage = (msg) => {
      if (msg.roomId === activeRoom.id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      } else {
        // Show notification for messages in other rooms
        if (msg.senderId !== user.id) {
          showNotification(
            `New message in ${msg.roomName || 'a room'}`,
            `${msg.senderName}: ${msg.content}`
          );
          playNotificationSound();
        }
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.emit('leave_room', { roomId: activeRoom.id });
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [activeRoom, socket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeRoom) return;

    socket.emit('send_message', {
      roomId: activeRoom.id,
      content: newMessage,
      type: 'text'
    });

    setNewMessage('');
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const res = await api.post('/rooms', { name: newRoomName });
      setRooms([...rooms, res.data]);
      setActiveRoom(res.data);
      setShowNewRoom(false);
      setNewRoomName('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div style={{
        width: '320px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* User Profile Area */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #b45ed2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '18px'
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{user?.username}</h3>
              <div style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }}></span>
                {isConnected ? 'Online' : 'Connecting...'}
              </div>
            </div>
          </div>
          <button onClick={logout} style={{ color: 'var(--text-secondary)' }}>
            <LogOut size={20} />
          </button>
        </div>

        {/* Room List Header */}
        <div style={{ padding: '24px 24px 12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
            Workspaces
          </h4>
          <button onClick={() => setShowNewRoom(!showNewRoom)} style={{ color: 'var(--accent)' }}>
            <Plus size={18} />
          </button>
        </div>

        {/* Create Room Form */}
        {showNewRoom && (
          <form onSubmit={handleCreateRoom} style={{ padding: '0 24px 16px', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Room Name" 
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '14px' }}
              autoFocus
            />
            <button type="submit" style={{ background: 'var(--accent)', color: 'white', padding: '0 12px', borderRadius: '8px' }}>
              Add
            </button>
          </form>
        )}

        {/* Rooms Mapping */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {rooms.map(room => (
            <div 
              key={room.id}
              onClick={() => setActiveRoom(room)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', borderRadius: '8px',
                cursor: 'pointer',
                background: activeRoom?.id === room.id ? 'var(--accent-light)' : 'transparent',
                borderLeft: activeRoom?.id === room.id ? '3px solid var(--accent)' : '3px solid transparent',
                marginBottom: '4px',
                transition: 'all 0.2s',
                color: activeRoom?.id === room.id ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <Hash size={18} />
              <span style={{ fontWeight: 500 }}>{room.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        {activeRoom ? (
          <>
            {/* Chat Topbar */}
            <div className="glass" style={{
              padding: '24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Hash size={24} color="var(--text-secondary)" />
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{activeRoom.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
                <Users 
                  size={20} 
                  cursor="pointer" 
                  onClick={() => activeRoom && navigate(`/invite/${activeRoom.id}`)}
                />
                <Search 
                  size={20} 
                  cursor="pointer" 
                  onClick={() => setShowSearch(!showSearch)}
                />
                <Settings 
                  size={20} 
                  cursor="pointer" 
                  onClick={() => navigate('/settings')}
                />
              </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="glass" style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Search size={18} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search messages in this room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(showSearch ? filteredMessages : messages).map((msg, index) => {
                const isMine = msg.senderId === user.id;
                
                // Grouping contiguous messages by same user (simple implementation)
                const currentMessages = showSearch ? filteredMessages : messages;
                const showHeader = index === 0 || currentMessages[index-1].senderId !== msg.senderId;

                return (
                  <div key={msg._id || index} style={{ 
                    display: 'flex', 
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    gap: '12px',
                    alignItems: 'flex-end',
                    marginTop: showHeader ? '12px' : '0'
                  }}>
                    {/* Avatar placeholder if not mine and showing header */}
                    {!isMine && showHeader ? (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', flexShrink: 0
                      }}>
                        {msg.senderName?.[0]?.toUpperCase()}
                      </div>
                    ) : !isMine ? <div style={{width: 32}} /> : null}

                    <div style={{ maxWidth: '65%' }}>
                      {showHeader && !isMine && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', marginLeft: '4px' }}>
                          {msg.senderName}
                        </div>
                      )}
                      
                      <div style={{
                        padding: '12px 16px',
                        background: isMine ? 'var(--accent)' : 'var(--bg-card)',
                        color: isMine ? 'white' : 'var(--text-primary)',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '15px',
                        lineHeight: '1.5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Container */}
            <div style={{ padding: '24px', background: 'var(--bg-primary)' }}>
              <form onSubmit={handleSendMessage} className="glass" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '16px',
                gap: '12px'
              }}>
                <input
                  type="text"
                  placeholder={`Message #${activeRoom.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontSize: '15px'
                  }}
                />
                <button type="submit" style={{ 
                  background: 'var(--accent)', 
                  width: '36px', height: '36px', 
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white'
                }} disabled={!newMessage.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select a workspace to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
