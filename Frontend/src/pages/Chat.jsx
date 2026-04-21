import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiCornerDownLeft, FiSmile } from 'react-icons/fi';
import API_BASE from '../api';

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
  const [locationAccessed, setLocationAccessed] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    // --- Location Access Permission ---
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationAccessed(true),
        () => console.log("Location access denied, using browser time.")
      );
    }

    const backendUrl = API_BASE || `http://${window.location.hostname}:5000`;
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
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    socket?.emit('send_message', { 
      content, 
      reply_to: replyToContent ? replyToContent.id : null 
    });
    
    setInputValue('');
    setReplyToContent(null);
  };

  // Mobile Enter Key Handler
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // For mobile keyboards, this ensures the message is sent
      handleSendMessage(e);
    }
  };

  const handleReply = (msg) => {
    setReplyToContent(msg);
    document.getElementById('chat-input')?.focus();
  };

  const cancelReply = () => {
    setReplyToContent(null);
  };

  // --- Fixed Dynamic Timezone Implementation ---
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      // Browser automatically uses local timezone if no 'timeZone' option is specified
      // Since we appended 'Z' in backend, it's correctly treated as UTC
      return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      return '...';
    }
  };

  const getReplyContext = (replyToId) => {
    const origMsg = messages.find((m) => m.id === replyToId);
    if (!origMsg) return { author: 'Someone', text: 'Replying...' };
    const text = origMsg.content.length > 50 ? origMsg.content.substring(0, 50) + '...' : origMsg.content;
    return { author: origMsg.user_identifier, text };
  };

  const scrollToMessage = (id) => {
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-white/10');
      setTimeout(() => element.classList.remove('bg-white/10'), 1000);
    }
  };

  return (
    <div className="app-container h-screen flex flex-col overflow-hidden">
      <div className="liquid-bg-wrapper opacity-40 fixed inset-0 z-0">
        <div className="liquid-bg-image" />
        <div className="liquid-overlay" />
      </div>

      <div className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto flex flex-col glass-obsidian sm:rounded-[3rem] shadow-3xl border-white/5 overflow-hidden sm:my-4">
        
        {/* Immersive Header */}
        <div className="p-6 sm:p-10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 bg-black/40 backdrop-blur-3xl">
          <div>
            <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter font-chaotic uppercase leading-none">
              THE <span className="amber-text">VOID.</span>
            </h2>
            <p className="text-[10px] text-zinc-500 font-black tracking-[0.4em] uppercase mt-2">
              Encrypted Gossip Stream // {locationAccessed ? "Location Verified" : "Syncing Time..."}
            </p>
          </div>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/5 mt-4 sm:mt-0 shadow-inner"
          >
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Active Alias</span>
              <span className="text-white font-black text-xs uppercase tracking-tight">{myIdentifier || 'SYNCING...'}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(255,140,0,0.8)]"></div>
          </motion.div>
        </div>

        {/* Dynamic Messages Feed */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 space-y-8 obsidian-scrollbar relative">
          <div className="text-center pb-12">
            <p className="text-[9px] text-zinc-700 font-black tracking-[0.6em] uppercase">--- TRANSMISSION INJECTED ---</p>
          </div>

          {messages.map((msg) => {
            const isSelf = msg.user_identifier === myIdentifier;
            return (
              <motion.div 
                key={msg.id}
                id={`msg-${msg.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group`}
              >
                <div className={`flex items-center gap-3 mb-2 px-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-[10px] font-black tracking-widest uppercase ${isSelf ? 'text-amber-500' : 'text-zinc-500'}`}>
                    {isSelf ? 'YOU' : msg.user_identifier}
                  </span>
                  <span className="text-[9px] text-zinc-700 font-black">{formatTime(msg.timestamp)}</span>
                </div>
                
                <div className={`relative max-w-[85%] sm:max-w-[70%] rounded-3xl px-6 py-4 shadow-3xl border transition-all duration-300 ${
                  isSelf 
                    ? 'bg-white text-black border-white rounded-tr-none' 
                    : 'bg-zinc-900 text-zinc-100 border-white/5 rounded-tl-none hover:border-amber-500/30'
                }`}>
                  {msg.reply_to && (
                    <div 
                      onClick={() => scrollToMessage(msg.reply_to)}
                      className={`mb-3 cursor-pointer border-l-2 p-3 rounded-2xl text-[11px] font-medium leading-snug ${
                        isSelf ? 'bg-black/5 border-black/20 text-black/60' : 'bg-white/5 border-amber-500 text-zinc-500'
                      }`}
                    >
                      <div className={`font-black uppercase tracking-tighter mb-1 ${isSelf ? 'text-black' : 'text-amber-500'}`}>
                        {getReplyContext(msg.reply_to).author}
                      </div>
                      <div className="line-clamp-2 italic">"{getReplyContext(msg.reply_to).text}"</div>
                    </div>
                  )}
                  
                  <p className="text-[14px] sm:text-[15px] leading-relaxed font-bold break-words whitespace-pre-wrap">{msg.content}</p>
                  
                  <button
                    type="button"
                    onClick={() => handleReply(msg)}
                    className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2.5 rounded-full border shadow-2xl bg-black text-white border-white/10 hover:bg-amber-500 hover:text-black ${
                      isSelf ? '-left-14' : '-right-14'
                    }`}
                  >
                    <FiCornerDownLeft size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Control Center */}
        <div className="p-4 sm:p-10 bg-black/60 border-t border-white/5 backdrop-blur-3xl pb-24 sm:pb-10">
          <AnimatePresence>
            {replyToContent && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 flex items-center justify-between text-[11px] bg-white/5 rounded-3xl p-5 border border-white/10"
              >
                <div className="flex items-center gap-3 text-zinc-400 truncate pr-6">
                  <FiCornerDownLeft className="text-amber-500 flex-shrink-0" />
                  <span className="font-black uppercase text-amber-500 tracking-tighter">{replyToContent.user_identifier}:</span>
                  <span className="truncate italic">"{replyToContent.content}"</span>
                </div>
                <button onClick={cancelReply} className="text-zinc-500 hover:text-white p-2">
                  <FiX size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSendMessage} className="flex gap-4 relative">
            <div className="flex-1 relative">
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="UNFILTERED CHAOS..."
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl sm:rounded-3xl px-6 py-4 pr-14 focus:outline-none focus:border-amber-500 transition-all text-[14px] sm:text-[15px] font-black tracking-tight text-white placeholder-zinc-800"
                autoComplete="off"
              />
              <div ref={emojiPickerRef} className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  className={`p-2 rounded-xl transition-all ${
                    showEmojiPicker ? 'text-amber-500 scale-125' : 'text-zinc-700 hover:text-zinc-400'
                  }`}
                >
                  <FiSmile size={26} />
                </button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="absolute bottom-16 right-0 z-50 glass-obsidian border border-white/10 rounded-[2rem] p-5 shadow-[0_30px_100px_rgba(0,0,0,1)] w-80 sm:w-96"
                    >
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-4">Encryption Keys</p>
                      <div className="grid grid-cols-8 gap-2">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-2xl p-2 rounded-2xl hover:bg-white/10 transition-all hover:scale-125"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-white hover:bg-amber-500 text-black disabled:bg-zinc-900 disabled:text-zinc-700 rounded-2xl sm:rounded-3xl px-8 sm:px-12 py-4 font-black text-xs uppercase tracking-widest transition-all shadow-2xl"
            >
              INJECT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
