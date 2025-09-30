require('dotenv').config();
require('express-async-errors'); // handles async errors
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const messageRoutes = require('./routes/messages.routes');
const socketSetup = require('./sockets/socket');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// make io available in controllers
app.set('io', io);

socketSetup(io);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 4000;

(async () => {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
