import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import chalk from 'chalk';
import dayjs from 'dayjs';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const log = (msg) => {
  console.log(chalk.cyan(`[${dayjs().format('HH:mm:ss')}]`), msg);
};

io.on('connection', (socket) => {
  log(chalk.green(`+ Connected: ${socket.id}`));

  socket.on('send_audio', (data) => {
    log(chalk.yellow(`> Audio received from ${socket.id}`));
    io.emit('receive_audio', data); // Contains audioBase64 + senderId
  });

  socket.on('disconnect', () => {
    log(chalk.red(`- Disconnected: ${socket.id}`));
  });
});

server.listen(3000, () => {
  log(chalk.green('✅ Server running at http://localhost:3000'));
});
