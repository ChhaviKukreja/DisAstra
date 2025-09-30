// Basic Socket.IO wiring
module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('socket connected', socket.id);

        // client should emit: socket.emit('identify', { userId, token })
        socket.on('identify', ({ userId }) => {
            if (!userId) return;
            // join a room by user id so we can address online users by their user id
            socket.join(String(userId));
            console.log(`socket ${socket.id} joined room ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('socket disconnected', socket.id);
        });
    });
};
