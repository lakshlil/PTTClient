// src/Socket.js
import { Platform } from 'react-native';
import io from 'socket.io-client';

// Replace with your server URL
const socket = io('http://192.168.1.8:3000'); // Your backend server

export default socket;
