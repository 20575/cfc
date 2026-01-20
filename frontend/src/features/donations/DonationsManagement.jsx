import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDonate, FaCheckCircle, FaClock, FaTimesCircle, FaBan, FaSearch, FaFilter } from 'react-icons/fa';
import { Loader, Check, X, Trash2 } from 'lucide-react';

const DonationsManagement = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${baseUrl}/donations/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setDonations(data);
            }
        } catch (error) {
            console.error("Error fetching donations:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (donationId, newStatus) => {
        setUpdating(donationId);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${baseUrl}/donations/${donationId}/update-status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Refresh donations list
                fetchDonations();
            } else {
                const data = await res.json();
                alert(data.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erreur de connexion');
        } finally {
            setUpdating(null);
        }
    };

    const deleteDonation = async (donationId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce don ? Cette action est irréversible.')) {
            return;
        }

        setUpdating(donationId);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${baseUrl}/donations/${donationId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Refresh donations list
                fetchDonations();
            } else {
                const data = await res.json();
                alert(data.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting donation:', error);
            alert('Erreur de connexion');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <FaCheckCircle className="text-green-500" />;
            case 'PENDING':
                return <FaClock className="text-yellow-500" />;
            case 'FAILED':
                return <FaTimesCircle className="text-red-500" />;
            case 'CANCELLED':
                return <FaBan className="text-gray-500" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'COMPLETED': 'Validé',
            'PENDING': 'En attente',
            'FAILED': 'Échoué',
            'CANCELLED': 'Annulé'
        };
        return labels[status] || status;
    };

    const filteredDonations = donations.filter(don => {
        const matchesFilter = filter === 'ALL' || don.status === filter;
        const matchesSearch =
            (don.user?.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (don.user?.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (don.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (don.amount?.toString() || '').includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: donations.length,
        pending: donations.filter(d => d.status === 'PENDING').length,
        completed: donations.filter(d => d.status === 'COMPLETED').length,
        totalAmount: donations
            .filter(d => d.status === 'COMPLETED')
            .reduce((sum, d) => sum + parseFloat(d.amount), 0)
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="animate-spin text-bordeaux h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Dons</h1>
                <p className="text-gray-500 mt-1">Validez et gérez tous les dons de l'église</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-400 rounded-xl p-6 text-white">
                    <FaDonate className="text-3xl mb-2" />
                    <p className="text-sm opacity-90">Total Dons</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-400 rounded-xl p-6 text-white">
                    <FaClock className="text-3xl mb-2" />
                    <p className="text-sm opacity-90">En Attente</p>
                    <p className="text-3xl font-bold">{stats.pending}</p>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl p-6 text-white">
                    <FaCheckCircle className="text-3xl mb-2" />
                    <p className="text-sm opacity-90">Validés</p>
                    <p className="text-3xl font-bold">{stats.completed}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl p-6 text-white">
                    <FaDonate className="text-3xl mb-2" />
                    <p className="text-sm opacity-90">Montant Total</p>
                    <p className="text-3xl font-bold">{stats.totalAmount.toFixed(2)} EUR</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, montant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    />
                </div>
                <div className="flex space-x-2">
                    {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map(filterOption => (
                        <button
                            key={filterOption}
                            onClick={() => setFilter(filterOption)}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${filter === filterOption
                                ? 'bg-bordeaux text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {filterOption === 'ALL' ? 'Tous' : getStatusLabel(filterOption)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {filteredDonations.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FaDonate className="text-5xl mx-auto mb-4 opacity-30" />
                        <p>Aucun don trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Donateur
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Montant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Projet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDonations.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {donation.is_anonymous
                                                        ? 'Anonyme'
                                                        : `${donation.user?.first_name || ''} ${donation.user?.last_name || ''}`.trim() || 'Inconnu'
                                                    }
                                                </div>
                                                {!donation.is_anonymous && donation.user?.email && (
                                                    <div className="text-xs text-gray-500">{donation.user.email}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(donation.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-lg font-bold text-bordeaux">
                                                {parseFloat(donation.amount).toFixed(2)} {donation.currency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {donation.project || 'Général'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center space-x-2">
                                                {getStatusIcon(donation.status)}
                                                <span className="text-sm font-medium">
                                                    {getStatusLabel(donation.status)}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex space-x-2">
                                                {donation.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(donation.id, 'COMPLETED')}
                                                            disabled={updating === donation.id}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span>Valider</span>
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(donation.id, 'CANCELLED')}
                                                            disabled={updating === donation.id}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span>Refuser</span>
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => deleteDonation(donation.id)}
                                                    disabled={updating === donation.id}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                                    title="Supprimer ce don"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Supprimer</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationsManagement;
