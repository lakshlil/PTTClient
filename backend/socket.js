const { Server } = require('socket.io');
const io = new Server({
  cors: {
    origin: '*', // For testing, allow all origins
    methods: ['GET', 'POST']
  }
});

// Socket.IO setup
function setupSocket(server) {
  io.attach(server);

  io.on('connection', (socket) => {
    console.log(`[+] User connected: ${socket.id}`);

    // Event for sending voice message
    socket.on('send_audio', (data) => {
      console.log(`Received audio from ${socket.id}`);
      // Broadcast the audio to everyone except the sender
      socket.broadcast.emit('receive_audio', data);  // This sends to everyone but the sender
      console.log(`[>] Broadcasted audio to all users except the sender`);
    });

    // Event for user disconnect
    socket.on('disconnect', () => {
      console.log(`[-] User disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
