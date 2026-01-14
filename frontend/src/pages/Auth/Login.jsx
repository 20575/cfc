import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaChurch, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Login = () => {
    const { t } = useLanguage();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'PASTOR') {
                navigate('/pastor');
            } else {
                navigate('/member');
            }
        }
    }, [isAuthenticated, user, authLoading, navigate]);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().required(t('auth.register.validation.required')),
            password: Yup.string().required(t('auth.register.validation.required')),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            try {
                await login(values.email, values.password);

                // Get user data from localStorage (set by AuthContext)
                const token = localStorage.getItem('access_token');
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
                const profileResponse = await fetch(`${baseUrl}/auth/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (profileResponse.ok) {
                    const userData = await profileResponse.json();

                    // Redirect based on user role
                    if (userData.role === 'ADMIN') {
                        window.location.href = '/admin';
                    } else if (userData.role === 'PASTOR') {
                        window.location.href = '/pastor';
                    } else {
                        window.location.href = '/member';
                    }
                    window.location.reload();
                } else {
                    window.location.href = '/member';
                    window.location.reload();
                }
            } catch (err) {
                console.error('Login error:', err);
                setError(err.message || t('auth.login.error'));
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bordeaux/10 via-white to-gold/10 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-50 relative overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-bordeaux/5 rounded-full -ml-12 -mb-12"></div>

                <div className="relative">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/10 rounded-2xl mb-6">
                            <FaChurch className="h-10 w-10 text-gold" />
                        </div>
                        <h2 className="text-4xl font-playfair font-bold text-bordeaux mb-2">{t('auth.login.title')}</h2>
                        <p className="text-gray-500 font-medium">{t('auth.login.subtitle')}</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-center"
                        >
                            <span className="flex-grow">{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t('auth.login.email')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <FaEnvelope className="h-4 w-4" />
                                </span>
                                <input
                                    id="email"
                                    type="text"
                                    {...formik.getFieldProps('email')}
                                    placeholder="Email ou nom d'utilisateur"
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all font-medium"
                                />
                            </div>
                            {formik.touched.email && formik.errors.email ? (
                                <div className="text-red-500 text-[10px] font-bold mt-1 px-1 uppercase tracking-tight">{formik.errors.email}</div>
                            ) : null}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest">{t('auth.login.password')}</label>
                                <Link to="/forgot-password" title="Mot de passe oublié ?" className="text-[10px] font-bold text-gold uppercase tracking-widest hover:text-bordeaux transition-all">{t('auth.login.forgot')}</Link>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <FaLock className="h-4 w-4" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    {...formik.getFieldProps('password')}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all font-medium"
                                />
                            </div>
                            {formik.touched.password && formik.errors.password ? (
                                <div className="text-red-500 text-[10px] font-bold mt-1 px-1 uppercase tracking-tight">{formik.errors.password}</div>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-gold to-lightGold text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    {t('auth.login.loading')}
                                </>
                            ) : t('auth.login.submit')}
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-sm text-gray-500">
                            {t('auth.login.no_account')}{' '}
                            <Link to="/register" className="text-gold font-bold hover:underline">
                                {t('auth.login.signup')}
                            </Link>
                        </p>

                        <div className="pt-4 border-t border-gray-50">
                            <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-bordeaux transition-all uppercase tracking-widest group">
                                <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                {t('auth.login.back')}
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Home Button */}
            <Link
                to="/"
                className="fixed top-8 left-8 flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md text-bordeaux rounded-full shadow-xl border border-white/50 hover:bg-white hover:scale-105 transition-all font-bold group z-50"
            >
                <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Retour au Site</span>
            </Link>
        </div>
    );
};

export default Login;
