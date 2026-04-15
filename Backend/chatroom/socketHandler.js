const db = require('./database');

// List of adjectives and animal names for anonymous identity generation
const adjectives = ['Happy', 'Sneaky', 'Brave', 'Clever', 'Sleepy', 'Fierce', 'Gentle', 'Wild', 'Cosmic', 'Swift', 'Silent', 'Golden', 'Silver', 'Shadow'];
const animals = ['Fox', 'Panda', 'Tiger', 'Bear', 'Wolf', 'Owl', 'Eagle', 'Dolphin', 'Lion', 'Penguin', 'Koala', 'Falcon', 'Panther', 'Monkey'];

function generateAnonymousName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj} ${animal} ${num}`;
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        // Re-use stored name from client if available, otherwise assign a new one
        const storedName = socket.handshake.auth?.storedName;
        socket.userIdentifier = (storedName && storedName.trim().length > 0)
            ? storedName
            : generateAnonymousName();

        console.log(`User connected to chatroom: ${socket.userIdentifier}`);

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

            if (typeof content !== 'string') return;
            // Strip HTML to prevent XSS (only text and emoji allowed)
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
            console.log(`User disconnected from chatroom: ${socket.userIdentifier}`);
        });
    });
};
