import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeadset, FaPaperPlane, FaTimes, FaUserAlt } from 'react-icons/fa';
import { internalChatService } from '../api';
import { useAuth } from '../../../context/AuthContext';

const SupportChat = ({ initialMessage, donationId, isOpen, onClose, onUnreadChange }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState(initialMessage || '');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Effet pour le polling global (compteur de non lus)
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const data = await internalChatService.getUnreadMessages();
                const unreadCount = (data.results || data).filter(m => m.receiver === user.id).length;
                if (onUnreadChange) onUnreadChange(unreadCount);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 15000); // Poll every 15s for badge
        return () => clearInterval(interval);
    }, [user, onUnreadChange]);

    useEffect(() => {
        if (isOpen) {
            loadMessages();
            const interval = setInterval(loadMessages, 10000); // Poll every 10s if open
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async () => {
        try {
            const data = await internalChatService.getMessages({
                type: donationId ? 'DONATION_ISSUE' : 'SUPPORT',
                donation: donationId
            });
            const allMessages = data.results || data;
            setMessages(allMessages);

            // Mark as read if chat is open
            if (isOpen) {
                const unread = allMessages.filter(m => m.receiver === user.id && !m.is_read);
                for (const m of unread) {
                    await internalChatService.markAsRead(m.id);
                }
                if (unread.length > 0 && onUnreadChange) {
                    // Refresh unread count
                    const unreadData = await internalChatService.getUnreadMessages();
                    onUnreadChange((unreadData.results || unreadData).filter(msg => msg.receiver === user.id).length);
                }
            }
        } catch (error) {
            console.error("Error loading chat:", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await internalChatService.sendMessage({
                receiver: 1, // Supposons que l'ID de l'admin est 1 ou on peut le chercher dynamiquement
                content: newMessage,
                message_type: donationId ? 'DONATION_ISSUE' : 'SUPPORT',
                donation: donationId
            });
            setNewMessage('');
            loadMessages();
        } catch (error) {
            alert("Erreur lors de l'envoi du message");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-20 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
            >
                {/* Header */}
                <div className="bg-bordeaux p-4 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <FaHeadset className="text-xl" />
                        </div>
                        <div>
                            <h3 className="font-bold">Support Admin</h3>
                            <p className="text-xs opacity-80">En ligne pour vous aider</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-sm">Pas de messages encore. Comment pouvons-nous vous aider ?</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === user.id
                                    ? 'bg-bordeaux text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                    }`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 opacity-60 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-bordeaux/20 outline-none text-sm transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        className="bg-bordeaux text-white p-2.5 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default SupportChat;
