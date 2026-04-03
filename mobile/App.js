import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import axios from 'axios';

// Ensure to update this IP to your local machine IP if testing on physical device
const API_URL = 'http://10.0.2.2:4000/api'; 
const SOCKET_URL = 'http://10.0.2.2:4000';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Chat State
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const flatListRef = useRef(null);

  // Initialize
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('chat_token');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    checkToken();
  }, []);

  // Socket Connection
  useEffect(() => {
    if (!token) return;

    fetchUser();
    fetchRooms();

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => console.log('✅ Mobile Socket Connected'));
    
    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  // Join Room
  useEffect(() => {
    if (!socket || !activeRoom) return;

    fetchMessages(activeRoom.id);
    socket.emit('join_room', { roomId: activeRoom.id });

    return () => {
      socket.emit('leave_room', { roomId: activeRoom.id });
    };
  }, [activeRoom, socket]);

  const api = axios.create({ baseURL: API_URL });
  api.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
      if (res.data.length > 0) setActiveRoom(res.data[0]);
    } catch (err) {
      console.error('Fetch rooms error', err);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const res = await api.get(`/rooms/${roomId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Fetch messages error', err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      await AsyncStorage.setItem('chat_token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('chat_token');
    setToken(null);
    setUser(null);
    setSocket(null);
  };

  const sendMessage = () => {
    if (!messageText.trim() || !socket || !activeRoom) return;
    
    socket.emit('send_message', {
      roomId: activeRoom.id,
      content: messageText,
      type: 'text'
    });
    
    setMessageText('');
  };

  // Auth View
  if (!token) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Mobile Chat</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Chat View
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>#{activeRoom?.name || 'Workspace'}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id;
          return (
            <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
              {!isMine && <Text style={styles.senderName}>{item.senderName}</Text>}
              <Text style={isMine ? styles.myMessageText : styles.theirMessageText}>{item.content}</Text>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#1a1a24' },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 16, borderRadius: 8, marginBottom: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#5e6ad2', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  logoutText: { color: '#d25e5e', fontWeight: 'bold' },
  messageList: { padding: 16, gap: 12 },
  messageBubble: { padding: 12, borderRadius: 16, maxWidth: '80%' },
  myMessage: { backgroundColor: '#5e6ad2', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
  myMessageText: { color: '#fff', fontSize: 15 },
  theirMessageText: { color: '#333', fontSize: 15 },
  senderName: { fontSize: 12, color: '#888', marginBottom: 4 },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  textInput: { flex: 1, backgroundColor: '#f4f4f8', padding: 12, borderRadius: 24, paddingHorizontal: 16 },
  sendButton: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  sendButtonText: { color: '#5e6ad2', fontWeight: 'bold' }
});
