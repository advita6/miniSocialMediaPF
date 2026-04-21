const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chat.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            reply_to INTEGER,
            user_identifier TEXT NOT NULL,
            FOREIGN KEY (reply_to) REFERENCES messages(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating messages table', err.message);
        } else {
            console.log('Messages table initialized.');
            cleanupOldMessages();
        }
    });
}

function saveMessage(content, userIdentifier, replyTo, callback) {
    const query = `INSERT INTO messages (content, user_identifier, reply_to) VALUES (?, ?, ?)`;
    db.run(query, [content, userIdentifier, replyTo || null], function (err) {
        if (err) {
            console.error('Error saving message:', err.message);
            callback(err, null);
        } else {
            getMessageById(this.lastID, callback);
        }
    });
}

function getMessageById(id, callback) {
    db.get('SELECT *, timestamp || "Z" as timestamp FROM messages WHERE id = ?', [id], (err, row) => {
        callback(err, row);
    });
}

function getRecentMessages(callback) {
    // Get messages from the last 7 days
    const query = `
        SELECT *, timestamp || "Z" as timestamp FROM messages 
        WHERE timestamp >= datetime('now', '-7 days')
        ORDER BY timestamp ASC
    `;
    db.all(query, [], (err, rows) => {
        callback(err, rows);
    });
}

function cleanupOldMessages() {
    // Delete messages older than 7 days
    const query = `DELETE FROM messages WHERE timestamp < datetime('now', '-7 days')`;
    db.run(query, function (err) {
        if (err) {
            console.error('Error cleaning up old messages:', err.message);
        } else {
            if (this.changes > 0) {
                console.log(`Cleaned up ${this.changes} ancient messages.`);
            }
        }
    });
}

// Set up an interval to clean up old messages every hour
setInterval(cleanupOldMessages, 60 * 60 * 1000);

module.exports = {
    saveMessage,
    getRecentMessages
};
