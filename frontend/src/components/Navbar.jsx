import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaGlobe } from 'react-icons/fa'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import logo from '../assets/logo/cfc.jpg' // Using the user's logo asset

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { user, isAuthenticated, logout } = useAuth()
    const { language, toggleLanguage, t } = useLanguage()
    const navigate = useNavigate()

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true)
            } else {
                setScrolled(false)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.gallery'), path: '/gallery' },
        { name: t('nav.sermons'), path: '/sermons' },
        { name: 'Bible', path: '/bible-ai' },
        { name: 'Agenda', path: '/events' },
        { name: t('nav.contact'), path: '/contact' },
    ]

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={logo} alt="CFC Logo" className="h-12 w-12 rounded-full object-cover" />
                        <div className={`flex flex-col ${scrolled ? 'text-black' : 'text-white'}`}>
                            <span className="font-extrabold text-xl tracking-wide uppercase leading-none">Cyprus For Christ</span>
                            <span className="text-[10px] tracking-[0.2em] opacity-80 uppercase">Former • Transformer • Exposer</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`font-semibold text-sm uppercase tracking-wide transition-colors duration-300 ${scrolled ? 'text-gray-800 hover:text-compassion-purple' : 'text-white hover:text-gray-300'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <button
                            onClick={() => toggleLanguage()}
                            className={`flex items-center gap-1 font-bold text-sm uppercase transition-colors hover:opacity-80 ${scrolled ? 'text-gray-800' : 'text-white'}`}
                        >
                            <FaGlobe className="text-lg" />
                            <span>{language === 'fr' ? 'EN' : 'FR'}</span>
                        </button>

                        <Link
                            to="/donations"
                            className={`px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${scrolled
                                ? 'bg-compassion-purple text-white hover:bg-opacity-90'
                                : 'bg-white text-black hover:bg-gray-100'
                                }`}
                        >
                            {t('nav.donate')}
                        </Link>

                        {!isAuthenticated ? (
                            <div className="flex items-center space-x-4 ml-4">
                                <Link
                                    to="/login"
                                    className={`font-bold text-sm uppercase transition-colors ${scrolled ? 'text-gray-600 hover:text-compassion-purple' : 'text-gray-300 hover:text-white'}`}
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className={`px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider border-2 transition-all ${scrolled
                                        ? 'border-compassion-purple text-compassion-purple hover:bg-compassion-purple hover:text-white'
                                        : 'border-white text-white hover:bg-white hover:text-black'}`}
                                >
                                    {t('nav.register')}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-6 ml-4 border-l pl-6 border-gray-300">
                                <Link
                                    to={user?.role === 'PASTOR' ? '/pastor' : (user?.role === 'ADMIN' ? '/admin' : '/member')}
                                    className={`font-bold text-sm uppercase flex items-center gap-2 ${scrolled ? 'text-gray-800 hover:text-compassion-purple' : 'text-white hover:text-gray-300'}`}
                                >
                                    <span className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white text-xs">
                                        {user?.first_name?.charAt(0) || user?.username?.charAt(0)}
                                    </span>
                                    {user?.role === 'PASTOR' || user?.role === 'ADMIN' ? (t('nav.dashboard') || 'Dashboard') : (t('nav.profile') || 'Mon Espace')}
                                </Link>
                                <button
                                    onClick={() => { logout(); navigate('/'); }}
                                    className={`text-xs font-bold uppercase transition-colors ${scrolled ? 'text-red-500 hover:text-red-700' : 'text-red-300 hover:text-red-500'}`}
                                >
                                    {t('nav.logout')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`lg:hidden p-2 ${scrolled ? 'text-black' : 'text-white'}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white shadow-xl py-6 px-6 flex flex-col space-y-4 lg:hidden"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-gray-800 font-bold text-lg uppercase tracking-wide hover:text-compassion-purple"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            to="/donations"
                            className="bg-compassion-purple text-white py-3 text-center rounded-lg font-bold uppercase tracking-wide"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('nav.donate')}
                        </Link>

                        {!isAuthenticated ? (
                            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                                <Link
                                    to="/login"
                                    className="text-gray-600 font-bold text-lg uppercase py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="border-2 border-compassion-purple text-compassion-purple py-3 text-center rounded-lg font-bold uppercase"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('nav.register')}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                                <Link
                                    to={user?.role === 'PASTOR' ? '/pastor' : (user?.role === 'ADMIN' ? '/admin' : '/member')}
                                    className="text-gray-800 font-bold text-lg uppercase py-2 flex items-center gap-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white">
                                        {user?.first_name?.charAt(0) || user?.username?.charAt(0)}
                                    </div>
                                    {t('nav.profile')}
                                </Link>
                                <button
                                    onClick={() => { logout(); navigate('/'); setIsOpen(false); }}
                                    className="text-red-500 font-bold text-lg uppercase py-2 text-left"
                                >
                                    {t('nav.logout')}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => { toggleLanguage(); setIsOpen(false); }}
                            className="text-gray-500 font-bold text-sm uppercase tracking-widest hover:text-compassion-purple text-left flex items-center gap-2 mt-6 pt-4 border-t border-gray-50"
                        >
                            <FaGlobe /> {language === 'fr' ? 'Switch to English' : 'Passer en Français'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
