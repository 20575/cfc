import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DonationHistory from '../../components/DonationHistory';
import DonationDeclarationForm from '../../components/DonationDeclarationForm';
import PastorDonationStats from '../../components/PastorDonationStats';

const PastorDonations = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'history' or 'declare'

    const handleDonationSuccess = (donation) => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('history');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dons de l'Église</h1>
                <p className="text-gray-500 mt-1">Statistiques globales et gestion de vos dons personnels</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'stats'
                            ? 'border-b-2 border-bordeaux text-bordeaux'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    📊 Statistiques Globales
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'history'
                            ? 'border-b-2 border-bordeaux text-bordeaux'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    💰 Mes Dons Personnels
                </button>
                <button
                    onClick={() => setActiveTab('declare')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'declare'
                            ? 'border-b-2 border-bordeaux text-bordeaux'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    ➕ Déclarer un Don
                </button>
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'stats' ? (
                    <PastorDonationStats />
                ) : activeTab === 'history' ? (
                    <DonationHistory key={refreshKey} />
                ) : (
                    <DonationDeclarationForm onSuccess={handleDonationSuccess} />
                )}
            </motion.div>
        </div>
    );
};

export default PastorDonations;
