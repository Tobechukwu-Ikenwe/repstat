import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at center, #0B1120 0%, #03040B 100%)'
    }}>
      {/* Left side: Interactive 3D Interface */}
      <div className="scene" style={{ height: '100%', borderRight: '1px solid rgba(59,130,246,0.1)' }}>
        <div className="cube">
          <div className="cube-face cube-face-front" style={{
            fontSize: '64px', fontWeight: 800, color: 'white', letterSpacing: '-2px', textShadow: '0 0 20px rgba(59,130,246,0.8)'
          }}>repstat</div>
          <div className="cube-face cube-face-right"><img src="/logo.png" alt="Logo" style={{ width: '140px', height: '140px', objectFit: 'contain' }} /></div>
          <div className="cube-face cube-face-back"><img src="/logo.png" alt="Logo" style={{ width: '140px', height: '140px', objectFit: 'contain' }} /></div>
          <div className="cube-face cube-face-left"><img src="/logo.png" alt="Logo" style={{ width: '140px', height: '140px', objectFit: 'contain' }} /></div>
          <div className="cube-face cube-face-top"><img src="/logo.png" alt="Logo" style={{ width: '140px', height: '140px', objectFit: 'contain' }} /></div>
          <div className="cube-face cube-face-bottom"><img src="/logo.png" alt="Logo" style={{ width: '140px', height: '140px', objectFit: 'contain' }} /></div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div className="glass animate-fade-in" style={{
          padding: '48px 40px',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 className="brand-font" style={{
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {isLogin ? 'Log In' : 'Create Account'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              {isLogin ? 'Welcome back to the chat platform.' : 'Join the chat platform.'}
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required={!isLogin}
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="brand-font"
              style={{
                marginTop: '12px',
                padding: '16px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'color 0.2s'
              }}
            >
              {isLogin ? 'Register' : 'Log In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
