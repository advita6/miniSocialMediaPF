import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiCornerDownLeft, FiSmile } from 'react-icons/fi';

const EMOJIS = [
  '😀','😂','🥰','😎','😭','🤔','😤','🥺','😴','🤩',
  '👍','👎','❤️','🔥','💯','✨','🎉','💀','👀','🙏',
  '😅','😬','🤣','😍','🥳','😇','🤯','😱','🤗','😏',
  '👏','💪','🤝','🫡','🫶','💔','💥','🌚','🌝','🍕',
  '🎮','🏆','🚀','💎','🌈','⚡','🎯','🍀','👑','🫠',
];

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [myIdentifier, setMyIdentifier] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [replyToContent, setReplyToContent] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const backendUrl = `http://${window.location.hostname}:5000`;
    const savedName = localStorage.getItem('chatIdentifier');

    const newSocket = io(backendUrl, {
      withCredentials: true,
      auth: { storedName: savedName || null },
    });
    setSocket(newSocket);

    newSocket.on('assigned_name', (name) => {
      setMyIdentifier(name);
      localStorage.setItem('chatIdentifier', name);
    });

    newSocket.on('chat_history', (history) => {
      setMessages(history);
    });

    newSocket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji) => {
    const input = inputRef.current;
    if (!input) { setInputValue(prev => prev + emoji); return; }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue = inputValue.slice(0, start) + emoji + inputValue.slice(end);
    setInputValue(newValue);
    // Restore cursor after emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    socket?.emit('send_message', { 
      content, 
      reply_to: replyToContent ? replyToContent.id : null 
    });
    
    setInputValue('');
    setReplyToContent(null);
  };

  const handleReply = (msg) => {
    setReplyToContent(msg);
    document.getElementById('chat-input')?.focus();
  };

  const cancelReply = () => {
    setReplyToContent(null);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getReplyContext = (replyToId) => {
    const origMsg = messages.find((m) => m.id === replyToId);
    if (!origMsg) return { author: 'Someone', text: 'Replying to previous message...' };
    const text = origMsg.content.length > 50 ? origMsg.content.substring(0, 50) + '...' : origMsg.content;
    return { author: origMsg.user_identifier, text };
  };

  const scrollToMessage = (id) => {
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-zinc-800');
      setTimeout(() => element.classList.remove('bg-zinc-800'), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-700/50 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Global Chat</h2>
          <p className="text-xs text-zinc-400">Anonymous Messaging</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-zinc-300">You are: {myIdentifier || 'Connecting...'}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isSelf = msg.user_identifier === myIdentifier;
          return (
            <motion.div 
              key={msg.id}
              id={`msg-${msg.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} transition-colors duration-500 rounded-xl p-1`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className={`text-xs font-semibold ${isSelf ? 'text-indigo-400' : 'text-zinc-400'}`}>
                  {isSelf ? 'You' : msg.user_identifier}
                </span>
                <span className="text-[10px] text-zinc-500">{formatTime(msg.timestamp)}</span>
              </div>
              
              <div className={`group relative max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                isSelf ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
              }`}>
                {/* Reply Quote Block */}
                {msg.reply_to && (
                  <div 
                    onClick={() => scrollToMessage(msg.reply_to)}
                    className="mb-2 cursor-pointer bg-zinc-950/30 border-l-2 border-indigo-400 rounded p-2 text-xs hover:bg-zinc-950/50 transition-colors"
                  >
                    <div className="font-semibold text-indigo-300 mb-0.5">{getReplyContext(msg.reply_to).author}</div>
                    <div className="text-zinc-300 opacity-90 line-clamp-2">{getReplyContext(msg.reply_to).text}</div>
                  </div>
                )}
                
                <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {/* Reply Button (Hover) */}
                <button
                  type="button"
                  onClick={() => handleReply(msg)}
                  className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-600 ${
                    isSelf ? '-left-10' : '-right-10'
                  }`}
                  title="Reply"
                >
                  <FiCornerDownLeft size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-zinc-800 border-t border-zinc-700 p-4">
        {/* Reply Context Banner */}
        {replyToContent && (
          <div className="mb-2 flex items-center justify-between text-xs bg-zinc-700/50 rounded-lg p-2 border border-zinc-600/50">
            <div className="flex items-center gap-2 text-zinc-300 truncate pr-4">
              <FiCornerDownLeft className="text-indigo-400 flex-shrink-0" />
              <span className="font-semibold">{replyToContent.user_identifier}:</span>
              <span className="truncate">{replyToContent.content}</span>
            </div>
            <button 
              onClick={cancelReply}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-600 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            autoComplete="off"
          />

          {/* Emoji Button */}
          <div ref={emojiPickerRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className={`p-3 rounded-xl border transition-all ${
                showEmojiPicker
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:text-white hover:border-indigo-500'
              }`}
              title="Emoji"
            >
              <FiSmile size={18} />
            </button>

            {/* Emoji Picker Panel */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-14 right-0 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 shadow-2xl w-64"
                >
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">Emojis</p>
                  <div className="grid grid-cols-10 gap-0.5">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl p-1 rounded-lg hover:bg-zinc-700 transition-colors leading-none"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all"
          >
            <span className="hidden sm:inline">Send</span>
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}
