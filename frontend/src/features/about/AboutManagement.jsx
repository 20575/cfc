import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Edit2, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AboutManagement = () => {
    const { token, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [visionary, setVisionary] = useState(null);
    const [sections, setSections] = useState([]);
    const [activeTab, setActiveTab] = useState('visionary'); // 'visionary' or 'sections'

    // Form states
    const [visionaryForm, setVisionaryForm] = useState({
        name: '',
        title: '',
        biography: '',
        history: '',
        photo: null // File object or URL string
    });

    const [sectionForm, setSectionForm] = useState({
        type: 'HISTORY',
        title: '',
        content: '',
        image: null // File object or URL string
    });

    const [editingSectionId, setEditingSectionId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const headers = { 'Authorization': `Bearer ${token}` };

            const [visionaryRes, sectionsRes] = await Promise.all([
                fetch(`${baseUrl}/about/visionaries/`, { headers }),
                fetch(`${baseUrl}/about/sections/`, { headers })
            ]);

            if (visionaryRes.status === 401 || sectionsRes.status === 401) {
                logout();
                return;
            }

            if (visionaryRes.ok) {
                const data = await visionaryRes.json();
                const items = data.results || data;
                if (items.length > 0) {
                    setVisionary(items[0]);
                    setVisionaryForm(items[0]);
                }
            }

            if (sectionsRes.ok) {
                const data = await sectionsRes.json();
                setSections(data.results || data);
            }
        } catch (error) {
            console.error("Error fetching about data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVisionarySubmit = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const formData = new FormData();
            formData.append('name', visionaryForm.name);
            formData.append('title', visionaryForm.title);
            formData.append('biography', visionaryForm.biography);
            formData.append('history', visionaryForm.history);

            if (visionaryForm.photo instanceof File) {
                formData.append('photo', visionaryForm.photo);
            }

            const method = visionary ? 'PATCH' : 'POST';
            const url = visionary
                ? `${baseUrl}/about/visionaries/${visionary.id}/`
                : `${baseUrl}/about/visionaries/`;

            const res = await fetch(url, {
                method,
                headers,
                body: formData
            });

            if (res.ok) {
                alert('Visionnaire mis à jour avec succès');
                fetchData();
            } else {
                const errData = await res.json();
                alert(`Erreur: ${JSON.stringify(errData)}`);
            }
        } catch (error) {
            console.error("Error saving visionary:", error);
            alert("Erreur réseau");
        }
    };

    const handleSectionSubmit = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const formData = new FormData();
            formData.append('type', sectionForm.type);
            formData.append('title', sectionForm.title);
            formData.append('content', sectionForm.content);

            if (sectionForm.image instanceof File) {
                formData.append('image', sectionForm.image);
            }

            const method = editingSectionId ? 'PATCH' : 'POST';
            const url = editingSectionId
                ? `${baseUrl}/about/sections/${editingSectionId}/`
                : `${baseUrl}/about/sections/`;

            const res = await fetch(url, {
                method,
                headers,
                body: formData
            });

            if (res.ok) {
                alert('Section sauvegardée');
                setEditingSectionId(null);
                setSectionForm({ type: 'HISTORY', title: '', content: '', image: null });
                fetchData();
            } else {
                const errData = await res.json();
                console.error("Server error:", errData);
                alert(`Erreur: ${JSON.stringify(errData)}`);
            }
        } catch (error) {
            console.error("Error saving section:", error);
            alert("Une erreur est survenue lors de la sauvegarde.");
        }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm('Êtes-vous sûr ?')) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const res = await fetch(`${baseUrl}/about/sections/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error deleting section:", error);
        }
    }

    if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-bordeaux" /></div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestion de la page "À propos"</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b">
                <button
                    onClick={() => setActiveTab('visionary')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'visionary' ? 'border-b-2 border-bordeaux text-bordeaux' : 'text-gray-500'}`}
                >
                    Visionnaire
                </button>
                <button
                    onClick={() => setActiveTab('sections')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'sections' ? 'border-b-2 border-bordeaux text-bordeaux' : 'text-gray-500'}`}
                >
                    Sections (Histoire, etc.)
                </button>
            </div>

            {/* Visionary Form */}
            {activeTab === 'visionary' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-lg max-w-2xl">
                    <h2 className="text-xl font-bold mb-6">Informations du Visionnaire</h2>
                    <form onSubmit={handleVisionarySubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom Complet</label>
                            <input
                                type="text"
                                value={visionaryForm.name}
                                onChange={e => setVisionaryForm({ ...visionaryForm, name: e.target.value })}
                                className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-bordeaux focus:border-bordeaux"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Titre</label>
                            <input
                                type="text"
                                value={visionaryForm.title}
                                onChange={e => setVisionaryForm({ ...visionaryForm, title: e.target.value })}
                                className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Photo</label>
                            {visionaryForm.photo && typeof visionaryForm.photo === 'string' && (
                                <img src={visionaryForm.photo} alt="Current" className="h-24 w-24 object-cover rounded mb-2" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setVisionaryForm({ ...visionaryForm, photo: e.target.files[0] })}
                                className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Biographie</label>
                            <textarea
                                rows="5"
                                value={visionaryForm.biography}
                                onChange={e => setVisionaryForm({ ...visionaryForm, biography: e.target.value })}
                                className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Historique Personnel / Vision</label>
                            <textarea
                                rows="5"
                                value={visionaryForm.history}
                                onChange={e => setVisionaryForm({ ...visionaryForm, history: e.target.value })}
                                className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <button type="submit" className="flex items-center bg-bordeaux text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Sections Management */}
            {activeTab === 'sections' && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* List */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Sections existantes</h2>
                        {sections.map(section => (
                            <div key={section.id} className="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{section.type}</span>
                                    <h3 className="font-bold text-lg text-gray-800">{section.title}</h3>
                                    {section.image && (
                                        <img src={section.image} alt={section.title} className="h-16 w-16 object-cover rounded mt-2 mb-2" />
                                    )}
                                    <p className="text-sm text-gray-600 line-clamp-2">{section.content}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingSectionId(section.id);
                                            setSectionForm({
                                                type: section.type,
                                                title: section.title,
                                                content: section.content,
                                                image: section.image
                                            });
                                        }}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {sections.length === 0 && <p className="text-gray-500 italic">Aucune section pour le moment.</p>}
                    </motion.div>

                    {/* Form */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-xl shadow-lg h-fit sticky top-6">
                        <h2 className="text-xl font-bold mb-6">{editingSectionId ? 'Modifier la section' : 'Ajouter une section'}</h2>
                        <form onSubmit={handleSectionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type de Section</label>
                                <select
                                    value={sectionForm.type}
                                    onChange={e => setSectionForm({ ...sectionForm, type: e.target.value })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                                >
                                    <option value="HISTORY">Notre Histoire</option>
                                    <option value="WHO_WE_ARE">Qui sommes-nous</option>
                                    <option value="MISSIONS">Missions & Vision</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image d'illustration ({sectionForm.type})</label>
                                {sectionForm.image && typeof sectionForm.image === 'string' && (
                                    <img src={sectionForm.image} alt="Section" className="h-32 w-auto object-cover rounded mb-2" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setSectionForm({ ...sectionForm, image: e.target.files[0] })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Titre</label>
                                <input
                                    type="text"
                                    value={sectionForm.title}
                                    onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contenu</label>
                                <textarea
                                    rows="8"
                                    value={sectionForm.content}
                                    onChange={e => setSectionForm({ ...sectionForm, content: e.target.value })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={!editingSectionId && sections.some(s => s.type === sectionForm.type)}
                                    className={`flex items-center text-white px-4 py-2 rounded-lg flex-1 justify-center ${!editingSectionId && sections.some(s => s.type === sectionForm.type)
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-bordeaux hover:bg-opacity-90'
                                        }`}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingSectionId ? 'Mettre à jour' : 'Créer'}
                                </button>
                                {editingSectionId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingSectionId(null);
                                            setSectionForm({ type: 'HISTORY', title: '', content: '', image: null });
                                        }}
                                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AboutManagement;
