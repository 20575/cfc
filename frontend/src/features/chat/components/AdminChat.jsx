import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserAlt, FaReply, FaDonate, FaHandHoldingHeart, FaSearch, FaHistory } from 'react-icons/fa';
import { internalChatService } from '../api';
import { useAuth } from '../../../context/AuthContext';

const AdminChat = () => {
    const { user } = useAuth();
    const [discussions, setDiscussions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser.id);
        }
    }, [selectedUser]);

    const loadConversations = async () => {
        try {
            // Pour l'admin, on récupère tous les messages
            const data = await internalChatService.getMessages();
            // Grouper par utilisateur (pour simuler une liste de chat)
            const grouped = {};
            data.forEach(msg => {
                const otherUser = msg.sender === user.id ? msg.receiver_details : msg.sender_details;
                if (!otherUser) return;

                if (!grouped[otherUser.id] || new Date(msg.timestamp) > new Date(grouped[otherUser.id].lastMessage.timestamp)) {
                    grouped[otherUser.id] = {
                        user: otherUser,
                        lastMessage: msg,
                        unreadCount: (msg.receiver === user.id && !msg.is_read) ? 1 : 0
                    };
                } else if (msg.receiver === user.id && !msg.is_read) {
                    grouped[otherUser.id].unreadCount += 1;
                }
            });
            setDiscussions(Object.values(grouped).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)));
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (userId) => {
        try {
            const data = await internalChatService.getMessages();
            const filtered = data.filter(m => (m.sender === userId && m.receiver === user.id) || (m.sender === user.id && m.receiver === userId));
            setMessages(filtered);

            // Mark as read
            const unread = filtered.filter(m => m.receiver === user.id && !m.is_read);
            for (const m of unread) {
                await internalChatService.markAsRead(m.id);
            }
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const lastMsg = messages[messages.length - 1];
            await internalChatService.sendMessage({
                receiver: selectedUser.id,
                content: newMessage,
                message_type: lastMsg?.message_type || 'SUPPORT',
                donation: lastMsg?.donation || null
            });
            setNewMessage('');
            loadMessages(selectedUser.id);
        } catch (error) {
            alert("Erreur lors de l'envoi");
        }
    };

    const filteredDiscussions = discussions.filter(d =>
        d.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.user.first_name + ' ' + d.user.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Chargement des conversations...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex h-[700px] overflow-hidden">
            {/* Sidebar: Conv list */}
            <div className="w-80 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-50">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-bordeaux/20 text-sm"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredDiscussions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Aucune discussion</div>
                    ) : (
                        filteredDiscussions.map((d) => (
                            <button
                                key={d.user.id}
                                onClick={() => setSelectedUser(d.user)}
                                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-50/50 ${selectedUser?.id === d.user.id ? 'bg-indigo-50/50 border-r-4 border-r-bordeaux' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                        {d.user.profile_picture ? <img src={d.user.profile_picture} alt="" className="w-full h-full object-cover" /> : <FaUserAlt className="text-gray-400" />}
                                    </div>
                                    {d.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                            {d.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="font-bold text-sm truncate">{d.user.first_name || d.user.username} {d.user.last_name}</p>
                                    <p className="text-xs text-gray-500 truncate">{d.lastMessage.content}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50/30">
                {selectedUser ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                    {selectedUser.profile_picture ? <img src={selectedUser.profile_picture} alt="" className="w-full h-full object-cover" /> : <FaUserAlt className="text-gray-400" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{selectedUser.first_name} {selectedUser.last_name}</h3>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{selectedUser.role}</p>
                                </div>
                            </div>
                            {messages.some(m => m.donation) && (
                                <div className="flex items-center bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                                    <FaDonate className="mr-2" />
                                    Donation Issue
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${msg.sender === user.id ? 'bg-bordeaux text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                        {msg.donation && (
                                            <div className={`text-[10px] border-b pb-2 mb-2 flex items-center ${msg.sender === user.id ? 'border-white/20 text-white/80' : 'border-gray-100 text-amber-600'}`}>
                                                <FaHistory className="mr-2" />
                                                Lien avec Don #{msg.donation}
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <span className={`text-[9px] block mt-2 opacity-60 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Répondre au membre..."
                                    className="flex-1 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-bordeaux/20 text-sm transition-all"
                                />
                                <button
                                    disabled={!newMessage.trim()}
                                    className="bg-bordeaux text-white p-3.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    <FaReply />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="bg-gray-100 p-8 rounded-full mb-6">
                            <FaHandHoldingHeart className="text-6xl text-gray-200" />
                        </div>
                        <h3 className="text-xl font-bold">Sélectionnez une conversation</h3>
                        <p className="text-sm mt-2">Prêt à aider nos membres ?</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
