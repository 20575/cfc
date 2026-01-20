import React, { useState, useEffect } from 'react';
import { announcementsApi } from '../../features/announcements/api';
import { useAuth } from '../../context/AuthContext';

const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        // Seuls les membres voient les annonces selon la demande
        if (user && user.role === 'MEMBER') {
            fetchAnnouncements();
        }
    }, [user]);

    const fetchAnnouncements = async () => {
        try {
            const data = await announcementsApi.getAnnouncements();
            // Le backend renvoie déjà les annonces filtrées (en attente ou actives)
            // Mais pour un membre, il ne devrait en voir que les actives.
            setAnnouncements(data.results || data);
        } catch (error) {
            console.error("Erreur lors de la récupération des annonces:", error);
        }
    };

    if (announcements.length === 0) return null;

    const current = announcements[currentIdx];

    const next = () => {
        setCurrentIdx((prev) => (prev + 1) % announcements.length);
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 px-4 shadow-md overflow-hidden animate-fade-in">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="flex-shrink-0 bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                        Annonce
                    </span>
                    <p className="truncate font-medium text-sm md:text-base">
                        <span className="font-bold">{current.title}:</span> {current.content}
                    </p>
                </div>

                <div className="flex items-center space-x-4 ml-4">
                    {announcements.length > 1 && (
                        <span className="text-xs text-blue-100 hidden sm:inline">
                            {currentIdx + 1} / {announcements.length}
                        </span>
                    )}
                    <button
                        onClick={next}
                        className="text-white/80 hover:text-white transition-colors"
                        title="Suivant"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementBanner;
