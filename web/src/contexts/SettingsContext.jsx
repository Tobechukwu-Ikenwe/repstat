import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');
  const [notifications, setNotifications] = useState({
    desktop: localStorage.getItem('notif_desktop') !== 'false',
    sound: localStorage.getItem('notif_sound') !== 'false',
    email: localStorage.getItem('notif_email') !== 'false'
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply font size to document
    document.body.className = `font-size-${fontSize}`;
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    // Save notification preferences
    localStorage.setItem('notif_desktop', notifications.desktop);
    localStorage.setItem('notif_sound', notifications.sound);
    localStorage.setItem('notif_email', notifications.email);
  }, [notifications]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateFontSize = (size) => {
    setFontSize(size);
  };

  const updateNotifications = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && notifications.desktop) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const showNotification = (title, body) => {
    if (notifications.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png'
      });
    }
  };

  const playNotificationSound = () => {
    if (notifications.sound) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const enableTwoFactor = async () => {
    // Mock 2FA enable - in real app, this would call backend
    setTwoFactorEnabled(true);
    return true;
  };

  const disableTwoFactor = async () => {
    // Mock 2FA disable - in real app, this would call backend
    setTwoFactorEnabled(false);
    return true;
  };

  const getActiveSessions = () => {
    // Mock active sessions - in real app, this would call backend
    return [
      {
        id: 'current',
        device: 'Chrome on Windows',
        location: 'New York, USA',
        lastActive: 'Just now',
        isCurrent: true
      },
      {
        id: 'mobile',
        device: 'Mobile App',
        location: 'Los Angeles, USA',
        lastActive: '2 hours ago',
        isCurrent: false
      }
    ];
  };

  const revokeSession = async (sessionId) => {
    // Mock session revocation - in real app, this would call backend
    return true;
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      fontSize,
      notifications,
      twoFactorEnabled,
      toggleTheme,
      updateFontSize,
      updateNotifications,
      requestNotificationPermission,
      showNotification,
      playNotificationSound,
      enableTwoFactor,
      disableTwoFactor,
      getActiveSessions,
      revokeSession
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
