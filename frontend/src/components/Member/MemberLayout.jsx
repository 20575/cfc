import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Heart,
    MessageSquare,
    Calendar,
    LogOut,
    Globe,
    Headset
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProtectedLayout from '../Auth/ProtectedLayout';
import SupportChat from '../../features/chat/components/SupportChat';

const MemberLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [supportChat, setSupportChat] = React.useState({
        isOpen: false,
        initialMessage: '',
        donationId: null,
        unreadCount: 0
    });

    React.useEffect(() => {
        if (location.state?.openSupport) {
            setSupportChat({
                isOpen: true,
                initialMessage: location.state.prefilledMessage || '',
                donationId: location.state.donationId || null
            });
            // Clear location state to avoid re-opening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const menuItems = [
        { name: 'Mon Dashboard', path: '/member', icon: LayoutDashboard, exact: true },
        { name: 'Mon Profil', path: '/member/profile', icon: User },
        { name: 'Mes Prières', path: '/member/prayers', icon: MessageSquare },
        { name: 'Mes Dons', path: '/member/donations', icon: Heart },
        { name: 'Rendez-vous', path: '/member/appointments', icon: Calendar },
        { name: 'Direct Vidéo', path: '/member/live', icon: Headset }, // Reuse Headset or Video later
    ];

    const isActive = (item) => {
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname.startsWith(item.path);
    };

    const sidebar = (
        <div className="flex flex-col h-full">
            <nav className="p-4 space-y-2 flex-grow">
                <div className="mb-6 px-3">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Espace Membre</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mon compte personnel</p>
                </div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <Link
                    to="/"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all mb-2"
                >
                    <Globe className="w-5 h-5" />
                    <span>Voir le site</span>
                </Link>
                <button
                    onClick={logout}
                    className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );

    return (
        <ProtectedLayout sidebar={sidebar} userRole="MEMBER">
            <Outlet />

            {/* Bouton de discussion flottant si chat fermé */}
            {!supportChat.isOpen && (
                <button
                    onClick={() => setSupportChat({ ...supportChat, isOpen: true })}
                    className="fixed bottom-6 right-6 bg-bordeaux text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center space-x-2"
                >
                    <div className="relative">
                        <Headset className="w-6 h-6" />
                        {supportChat.unreadCount > 0 && (
                            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                {supportChat.unreadCount}
                            </span>
                        )}
                    </div>
                    <span className="hidden md:inline font-bold">Besoin d'aide ?</span>
                </button>
            )}

            <SupportChat
                isOpen={supportChat.isOpen}
                onClose={() => setSupportChat({ ...supportChat, isOpen: false })}
                initialMessage={supportChat.initialMessage}
                donationId={supportChat.donationId}
                onUnreadChange={(count) => setSupportChat(prev => ({ ...prev, unreadCount: count }))}
            />
        </ProtectedLayout>
    );
};

export default MemberLayout;
