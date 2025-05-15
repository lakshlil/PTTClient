import { useState, useEffect } from 'react';
import socket from '../Socket'; // Make sure this path is correct

const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setSocketId(socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return { isConnected, socketId };
};

export default useSocket;
