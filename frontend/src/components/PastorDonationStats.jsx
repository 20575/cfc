import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDonate, FaChartLine, FaUsers } from 'react-icons/fa';
import { Loader } from 'lucide-react';

const PastorDonationStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${baseUrl}/donations/global-stats/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Pastor stats received:', data);

                if (data && (data.role === 'PASTOR' || data.role === 'ADMIN')) {
                    setStats(data);
                } else {
                    setError('Format de données inattendu');
                }
            } else {
                setError(`Erreur ${res.status}: ${res.statusText}`);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="animate-spin text-bordeaux h-12 w-12" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-red-700 font-medium mb-2">Impossible de charger les statistiques</p>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        onClick={fetchStats}
                        className="mt-4 px-4 py-2 bg-bordeaux text-white rounded-lg hover:bg-opacity-90"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Statistiques des Dons</h1>
                <p className="text-gray-500 mt-1">Vue d'ensemble des contributions de l'église</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Montant Total */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl p-8 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-2">Montant Total Collecté</p>
                            <p className="text-5xl font-bold">{stats.total_amount.toFixed(2)} {stats.currency}</p>
                        </div>
                        <FaDonate className="text-6xl opacity-30" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm opacity-80">Tous les dons validés depuis le début</p>
                    </div>
                </motion.div>

                {/* Nombre de Dons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-400 rounded-xl p-8 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-2">Nombre de Contributions</p>
                            <p className="text-5xl font-bold">{stats.total_count}</p>
                        </div>
                        <FaUsers className="text-6xl opacity-30" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm opacity-80">Dons validés depuis le début</p>
                    </div>
                </motion.div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                    <FaChartLine className="text-blue-500 text-2xl mt-1" />
                    <div>
                        <h3 className="font-bold text-blue-900 mb-2">À propos de ces statistiques</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            En tant que pasteur, vous avez accès aux <strong>statistiques globales</strong> des dons de l'église.
                            Ces montants incluent tous les dons validés, même ceux qui ont été archivés par l'administrateur.
                            Pour des raisons de confidentialité, vous ne pouvez pas voir les détails individuels des donateurs.
                        </p>
                        <p className="text-sm text-blue-700 mt-2">
                            Pour gérer vos propres dons personnels, utilisez l'onglet "Mes Dons Personnels".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PastorDonationStats;
