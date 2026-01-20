import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DonationHistory from '../../components/DonationHistory';
import DonationDeclarationForm from '../../components/DonationDeclarationForm';

const MemberDonations = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('history'); // 'history' or 'declare'

    const handleDonationSuccess = (donation) => {
        // Refresh the history
        setRefreshKey(prev => prev + 1);
        // Switch to history tab to see the new donation
        setActiveTab('history');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes Dons</h1>
                <p className="text-gray-500 mt-1">Soutenez l'œuvre du Seigneur</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'history'
                            ? 'border-b-2 border-bordeaux text-bordeaux'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    📊 Mon Historique
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
                {activeTab === 'history' ? (
                    <DonationHistory key={refreshKey} />
                ) : (
                    <DonationDeclarationForm onSuccess={handleDonationSuccess} />
                )}
            </motion.div>
        </div>
    );
};

export default MemberDonations;
