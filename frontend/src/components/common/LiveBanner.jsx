import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { liveApi } from '../../features/live/api';
import { useAuth } from '../../context/AuthContext';
import { FaCircle, FaVideo, FaChevronRight } from 'react-icons/fa';

const LiveBanner = () => {
    const [activeLive, setActiveLive] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkLive = async () => {
            if (!isAuthenticated) return;
            try {
                const data = await liveApi.getActiveStream();
                setActiveLive(data);
            } catch (error) {
                console.error("Error checking active live:", error);
            }
        };

        if (isAuthenticated) {
            checkLive();
            const interval = setInterval(checkLive, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    if (!activeLive) return null;

    const handleGoLive = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        switch (user.role) {
            case 'ADMIN':
                navigate('/admin/live');
                break;
            case 'PASTOR':
                navigate('/pastor/live');
                break;
            default:
                navigate('/member/live');
        }
    };

    return (
        <div
            onClick={handleGoLive}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 shadow-xl cursor-pointer transition-all animate-pulse-slow border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        <FaCircle className="text-[6px] animate-pulse" />
                        <span>Live</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm md:text-base flex items-center truncate">
                            <FaVideo className="mr-2 hidden sm:inline" />
                            {activeLive.title}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-widest whitespace-nowrap ml-4">
                    <span className="hidden sm:inline">Rejoindre maintenant</span>
                    <FaChevronRight className="text-[10px]" />
                </div>
            </div>
        </div>
    );
};

export default LiveBanner;
