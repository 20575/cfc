import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Video,
    MessageSquare,
    Heart,
    Calendar,
    Image as ImageIcon,
    Settings,
    Mail,
    LogOut,

    Globe,
    Info,
    Megaphone,
    Headset
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProtectedLayout from '../Auth/ProtectedLayout';

const AdminLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Tableau de Bord', path: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Annonces', path: '/admin/announcements', icon: Megaphone },
        { name: 'Direct Vidéo', path: '/admin/live', icon: Video },
        { name: 'Messages Support', path: '/admin/support', icon: Headset },
        { name: 'Utilisateurs', path: '/admin/users', icon: Users },
        { name: 'Créer un Pasteur', path: '/admin/create-pastor', icon: UserPlus },
        { name: 'Sermons', path: '/admin/sermons', icon: Video },
        { name: 'Prières', path: '/admin/prayers', icon: MessageSquare },
        { name: 'Dons', path: '/admin/donations', icon: Heart },
        { name: 'Événements', path: '/admin/events', icon: Calendar },
        { name: 'Galerie', path: '/admin/gallery', icon: ImageIcon },
        { name: 'Contact', path: '/admin/contact', icon: Settings },
        { name: 'À propos', path: '/admin/about', icon: Info }, // Added About Management
        { name: 'Messages', path: '/admin/messages', icon: Mail },
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
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Panel Admin</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gestion complète</p>
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
        <ProtectedLayout sidebar={sidebar} userRole="ADMIN">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {menuItems.find(item => isActive(item))?.name || 'Administration'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gérez votre plateforme Cyprus For Christ
                </p>
            </div>
            <Outlet />
        </ProtectedLayout>
    );
};

export default AdminLayout;
