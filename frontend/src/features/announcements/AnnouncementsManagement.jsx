import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaBullhorn, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { announcementsApi } from './api';

const AnnouncementsManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_active: true,
        expires_at: ''
    });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await announcementsApi.getAnnouncements();
            setAnnouncements(data.results || data);
        } catch (error) {
            console.error("Error loading announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAnnouncement) {
                await announcementsApi.updateAnnouncement(editingAnnouncement.id, formData);
                alert("Annonce mise à jour !");
            } else {
                await announcementsApi.createAnnouncement(formData);
                alert("Annonce créée !");
            }
            setShowModal(false);
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', is_active: true, expires_at: '' });
            loadAnnouncements();
        } catch (error) {
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette annonce ?")) {
            try {
                await announcementsApi.deleteAnnouncement(id);
                loadAnnouncements();
            } catch (error) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    const openEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            is_active: announcement.is_active,
            expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : ''
        });
        setShowModal(true);
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Annonces</h2>
                    <p className="text-gray-500">Diffusez des messages importants aux membres</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAnnouncement(null);
                        setFormData({ title: '', content: '', is_active: true, expires_at: '' });
                        setShowModal(true);
                    }}
                    className="bg-bordeaux text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
                >
                    <FaPlus /> Nouvelle Annonce
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements.map((ann) => (
                    <motion.div
                        key={ann.id}
                        layout
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${ann.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                <FaBullhorn />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(ann)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><FaEdit /></button>
                                <button onClick={() => handleDelete(ann.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><FaTrash /></button>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{ann.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{ann.content}</p>
                        <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-50">
                            <span className={ann.is_active ? 'text-green-600 font-bold' : 'text-gray-400 font-bold'}>
                                {ann.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-gray-400">
                                {ann.expires_at ? `Expire le ${new Date(ann.expires_at).toLocaleDateString()}` : 'Pas d\'expiration'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold mb-6">{editingAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle Annonce'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Titre de l'annonce"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-bordeaux/20"
                                />
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Contenu de l'annonce..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-bordeaux/20 resize-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1">DATE D'EXPIRATION (OPTIONNEL)</label>
                                        <input
                                            type="date"
                                            value={formData.expires_at}
                                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-bordeaux/20"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-5 h-5 rounded text-bordeaux focus:ring-bordeaux/20"
                                            />
                                            <span className="font-bold text-gray-700">Annonce Active</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Annuler</button>
                                    <button type="submit" className="flex-1 py-3 bg-bordeaux text-white rounded-xl font-bold">Enregistrer</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnnouncementsManagement;
