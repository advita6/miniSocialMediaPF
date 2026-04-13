const socket = io();

// DOM Elements
const myNameEl = document.getElementById('my-name');
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');

// Reply Elements
const replyBanner = document.getElementById('reply-banner');
const replyTargetText = document.getElementById('reply-target-text');
const cancelReplyBtn = document.getElementById('cancel-reply-btn');

let currentReplyToId = null;
let myIdentifier = '';

// Helper to format timestamps
function formatTime(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Socket Events
socket.on('assigned_name', (name) => {
    myIdentifier = name;
    myNameEl.textContent = name;
});

socket.on('chat_history', (messages) => {
    messagesContainer.innerHTML = '';
    messages.forEach(msg => appendMessage(msg, false));
    scrollToBottom();
});

socket.on('new_message', (msg) => {
    appendMessage(msg, true);
});

// UI Actions
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = input.value.trim();
    if (content) {
        socket.emit('send_message', { content, reply_to: currentReplyToId });
        input.value = '';
        cancelReply();
    }
});

cancelReplyBtn.addEventListener('click', () => {
    cancelReply();
});

function appendMessage(msg, animateScroll = true) {
    const isSelf = msg.user_identifier === myIdentifier;
    
    const wrapper = document.createElement('div');
    wrapper.classList.add('message', isSelf ? 'self' : 'other');
    wrapper.dataset.id = msg.id;

    const meta = document.createElement('div');
    meta.classList.add('message-meta');
    meta.innerHTML = `<span>${msg.user_identifier}</span> • <span>${formatTime(msg.timestamp)}</span>`;

    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');

    // If it's a reply, show the quote block
    if (msg.reply_to) {
        const quoteBox = document.createElement('div');
        quoteBox.classList.add('reply-quote');
        // We do a simple lookup in the DOM since we only load recent messages,
        // or we could ask server for full reply context. For simplicity, we just look in DOM.
        const referencedMsg = document.querySelector(`.message[data-id="${msg.reply_to}"]`);
        
        let quoteText = "Replying to previous message...";
        let quoteAuthor = "Someone";
        if (referencedMsg) {
            quoteAuthor = referencedMsg.querySelector('.message-meta span:first-child').textContent;
            // Original text is the last child of bubble if it has a quote
            let origBubble = referencedMsg.querySelector('.message-bubble');
            if (origBubble) {
                // Get just the text, avoiding nested quotes
                const childNodes = Array.from(origBubble.childNodes);
                const textNodes = childNodes.filter(n => n.nodeType === Node.TEXT_NODE || n.tagName === 'SPAN');
                quoteText = textNodes.map(n => n.textContent).join('').trim();
                if(quoteText.length > 50) quoteText = quoteText.substring(0, 50) + "...";
            }
        }
        
        quoteBox.innerHTML = `<div class="reply-author">${quoteAuthor}</div><div>${quoteText}</div>`;
        
        // Clicking a quote scrolls to the original message
        quoteBox.addEventListener('click', () => {
            if (referencedMsg) {
                referencedMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: add a brief highlight effect
                referencedMsg.style.transform = 'scale(1.02)';
                setTimeout(() => referencedMsg.style.transform = '', 300);
            }
        });
        bubble.appendChild(quoteBox);
    }

    // Main text
    const textSpan = document.createElement('span');
    textSpan.textContent = msg.content;
    bubble.appendChild(textSpan);

    // Reply Button
    const replyBtn = document.createElement('button');
    replyBtn.classList.add('reply-btn');
    replyBtn.innerHTML = '↩';
    replyBtn.title = 'Reply';
    replyBtn.addEventListener('click', () => {
        initiateReply(msg);
    });
    
    bubble.appendChild(replyBtn);

    wrapper.appendChild(meta);
    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);

    if (animateScroll) scrollToBottom();
}

function initiateReply(msg) {
    currentReplyToId = msg.id;
    let snippet = msg.content;
    if (snippet.length > 50) snippet = snippet.substring(0, 50) + "...";
    
    replyTargetText.textContent = `${msg.user_identifier}: ${snippet}`;
    replyBanner.classList.remove('hidden');
    input.focus();
}

function cancelReply() {
    currentReplyToId = null;
    replyBanner.classList.add('hidden');
    replyTargetText.textContent = '';
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
