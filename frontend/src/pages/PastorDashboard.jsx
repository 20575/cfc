import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    BarChart,
    MessageSquare,
    BookOpen,
    Heart,
    FileText,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    X,
    Search,
    Plus,
    Edit,
    Trash2,
    ChevronRight,
    MoreVertical,
    Filter,
    User,
    Lock,
    Camera,
    MapPin,
    Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PastorDashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('prayers');
    const [prayers, setPrayers] = useState([]);
    const [sermons, setSermons] = useState([]);
    const [donations, setDonations] = useState([]);
    const [rhemas, setRhemas] = useState([]);
    const [availabilities, setAvailabilities] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ prayersCount: 0, totalDonations: 0, pendingAppointments: 0 });

    // Modal states
    const [showSermonModal, setShowSermonModal] = useState(false);
    const [showRhemaModal, setShowRhemaModal] = useState(false);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const [prayersRes, sermonsRes, donationsRes, rhemasRes, availabilitiesRes, appointmentsRes] = await Promise.all([
                fetch(`${baseUrl}/prayers/`, { headers }),
                fetch(`${baseUrl}/sermons/`, { headers }),
                fetch(`${baseUrl}/donations/`, { headers }),
                fetch(`${baseUrl}/rhema/`, { headers }),
                fetch(`${baseUrl}/appointments/availabilities/`, { headers }),
                fetch(`${baseUrl}/appointments/`, { headers })
            ]);

            const [pData, sData, dData, rData, vData, aData] = await Promise.all([
                prayersRes.json(), sermonsRes.json(), donationsRes.json(),
                rhemasRes.json(), availabilitiesRes.json(), appointmentsRes.json()
            ]);

            // Handle paginated responses (DRF PageNumberPagination)
            const pArr = pData.results || (Array.isArray(pData) ? pData : []);
            const sArr = sData.results || (Array.isArray(sData) ? sData : []);
            const dArr = dData.results || (Array.isArray(dData) ? dData : []);
            const rArr = rData.results || (Array.isArray(rData) ? rData : []);
            const vArr = vData.results || (Array.isArray(vData) ? vData : []);
            const aArr = aData.results || (Array.isArray(aData) ? aData : []);

            setPrayers(pArr);
            setSermons(sArr);
            setDonations(dArr);
            setRhemas(rArr);
            setAvailabilities(vArr);
            setAppointments(aArr);

            // Calculate stats
            setStats({
                prayersCount: pArr.length,
                totalDonations: dArr.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0),
                pendingAppointments: aArr.filter(a => a.status === 'PENDING').length
            });

        } catch (error) {
            console.error('Error fetching pastor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (type, id, newStatus, extraData = {}) => {
        const endpoint = type === 'prayer' ? `prayers/${id}/` : `appointments/${id}/`;
        const body = { status: newStatus, ...extraData };

        try {
            const token = localStorage.getItem('access_token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${baseUrl}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error(`Error updating ${type}:`, error);
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('Voulez-vous vraiment supprimer cet élément ?')) return;

        let endpoint = '';
        if (type === 'sermon') endpoint = `sermons/${id}/`;
        else if (type === 'rhema') endpoint = `rhema/${id}/`;
        else if (type === 'availability') endpoint = `appointments/availabilities/${id}/`;

        try {
            const token = localStorage.getItem('access_token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${baseUrl}/${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    const handleSaveSermon = async (formData) => {
        const token = localStorage.getItem('access_token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        const url = editingItem
            ? `${baseUrl}/sermons/${editingItem.id}/`
            : `${baseUrl}/sermons/`;

        // Client-side quick check for image
        const coverFile = formData.get('cover_image');
        if (coverFile && coverFile instanceof File && !coverFile.type.startsWith('image/')) {
            alert('Le fichier de couverture doit être une image valide.');
            return;
        }

        try {
            const response = await fetch(url, {
                method: editingItem ? 'PATCH' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData // Use FormData for file uploads
            });

            const data = await response.json();

            if (response.ok) {
                setShowSermonModal(false);
                setEditingItem(null);
                fetchData();
                alert(editingItem ? 'Sermon modifié avec succès !' : 'Nouveau sermon publié avec succès !');
            } else {
                console.error('Server error:', data);
                // Try to extract a friendly message if it's a validation error
                let msg = 'Erreur lors de l\'enregistrement';
                if (data.error && data.error.details) {
                    const details = data.error.details;
                    if (details.cover_image) msg = `Image : ${details.cover_image[0]}`;
                    else if (details.pdf_file) msg = `PDF : ${details.pdf_file[0]}`;
                    else msg = JSON.stringify(details);
                } else if (data.message) {
                    msg = data.message;
                }
                alert(msg);
            }
        } catch (error) {
            console.error('Error saving sermon:', error);
            alert('Une erreur réseau est survenue lors de la publication du sermon.');
        }
    };

    const handleSaveRhema = async (data) => {
        const token = localStorage.getItem('access_token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        const url = editingItem
            ? `${baseUrl}/rhema/${editingItem.id}/`
            : `${baseUrl}/rhema/`;

        try {
            const response = await fetch(url, {
                method: editingItem ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setShowRhemaModal(false);
                setEditingItem(null);
                fetchData();
                alert(editingItem ? 'Rhema modifié !' : 'Nouveau Rhema publié !');
            } else {
                const errorData = await response.json();
                alert(`Erreur Rhema : ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error saving rhema:', error);
            alert('Erreur réseau lors de la publication du Rhema.');
        }
    };

    const handleSaveAvailability = async (data) => {
        const token = localStorage.getItem('access_token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        const url = editingItem
            ? `${baseUrl}/appointments/availabilities/${editingItem.id}/`
            : `${baseUrl}/appointments/availabilities/`;

        try {
            const response = await fetch(url, {
                method: editingItem ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...data, pastor: user.id })
            });

            if (response.ok) {
                setShowAvailabilityModal(false);
                setEditingItem(null);
                fetchData();
            } else {
                const err = await response.json();
                alert(JSON.stringify(err));
            }
        } catch (error) {
            console.error('Error saving availability:', error);
        }
    };

    const tabs = [
        { id: 'prayers', label: 'Prières Reçues', icon: MessageSquare, count: prayers.length },
        { id: 'sermons', label: 'Prédications', icon: BookOpen },
        { id: 'donations', label: 'Toutes les Donations', icon: Heart },
        { id: 'exhortations', label: 'Exhortations (Rhema)', icon: FileText },
        { id: 'availability', label: 'Mes Heures de Réception', icon: Clock },
        { id: 'appointments', label: 'Rendez-vous', icon: Calendar, count: stats.pendingAppointments },
    ];

    if (loading) return (
        <div className="min-h-screen pt-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Dashboard Pasteur</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez la communauté et les activités spirituelles</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="flex items-center space-x-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-700"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-indigo-100">
                                {user?.profile_picture ? (
                                    <img src={user.profile_picture} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-sm hidden sm:block">Paramètres</span>
                        </button>
                        <div className="flex items-center space-x-2 bg-indigo-600 px-4 py-2 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Calendar className="w-5 h-5" />
                            <span className="font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Prières à traiter"
                        value={stats.prayersCount}
                        icon={MessageSquare}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Donations Totales"
                        value={`${stats.totalDonations.toFixed(2)} €`}
                        icon={Heart}
                        color="bg-rose-500"
                    />
                    <StatCard
                        title="RDV en attente"
                        value={stats.pendingAppointments}
                        icon={Calendar}
                        color="bg-amber-500"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Horizontal Tabs for Mobile / Vertical for Desktop */}
                    <aside className="w-full lg:w-72">
                        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-2 no-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap flex items-center justify-between px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10 border-l-4 border-indigo-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : ''}`} />
                                        <span>{tab.label}</span>
                                    </div>
                                    {tab.count !== undefined && (
                                        <span className={`ml-3 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-slate-700'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-700 min-h-[600px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'prayers' && <PrayersList prayers={prayers} onUpdate={(id, status) => updateStatus('prayer', id, status)} />}
                                {activeTab === 'sermons' && (
                                    <SermonsList
                                        sermons={sermons}
                                        onAdd={() => { setEditingItem(null); setShowSermonModal(true); }}
                                        onEdit={(item) => { setEditingItem(item); setShowSermonModal(true); }}
                                        onDelete={(id) => handleDelete('sermon', id)}
                                    />
                                )}
                                {activeTab === 'donations' && <DonationsList donations={donations} />}
                                {activeTab === 'exhortations' && (
                                    <ExhortationsList
                                        rhemas={rhemas}
                                        onAdd={() => { setEditingItem(null); setShowRhemaModal(true); }}
                                        onEdit={(item) => { setEditingItem(item); setShowRhemaModal(true); }}
                                        onDelete={(id) => handleDelete('rhema', id)}
                                    />
                                )}
                                {activeTab === 'availability' && (
                                    <AvailabilityList
                                        availabilities={availabilities}
                                        onAdd={() => { setEditingItem(null); setShowAvailabilityModal(true); }}
                                        onEdit={(item) => { setEditingItem(item); setShowAvailabilityModal(true); }}
                                        onDelete={(id) => handleDelete('availability', id)}
                                    />
                                )}
                                {activeTab === 'appointments' && <AppointmentsList appointments={appointments} onUpdate={(id, status, data) => updateStatus('appointment', id, status, data)} />}
                            </motion.div>
                        </AnimatePresence>

                        {/* Modals */}
                        {showSermonModal && (
                            <SermonFormModal
                                sermon={editingItem}
                                onSave={handleSaveSermon}
                                onClose={() => setShowSermonModal(false)}
                            />
                        )}
                        {showRhemaModal && (
                            <RhemaFormModal
                                rhema={editingItem}
                                onSave={handleSaveRhema}
                                onClose={() => setShowRhemaModal(false)}
                            />
                        )}
                        {showAvailabilityModal && (
                            <AvailabilityFormModal
                                availability={editingItem}
                                onSave={handleSaveAvailability}
                                onClose={() => setShowAvailabilityModal(false)}
                            />
                        )}
                        {showSettingsModal && (
                            <SettingsModal
                                user={user}
                                onClose={() => setShowSettingsModal(false)}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h4>
        </div>
    </div>
);

const PrayersList = ({ prayers, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredPrayers = Array.isArray(prayers) ? prayers.filter(prayer => {
        const matchesSearch = (prayer.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (prayer.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (prayer.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || prayer.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Prières Reçues</h3>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="ALL">Tout</option>
                            <option value="PENDING">En attente</option>
                            <option value="RESOLVED">Traité</option>
                        </select>
                        <Filter className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>
            {filteredPrayers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredPrayers.map((prayer) => (
                        <div key={prayer.id} className="p-5 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{prayer.title}</h4>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                        De: {prayer.is_anonymous ? 'Anonyme' : prayer.full_name || prayer.user?.username || 'Inconnu'}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prayer.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                    prayer.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {prayer.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{prayer.content}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-800">
                                <span className="text-[10px] text-gray-400">{new Date(prayer.created_at).toLocaleString()}</span>
                                <div className="flex space-x-2">
                                    {prayer.status !== 'RESOLVED' && (
                                        <button
                                            onClick={() => onUpdate(prayer.id, 'RESOLVED')}
                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center space-x-1"
                                            title="Marquer comme résolu"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-[10px] font-bold">Résoudre</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-slate-900 rounded-3xl">
                    <MessageSquare className="w-16 h-16 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune requête trouvée.</p>
                </div>
            )}
        </div>
    );
};

const SermonsList = ({ sermons, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Extract unique categories for filter
    const categories = ['ALL', ...new Set(Array.isArray(sermons) ? sermons.map(s => s.category).filter(Boolean) : [])];

    const filteredSermons = Array.isArray(sermons) ? sermons.filter(sermon => {
        const matchesSearch = (sermon.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || sermon.category === categoryFilter;
        return matchesSearch && matchesCategory;
    }) : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Sermons</h3>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par titre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm w-full sm:w-48 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-auto"
                            >
                                <option value="ALL">Toutes les catégories</option>
                                {categories.filter(c => c !== 'ALL').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <Filter className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nouveau Sermon</span>
                        <span className="sm:hidden">Nouveau</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSermons.length > 0 ? (
                    filteredSermons.map(sermon => (
                        <div key={sermon.id} className="bg-gray-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 group hover:shadow-xl transition-all">
                            <div className="h-40 bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
                                {sermon.cover_image ? (
                                    <img src={sermon.cover_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                ) : (
                                    <div className="flex items-center justify-center h-full"><BookOpen className="w-12 h-12 text-gray-400" /></div>
                                )}
                                <div className="absolute top-2 right-2 flex space-x-1">
                                    <button
                                        onClick={() => onEdit(sermon)}
                                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm hover:text-indigo-600 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(sermon.id)}
                                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{sermon.category}</span>
                                <h4 className="font-bold text-gray-900 dark:text-white mt-3 truncate">{sermon.title}</h4>
                                <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                                    {sermon.pdf_file && <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> PDF</span>}
                                    {sermon.youtube_url && <span className="flex items-center"><XCircle className="w-3 h-3 mr-1" /> Vidéo</span>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-500 dark:text-gray-400">
                        Aucun sermon ne correspond à la recherche.
                    </div>
                )}
            </div>
        </div>
    );
};

const DonationsList = ({ donations }) => (
    <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Toutes les Donations</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800">
                        <th className="pb-4 pt-2 font-bold text-xs uppercase tracking-wider text-gray-400">Date</th>
                        <th className="pb-4 pt-2 font-bold text-xs uppercase tracking-wider text-gray-400">Membre</th>
                        <th className="pb-4 pt-2 font-bold text-xs uppercase tracking-wider text-gray-400">Montant</th>
                        <th className="pb-4 pt-2 font-bold text-xs uppercase tracking-wider text-gray-400">Statut</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {Array.isArray(donations) && donations.map(donation => (
                        <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group">
                            <td className="py-4 text-sm text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</td>
                            <td className="py-4 font-bold text-gray-900 dark:text-white">
                                {donation.is_anonymous ? 'Anonyme' : donation.user?.username || 'Donateur'}
                            </td>
                            <td className="py-4 font-extrabold text-indigo-600 dark:text-indigo-400">{donation.amount} {donation.currency}</td>
                            <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${donation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {donation.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ExhortationsList = ({ rhemas, onAdd, onEdit, onDelete }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Exhortations Quotidiennes (Rhema)</h3>
            <button
                onClick={onAdd}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
                <Plus className="w-4 h-4" />
                <span>Nouv. Rhema</span>
            </button>
        </div>
        <div className="space-y-4">
            {Array.isArray(rhemas) && rhemas.map(rhema => (
                <div key={rhema.id} className="p-6 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-bold">
                                {rhema.published_at}
                            </span>
                            <h4 className="font-bold text-gray-900 dark:text-white">{rhema.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">"{rhema.verse}"</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{rhema.content}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => onEdit(rhema)}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(rhema.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AvailabilityList = ({ availabilities, onAdd, onEdit, onDelete }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Heures de Réception</h3>
            <button
                onClick={onAdd}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
                <Plus className="w-4 h-4" />
                <span>Gérer l'Horaire</span>
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(availabilities) && availabilities.map(av => (
                <div key={av.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{av.day_display}</p>
                            <p className="text-xs text-gray-500">{av.start_time} - {av.end_time}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${av.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <button
                            onClick={() => onEdit(av)}
                            className="text-gray-400 hover:text-indigo-600"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(av.id)}
                            className="text-gray-400 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ConfirmAppointmentModal = ({ isOpen, onClose, onConfirm, appointment }) => {
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !appointment) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm(appointment.id, 'CONFIRMED', { location, message_to_member: message });
            onClose();
            setLocation('');
            setMessage('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Confirmer le rendez-vous
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Vous confirmez le rendez-vous avec <strong>{appointment.member_name}</strong> pour le <strong>{appointment.requested_date}</strong> à <strong>{appointment.requested_time}</strong>.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lieu ou Lien de visio <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ex: Bureau du Pasteur / Lien Zoom..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message pour le membre (Optionnel)
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Instructions supplémentaires..."
                                rows="3"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all dark:text-white resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Confirmer le RDV
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AppointmentsList = ({ appointments, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sortedAppts = Array.isArray(appointments) ? [...appointments].sort((a, b) => b.id - a.id) : [];

    const filteredAppts = sortedAppts.filter(appt => {
        const matchesSearch = (appt.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (appt.member_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (appt.member_email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || appt.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleOpenConfirm = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleConfirm = async (id, status, data) => {
        await onUpdate(id, status, data);
    };

    return (
        <div className="space-y-6">
            <ConfirmAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                appointment={selectedAppointment}
            />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rendez-vous à venir</h3>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Sujet, membre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="ALL">Tout</option>
                            <option value="PENDING">En attente</option>
                            <option value="CONFIRMED">Confirmé</option>
                            <option value="CANCELLED">Annulé</option>
                        </select>
                        <Filter className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>
            {filteredAppts.length > 0 ? (
                <div className="space-y-4">
                    {filteredAppts.map(appt => (
                        <div key={appt.id} className={`p-6 rounded-3xl border transition-all ${appt.status === 'PENDING' ? 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 shadow-indigo-500/10' : 'bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-800'
                            }`}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{appt.subject}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            appt.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {appt.status_display}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Membre: <span className="font-bold">{appt.member_name}</span> ({appt.member_email})</p>
                                    <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {appt.requested_date}</span>
                                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {appt.requested_time}</span>
                                    </div>
                                    {appt.notes && (
                                        <p className="mt-3 text-sm bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 text-gray-500 italic">
                                            "{appt.notes}"
                                        </p>
                                    )}
                                </div>
                                {appt.status === 'PENDING' && (
                                    <div className="flex md:flex-col justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenConfirm(appt)}
                                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Confirmer</span>
                                        </button>
                                        <button
                                            onClick={() => onUpdate(appt.id, 'CANCELLED')}
                                            className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-100"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            <span>Annuler</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Affichage des détails si confirmé */}
                            {appt.status === 'CONFIRMED' && (appt.location || appt.message_to_member) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {appt.location && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-indigo-500 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-gray-700 dark:text-gray-300 block">Lieu:</span>
                                                <span className="text-gray-600 dark:text-gray-400">{appt.location}</span>
                                            </div>
                                        </div>
                                    )}
                                    {appt.message_to_member && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MessageSquare className="w-4 h-4 text-indigo-500 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-gray-700 dark:text-gray-300 block">Votre message:</span>
                                                <span className="text-gray-600 dark:text-gray-400 italic">"{appt.message_to_member}"</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    Aucun rendez-vous correspondant.
                </div>
            )}
        </div>
    );
};

const SettingsModal = ({ user, onClose }) => {
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('access_token');
        const data = new FormData();
        data.append('profile_picture', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (response.ok) {
                alert('Photo de profil mise à jour !');
                window.location.reload();
            }
        } catch (error) {
            console.error('Erreur image:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Paramètres du Compte</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Image Section */}
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-50 dark:border-slate-700 shadow-lg">
                                {user?.profile_picture ? (
                                    <img src={user.profile_picture} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-indigo-500">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-all">
                                <Camera className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="text-sm font-bold text-gray-500">Photo de profil</p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                        {!showPasswordChange ? (
                            <button
                                onClick={() => setShowPasswordChange(true)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <div className="flex items-center space-x-3">
                                    <Lock className="w-5 h-5 text-rose-500" />
                                    <span className="font-bold">Modifier le mot de passe</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-rose-500" />
                                    Sécurité
                                </h4>
                                <PasswordChange onCancel={() => setShowPasswordChange(false)} />
                            </div>
                        )}
                    </div>
                </div>

                {!showPasswordChange && (
                    <button onClick={onClose} className="w-full mt-8 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl font-bold">Fermer</button>
                )}
            </motion.div>
        </div>
    );
};

const PasswordChange = ({ onCancel }) => {
    const [pwdData, setPwdData] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pwdData.new_password !== pwdData.confirm_password) {
            alert('Les nouveaux mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/change-password/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pwdData)
            });

            if (response.ok) {
                alert('Mot de passe changé avec succès !');
                onCancel();
            } else {
                const data = await response.json();
                alert(JSON.stringify(data));
            }
        } catch (error) {
            console.error('Erreur password:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ancien Mot de passe</label>
                <input type="password" required value={pwdData.old_password} onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nouveau Mot de passe</label>
                <input type="password" required value={pwdData.new_password} onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirmer</label>
                <input type="password" required value={pwdData.confirm_password} onChange={(e) => setPwdData({ ...pwdData, confirm_password: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="flex flex-col space-y-3 pt-4">
                <button type="submit" disabled={loading} className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 disabled:opacity-50">
                    {loading ? 'Traitement...' : 'Confirmer le changement'}
                </button>
                <button type="button" onClick={onCancel} className="w-full py-3 bg-gray-100 dark:bg-slate-700 rounded-xl font-bold">Annuler</button>
            </div>
        </form>
    );
};

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6">{sermon ? 'Modifier le Sermon' : 'Nouveau Sermon'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Titre</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none h-32" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Catégorie</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none">
                                <option value="SUNDAY_SERVICE">Culte Dimanche</option>
                                <option value="PREACHING">Prédication</option>
                                <option value="TEACHING">Enseignement</option>
                                <option value="EXHORTATION">Exhortation</option>
                                <option value="BIBLE_STUDY">Étude Biblique</option>
                                <option value="YOUTH">Jeunesse</option>
                                <option value="CONFERENCE">Conférence</option>
                                <option value="WORSHIP">Louange</option>
                                <option value="OTHER">Autre</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Lien YouTube</label>
                            <input type="url" value={formData.youtube_url} onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Image de couverture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverImage(e.target.files[0])}
                                className="w-full text-sm block file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Fichier PDF</label>
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => setPdfFile(e.target.files[0])}
                                className="w-full text-sm block file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 rounded-xl font-bold">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">Enregistrer</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const RhemaFormModal = ({ rhema, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: rhema?.title || '',
        verse: rhema?.verse || '',
        content: rhema?.content || '',
        meditation: rhema?.meditation || '',
        published_at: rhema?.published_at || new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6">{rhema ? 'Modifier Rhema' : 'Nouveau Rhema'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Titre</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Verset</label>
                        <input type="text" value={formData.verse} onChange={(e) => setFormData({ ...formData, verse: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none" placeholder="ex: Jean 3:16" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Parole du Jour (Contenu)</label>
                        <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none h-24" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Méditation / Note du Pasteur (Optionnel)</label>
                        <textarea value={formData.meditation} onChange={(e) => setFormData({ ...formData, meditation: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none h-24" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Date de publication</label>
                        <input type="date" value={formData.published_at} onChange={(e) => setFormData({ ...formData, published_at: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 border-none" required />
                    </div>
                    <div className="flex justify-end space-x-3 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 rounded-xl font-bold">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">Enregistrer</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const AvailabilityFormModal = ({ availability, onSave, onClose }) => {
    const days = [
        { value: 'MONDAY', label: 'Lundi' },
        { value: 'TUESDAY', label: 'Mardi' },
        { value: 'WEDNESDAY', label: 'Mercredi' },
        { value: 'THURSDAY', label: 'Jeudi' },
        { value: 'FRIDAY', label: 'Vendredi' },
        { value: 'SATURDAY', label: 'Samedi' },
        { value: 'SUNDAY', label: 'Dimanche' }
    ];

    const [formData, setFormData] = useState({
        day_of_week: availability?.day_of_week || 'MONDAY',
        start_time: availability?.start_time || '09:00',
        end_time: availability?.end_time || '17:00',
        is_active: availability?.is_active ?? true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold mb-6">Gérer l'Horaire</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Jour de la semaine</label>
                        <select
                            value={formData.day_of_week}
                            onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border-none"
                        >
                            {days.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Heure début</label>
                            <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Heure fin</label>
                            <input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border-none" required />
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                        <label className="text-sm font-bold">Actif / Ouvert</label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 rounded-xl font-bold">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">Enregistrer</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default PastorDashboard;
