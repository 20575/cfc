import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    MessageSquare,
    BookOpen,
    Heart,
    FileText,
    Clock,
    Calendar,
    LayoutDashboard,
    LogOut,
    Globe,
    Headset,
    Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProtectedLayout from '../Auth/ProtectedLayout';
import SupportChat from '../../features/chat/components/SupportChat';

const PastorLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [supportChat, setSupportChat] = React.useState({
        isOpen: false,
        unreadCount: 0
    });

    const menuItems = [
        { name: 'Dashboard', path: '/pastor', icon: LayoutDashboard, exact: true },
        { name: 'Prières', path: '/pastor/prayers', icon: MessageSquare },
        { name: 'Sermons', path: '/pastor/sermons', icon: BookOpen },
        { name: 'Donations', path: '/pastor/donations', icon: Heart },
        { name: 'Rhema', path: '/pastor/rhema', icon: FileText },
        { name: 'Disponibilités', path: '/pastor/availabilities', icon: Clock },
        { name: 'Rendez-vous', path: '/pastor/appointments', icon: Calendar },
        { name: 'Gestion du Live', path: '/pastor/live', icon: Video },
        { name: 'Support Admin', path: '#', icon: Headset, onClick: () => setSupportChat({ ...supportChat, isOpen: true }) },
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
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Dashboard Pasteur</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gestion de la communauté</p>
                </div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);

                    return (
                        <div key={item.path} className="w-full">
                            {item.onClick ? (
                                <button
                                    onClick={item.onClick}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="flex-1">{item.name}</span>
                                    {item.name === 'Support Admin' && supportChat.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto">
                                            {supportChat.unreadCount}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                                    <span>{item.name}</span>
                                </Link>
                            )}
                        </div>
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
        <ProtectedLayout sidebar={sidebar} userRole="PASTOR">
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
                    <span className="hidden md:inline font-bold">Support Admin</span>
                </button>
            )}

            <SupportChat
                isOpen={supportChat.isOpen}
                onClose={() => setSupportChat({ ...supportChat, isOpen: false })}
                onUnreadChange={(count) => setSupportChat(prev => ({ ...prev, unreadCount: count }))}
            />
        </ProtectedLayout>
    );
};

export default PastorLayout;
