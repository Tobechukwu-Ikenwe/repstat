import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { ArrowLeft, User, Bell, Shield, Palette, Monitor, Smartphone, Mail, Trash2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const {
    theme,
    fontSize,
    notifications,
    twoFactorEnabled,
    toggleTheme,
    updateFontSize,
    updateNotifications,
    requestNotificationPermission,
    enableTwoFactor,
    disableTwoFactor,
    getActiveSessions,
    revokeSession
  } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    if (activeTab === 'security') {
      setActiveSessions(getActiveSessions());
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage('New passwords do not match');
        return;
      }

      await updateProfile(formData);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

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
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 89px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '240px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          padding: '24px 0'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeTab === tab.id ? 'var(--accent-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Profile Information</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Change Password</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                {message && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: message.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.includes('success') ? 'var(--success)' : 'var(--danger)'}`,
                    color: message.includes('success') ? 'var(--success)' : 'var(--danger)',
                    fontSize: '14px'
                  }}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Notification Preferences</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifications.desktop}
                    onChange={async (e) => {
                      updateNotifications('desktop', e.target.checked);
                      if (e.target.checked) {
                        const granted = await requestNotificationPermission();
                        if (!granted) {
                          setMessage('Desktop notifications are blocked in your browser');
                        }
                      }
                    }}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>Enable desktop notifications</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Get notified about new messages</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifications.sound}
                    onChange={(e) => updateNotifications('sound', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>Sound notifications</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Play sound for new messages</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => updateNotifications('email', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>Email notifications</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Receive email for mentions</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Security Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Two-Factor Authentication</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                    {twoFactorEnabled ? '2FA is enabled for your account' : 'Add an extra layer of security to your account'}
                  </p>
                  <button
                    onClick={async () => {
                      if (twoFactorEnabled) {
                        await disableTwoFactor();
                        setMessage('2FA disabled successfully');
                      } else {
                        await enableTwoFactor();
                        setMessage('2FA enabled successfully');
                      }
                    }}
                    style={{ padding: '8px 16px', background: twoFactorEnabled ? 'var(--danger)' : 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px' }}
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Active Sessions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeSessions.map(session => (
                      <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {session.device.includes('Mobile') ? <Smartphone size={16} /> : <Monitor size={16} />}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '14px' }}>
                              {session.device} {session.isCurrent && '(Current)'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {session.location} • {session.lastActive}
                            </div>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <button
                            onClick={async () => {
                              await revokeSession(session.id);
                              setActiveSessions(prev => prev.filter(s => s.id !== session.id));
                              setMessage('Session revoked successfully');
                            }}
                            style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Appearance</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Theme</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={toggleTheme}
                      style={{
                        padding: '12px 24px',
                        background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-card)',
                        color: theme === 'dark' ? 'white' : 'var(--text-primary)',
                        border: theme === 'dark' ? 'none' : '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      🌙 Dark
                    </button>
                    <button
                      onClick={toggleTheme}
                      style={{
                        padding: '12px 24px',
                        background: theme === 'light' ? 'var(--accent)' : 'var(--bg-card)',
                        color: theme === 'light' ? 'white' : 'var(--text-primary)',
                        border: theme === 'light' ? 'none' : '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      ☀️ Light
                    </button>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Font Size</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['small', 'medium', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => updateFontSize(size)}
                        style={{
                          padding: '12px 24px',
                          background: fontSize === size ? 'var(--accent)' : 'var(--bg-card)',
                          color: fontSize === size ? 'white' : 'var(--text-primary)',
                          border: fontSize === size ? 'none' : '1px solid var(--border)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
