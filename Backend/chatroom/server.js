const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// List of adjectives and animal names for anonymous identity generation
const adjectives = ['Happy', 'Sneaky', 'Brave', 'Clever', 'Sleepy', 'Fierce', 'Gentle', 'Wild', 'Cosmic', 'Swift', 'Silent', 'Golden', 'Silver', 'Shadow'];
const animals = ['Fox', 'Panda', 'Tiger', 'Bear', 'Wolf', 'Owl', 'Eagle', 'Dolphin', 'Lion', 'Penguin', 'Koala', 'Falcon', 'Panther', 'Monkey'];

function generateAnonymousName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj} ${animal} ${num}`;
}

io.on('connection', (socket) => {
    // Assign a random anonymous name per user connection
    socket.userIdentifier = generateAnonymousName();
    console.log(`User connected: ${socket.userIdentifier}`);

    // Send the user their assigned name
    socket.emit('assigned_name', socket.userIdentifier);

    // Fetch and send recent chat history to the newly connected user
    db.getRecentMessages((err, messages) => {
        if (err) {
            console.error('Error fetching recent messages:', err);
            return;
        }
        socket.emit('chat_history', messages);
    });

    // Handle incoming text message
    socket.on('send_message', (data) => {
        // data should be: { content: string, reply_to: number|null }
        let content = data.content;
        const replyTo = data.reply_to;

        // Strip HTML to prevent XSS (only text and emoji allowed)
        if (typeof content !== 'string') return;
        content = content.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

        if (content.length === 0) return; // Prevent empty messages
        if (content.length > 1000) {
            content = content.substring(0, 1000); // Max length 1000 chars
        }

        db.saveMessage(content, socket.userIdentifier, replyTo, (err, savedMessage) => {
            if (err) {
                console.error('Failed to save message:', err);
                return;
            }
            // Broadcast the saved message to all clients
            io.emit('new_message', savedMessage);
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userIdentifier}`);
    });
});

server.listen(PORT, () => {
    console.log(`Chat room server running at http://localhost:${PORT}`);
});
