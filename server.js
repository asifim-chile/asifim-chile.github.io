const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};

io.on('connection', socket => {
    console.log(`Nuevo usuario conectado: ${socket.id}`);
    
    // Enviar la lista de usuarios actuales al nuevo usuario
    for (let id in users) {
        socket.emit('newUser', { id: id, position: users[id] });
    }

    // Añadir nuevo usuario
    users[socket.id] = { x: 0, y: 0.5, z: 0 };
    io.emit('newUser', { id: socket.id, position: users[socket.id] });

    // Manejar movimiento del usuario
    socket.on('move', data => {
        users[data.id] = data.position;
        io.emit('updatePosition', data);
    });

    // Manejar desconexión del usuario
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('userDisconnected', { id: socket.id });
        console.log(`Usuario desconectado: ${socket.id}`);
    });
});

// Servir archivos estáticos
app.use(express.static(__dirname + '/public'));

server.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});
