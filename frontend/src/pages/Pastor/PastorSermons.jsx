import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    FileText,
    XCircle,
    CheckCircle,
    Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Separate Modal Component
const SermonFormModal = ({ sermon, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: sermon?.title || '',
        description: sermon?.description || '',
        category: sermon?.category || 'SUNDAY_SERVICE',
        youtube_url: sermon?.youtube_url || '',
        is_published: sermon?.is_published ?? true
    });
    const [coverImage, setCoverImage] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (coverImage) data.append('cover_image', coverImage);
        if (pdfFile) data.append('pdf_file', pdfFile);
        onSave(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{sermon ? 'Modifier le Sermon' : 'Nouveau Sermon'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Titre</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none h-32 dark:text-white" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Catégorie</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none dark:text-white">
                                <option value="SUNDAY_SERVICE">Culte Dimanche</option>
                                <option value="PREACHING">Prédication</option>
                                <option value="TEACHING">Enseignement</option>
                                <option value="EXHORTATION">Exhortation</option>
                                <option value="MEDITATION">Méditation</option>
                                <option value="BIBLE_STUDY">Étude Biblique</option>
                                <option value="YOUTH">Jeunesse</option>
                                <option value="CONFERENCE">Conférence</option>
                                <option value="WORSHIP">Louange</option>
                                <option value="OTHER">Autre</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Lien YouTube</label>
                            <input type="url" value={formData.youtube_url} onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none dark:text-white" placeholder="https://youtube.com/..." />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Image de couverture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverImage(e.target.files[0])}
                                className="w-full text-sm block file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Fichier PDF</label>
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => setPdfFile(e.target.files[0])}
                                className="w-full text-sm block file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold transition-colors">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Enregistrer</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const PastorSermons = () => {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editingSermon, setEditingSermon] = useState(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${baseUrl}/sermons/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSermons(data.results || (Array.isArray(data) ? data : []));
        } catch (error) {
            console.error('Error fetching sermons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        const token = localStorage.getItem('access_token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        const url = editingSermon
            ? `${baseUrl}/sermons/${editingSermon.id}/`
            : `${baseUrl}/sermons/`;

        try {
            const response = await fetch(url, {
                method: editingSermon ? 'PATCH' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setShowModal(false);
                setEditingSermon(null);
                fetchSermons();
            } else {
                const data = await response.json();
                alert(JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error saving sermon:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Voulez-vous vraiment supprimer ce sermon ?')) return;
        try {
            const token = localStorage.getItem('access_token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${baseUrl}/sermons/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchSermons();
            }
        } catch (error) {
            console.error('Error deleting sermon:', error);
        }
    };

    const categories = ['ALL', ...new Set(sermons.map(s => s.category).filter(Boolean))];

    const filteredSermons = sermons.filter(sermon => {
        const matchesSearch = (sermon.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || sermon.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <AnimatePresence>
                {showModal && (
                    <SermonFormModal
                        sermon={editingSermon}
                        onSave={handleSave}
                        onClose={() => { setShowModal(false); setEditingSermon(null); }}
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Sermons</h1>
                    <p className="text-gray-500 dark:text-gray-400">Publiez et gérez vos enseignements</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm w-full sm:w-48 focus:ring-2 focus:ring-indigo-500 shadow-sm dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm dark:text-white"
                            >
                                <option value="ALL">Catégories</option>
                                {categories.filter(c => c !== 'ALL').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <Filter className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouveau Sermon</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSermons.length > 0 ? (
                    filteredSermons.map(sermon => (
                        <motion.div
                            key={sermon.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700 group hover:shadow-xl transition-all h-full flex flex-col"
                        >
                            <div className="h-48 bg-gray-200 dark:bg-slate-900 relative overflow-hidden shrink-0">
                                {sermon.cover_image ? (
                                    <img src={sermon.cover_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                ) : (
                                    <div className="flex items-center justify-center h-full"><BookOpen className="w-12 h-12 text-gray-400" /></div>
                                )}
                                {isAdmin && (
                                    <div className="absolute top-4 right-4 flex space-x-2">
                                        <button
                                            onClick={() => { setEditingSermon(sermon); setShowModal(true); }}
                                            className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sermon.id)}
                                            className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full w-fit">{sermon.category}</span>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mt-4 line-clamp-1">{sermon.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 flex-1">{sermon.description}</p>
                                <div className="flex items-center space-x-4 mt-6 text-xs text-gray-400 pt-4 border-t border-gray-50 dark:border-slate-700">
                                    {sermon.pdf_file && <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> PDF</span>}
                                    {sermon.youtube_url && <span className="flex items-center"><XCircle className="w-3 h-3 mr-1 text-red-500" /> Vidéo</span>}
                                    <span className="flex-1 text-right">{new Date(sermon.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700">
                        <BookOpen className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Aucun sermon trouvé.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastorSermons;
