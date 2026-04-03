import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, api } from '../contexts/AuthContext';
import { ArrowLeft, Link2, UserPlus, Copy, Check } from 'lucide-react';

const Invite = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('link');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    if (roomId) {
      setInviteLink(`${window.location.origin}/invite/${roomId}`);
      fetchRoomInfo();
    }
  }, [roomId]);

  const fetchRoomInfo = async () => {
    try {
      const res = await api.get(`/rooms/${roomId}`);
      setRoomInfo(res.data);
    } catch (error) {
      console.error('Failed to fetch room info:', error);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${searchQuery}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (userId) => {
    try {
      await api.post(`/rooms/${roomId}/invite`, { userId });
      setMessage('User invited successfully');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to invite user');
    }
  };

  return (
    <div className="app-container" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="glass" style={{
        padding: '24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            color: 'var(--text-secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}
        >
          <ArrowLeft size={20} />
          Back to Chat
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>
          Invite to {roomInfo?.name || 'Workspace'}
        </h1>
      </div>

      <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'link' ? 'var(--accent)' : 'var(--bg-card)',
              color: activeTab === 'link' ? 'white' : 'var(--text-primary)',
              border: activeTab === 'link' ? 'none' : '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Link2 size={18} />
            Invite Link
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'search' ? 'var(--accent)' : 'var(--bg-card)',
              color: activeTab === 'search' ? 'white' : 'var(--text-primary)',
              border: activeTab === 'search' ? 'none' : '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <UserPlus size={18} />
            Find Users
          </button>
        </div>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: message.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.includes('success') ? 'var(--success)' : 'var(--danger)'}`,
            color: message.includes('success') ? 'var(--success)' : 'var(--danger)',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            {message}
          </div>
        )}

        {activeTab === 'link' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Share Invite Link</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Share this link with people you want to invite to this workspace
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  onClick={copyInviteLink}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>How it works</h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Anyone with this link can join this workspace</li>
                <li>The link will expire after 7 days</li>
                <li>You can revoke access at any time</li>
                <li>New members will see all message history</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Find Users</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Search for users by username to invite them directly
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  onClick={searchUsers}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div>
                <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Search Results</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map(searchUser => (
                    <div
                      key={searchUser.id}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--accent), #b45ed2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {searchUser.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{searchUser.username}</div>
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {searchUser.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => inviteUser(searchUser.id)}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No users found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invite;
