import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDonate, FaCheckCircle, FaClock, FaTimesCircle, FaBan, FaExclamationTriangle, FaCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DonationHistory = ({ userId }) => {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, PENDING

    const handleReportIssue = (donation) => {
        // Rediriger vers le dashboard avec un paramètre pour ouvrir le chat de support
        // Ou vers une page dédiée. On va utiliser le dashboard membre avec un hash ou un état.
        navigate('/member/dashboard', {
            state: {
                openSupport: true,
                donationId: donation.id,
                prefilledMessage: `J'ai un souci avec mon don du ${new Date(donation.created_at).toLocaleDateString()} de ${donation.amount} ${donation.currency} (ID: ${donation.paypal_payment_id}).`
            }
        });
    };

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
        if (filter === 'ALL') return true;
        return don.status === filter;
    });

    const totalAmount = filteredDonations
        .filter(d => d.status === 'COMPLETED')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

    const completedCount = donations.filter(d => d.status === 'COMPLETED').length;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bordeaux"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl p-6 text-white"
                >
                    <FaDonate className="text-3xl mb-2" />
                    <p className="text-sm opacity-90">Total Validé</p>
                    <p className="text-3xl font-bold">{totalAmount.toFixed(2)} EUR</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-400 rounded-xl p-6 text-white"
                >
                    <FaCheckCircle className="text-3xl mb-2" />
                    <p className="text-sm opacity-90">Dons Validés</p>
                    <p className="text-3xl font-bold">{completedCount}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-400 rounded-xl p-6 text-white"
                >
                    <FaClock className="text-3xl mb-2" />
                    <p className="text-sm opacity-90">En Attente</p>
                    <p className="text-3xl font-bold">{donations.filter(d => d.status === 'PENDING').length}</p>
                </motion.div>
            </div>

            {/* Filtres */}
            <div className="flex space-x-2">
                {['ALL', 'COMPLETED', 'PENDING'].map(filterOption => (
                    <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === filterOption
                            ? 'bg-bordeaux text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {filterOption === 'ALL' ? 'Tous' : getStatusLabel(filterOption)}
                    </button>
                ))}
            </div>

            {/* Tableau */}
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
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDonations.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleReportIssue(donation)}
                                                className="text-amber-600 hover:text-amber-700 p-2 rounded-full hover:bg-amber-50 transition-colors"
                                                title="Signaler un souci"
                                            >
                                                <FaExclamationTriangle />
                                            </button>
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

export default DonationHistory;
