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
    Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProtectedLayout from '../Auth/ProtectedLayout';

const PastorLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/pastor', icon: LayoutDashboard, exact: true },
        { name: 'Prières', path: '/pastor/prayers', icon: MessageSquare },
        { name: 'Sermons', path: '/pastor/sermons', icon: BookOpen },
        { name: 'Donations', path: '/pastor/donations', icon: Heart },
        { name: 'Rhema', path: '/pastor/rhema', icon: FileText },
        { name: 'Disponibilités', path: '/pastor/availabilities', icon: Clock },
        { name: 'Rendez-vous', path: '/pastor/appointments', icon: Calendar },
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
        <ProtectedLayout sidebar={sidebar} userRole="PASTOR">
            <Outlet />
        </ProtectedLayout>
    );
};

export default PastorLayout;
