import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaPhone,
    FaCalendarAlt,
    FaChurch,
    FaCheck,
    FaArrowLeft
} from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

const Register = () => {
    const { t } = useLanguage()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [generalError, setGeneralError] = useState(null)
    const navigate = useNavigate()
    const { register: registerUser, isAuthenticated, user, loading: authLoading } = useAuth()

    React.useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            if (user.role === 'ADMIN' || user.role === 'PASTOR') {
                navigate('/admin')
            } else {
                navigate('/profile')
            }
        }
    }, [isAuthenticated, user, authLoading, navigate])

    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const password = watch('password')

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        setGeneralError(null)

        try {
            // Intégration avec AuthContext
            await registerUser({
                first_name: data.firstName,
                last_name: data.lastName,
                username: data.email, // Use email as username
                email: data.email,
                phone_number: data.phone,
                birth_date: data.birthDate,
                password: data.password
            })

            // Get user data to check role
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
                    navigate('/admin');
                } else if (userData.role === 'PASTOR') {
                    navigate('/pastor');
                } else {
                    navigate('/member');
                }
            } else {
                navigate('/member');
            }
        } catch (error) {
            console.error('Registration error:', error)
            setGeneralError(error.message || t('auth.register.validation.error_generic'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = () => {
        if (step < 3) setStep(step + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const progressPercentage = ((step - 1) / 2) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-bordeaux/10 via-purple-50/50 to-gold/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        {/* Left Side - Illustration */}
                        <div className="md:w-2/5 bg-gradient-to-br from-bordeaux to-purple-800 p-12 text-white hidden md:block">
                            <div className="h-full flex flex-col justify-center">
                                <div className="mb-8">
                                    <Link to="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
                                        <FaArrowLeft className="mr-2" />
                                        {t('auth.register.buttons.prev_home')}
                                    </Link>
                                </div>

                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                                        <FaChurch className="h-10 w-10 text-gold" />
                                    </div>
                                    <h2 className="text-3xl font-playfair font-bold mb-4">
                                        {t('auth.register.side_title')}
                                    </h2>
                                    <p className="text-white/80 leading-relaxed">
                                        {t('auth.register.side_desc')}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { icon: FaCheck, text: t('auth.register.benefits.sermons') },
                                        { icon: FaCheck, text: t('auth.register.benefits.prayer') },
                                        { icon: FaCheck, text: t('auth.register.benefits.history') },
                                        { icon: FaCheck, text: t('auth.register.benefits.events') },
                                        { icon: FaCheck, text: t('auth.register.benefits.groups') }
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="p-1 bg-gold/20 rounded-full mr-3">
                                                <item.icon className="h-3 w-3 text-gold" />
                                            </div>
                                            <span className="text-sm">{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 pt-8 border-t border-white/20">
                                    <p className="text-sm text-white/70">
                                        {t('auth.register.already_member')}{' '}
                                        <Link to="/login" className="text-gold hover:text-lightGold transition-colors font-semibold">
                                            {t('auth.register.login_link')}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Registration Form */}
                        <div className="md:w-3/5 p-8 md:p-12">
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-bordeaux">{t('auth.register.steps.progress', { current: step, total: 3 })}</span>
                                    <span className="text-sm font-medium text-bordeaux">{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-gold to-lightGold"
                                    />
                                </div>
                                <div className="flex justify-between mt-4">
                                    <div className={`text-center ${step >= 1 ? 'text-gold font-semibold' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs ${step >= 1 ? 'bg-gold text-white' : 'bg-gray-200'
                                            }`}>
                                            1
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider">{t('auth.register.steps.info')}</span>
                                    </div>
                                    <div className={`text-center ${step >= 2 ? 'text-gold font-semibold' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs ${step >= 2 ? 'bg-gold text-white' : 'bg-gray-200'
                                            }`}>
                                            2
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider">{t('auth.register.steps.contact')}</span>
                                    </div>
                                    <div className={`text-center ${step >= 3 ? 'text-gold font-semibold' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs ${step >= 3 ? 'bg-gold text-white' : 'bg-gray-200'
                                            }`}>
                                            3
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider">{t('auth.register.steps.account')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-playfair font-bold text-bordeaux mb-2">
                                    {t('auth.register.title')}
                                </h1>
                                <p className="text-gray-600">
                                    {t('auth.register.subtitle')}
                                </p>
                            </div>



                            {generalError && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{generalError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Step 1: Personal Information */}
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 mb-2 text-sm font-semibold">
                                                    <FaUser className="inline h-4 w-4 mr-2 text-gold" />
                                                    {t('auth.register.fields.firstname')}
                                                </label>
                                                <input
                                                    {...register('firstName', { required: t('auth.register.validation.required') })}
                                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all"
                                                    placeholder={t('auth.register.placeholders.firstname')}
                                                />
                                                {errors.firstName && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-2 text-sm font-semibold">
                                                    <FaUser className="inline h-4 w-4 mr-2 text-gold" />
                                                    {t('auth.register.fields.lastname')}
                                                </label>
                                                <input
                                                    {...register('lastName', { required: t('auth.register.validation.required') })}
                                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all"
                                                    placeholder={t('auth.register.placeholders.lastname')}
                                                />
                                                {errors.lastName && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 mb-2 text-sm font-semibold">
                                                <FaCalendarAlt className="inline h-4 w-4 mr-2 text-gold" />
                                                {t('auth.register.fields.birthdate')}
                                            </label>
                                            <input
                                                {...register('birthDate', { required: t('auth.register.validation.required') })}
                                                type="date"
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all"
                                            />
                                            {errors.birthDate && (
                                                <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="bg-gradient-to-r from-gold to-lightGold text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                            >
                                                {t('auth.register.buttons.next')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Contact Information */}
                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-gray-700 mb-2 text-sm font-semibold">
                                                <FaEnvelope className="inline h-4 w-4 mr-2 text-gold" />
                                                {t('auth.register.fields.email')}
                                            </label>
                                            <input
                                                {...register('email', {
                                                    required: t('auth.register.validation.required'),
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: t('auth.register.validation.email')
                                                    }
                                                })}
                                                type="email"
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all"
                                                placeholder={t('auth.register.placeholders.email')}
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 mb-2 text-sm font-semibold">
                                                <FaPhone className="inline h-4 w-4 mr-2 text-gold" />
                                                {t('auth.register.fields.phone')}
                                            </label>
                                            <input
                                                {...register('phone')}
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all"
                                                placeholder={t('auth.register.placeholders.phone')}
                                            />
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-bold hover:border-gold hover:text-gold transition-all"
                                            >
                                                {t('auth.register.buttons.prev')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="bg-gradient-to-r from-gold to-lightGold text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                            >
                                                {t('auth.register.buttons.next')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Account Setup */}
                                {step === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-gray-700 mb-2 text-sm font-semibold">
                                                <FaLock className="inline h-4 w-4 mr-2 text-gold" />
                                                {t('auth.register.fields.password')}
                                            </label>
                                            <input
                                                {...register('password', {
                                                    required: t('auth.register.validation.required'),
                                                    minLength: {
                                                        value: 8,
                                                        message: t('auth.register.validation.password_min')
                                                    }
                                                })}
                                                type="password"
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all"
                                                placeholder={t('auth.register.placeholders.password')}
                                            />
                                            {errors.password && (
                                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                            )}
                                            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                                                <div className={`flex items-center ${password?.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                                                    <FaCheck className="h-2 w-2 mr-1" />
                                                    <span>{t('auth.register.password_rules.length')}</span>
                                                </div>
                                                <div className={`flex items-center ${/[A-Z]/.test(password || '') ? 'text-green-500' : 'text-gray-400'}`}>
                                                    <FaCheck className="h-2 w-2 mr-1" />
                                                    <span>{t('auth.register.password_rules.upper')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 mb-2 text-sm font-semibold">
                                                <FaLock className="inline h-4 w-4 mr-2 text-gold" />
                                                {t('auth.register.fields.confirm')}
                                            </label>
                                            <input
                                                {...register('confirmPassword', {
                                                    required: t('auth.register.validation.required'),
                                                    validate: value => value === password || t('auth.register.validation.password_match')
                                                })}
                                                type="password"
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all"
                                                placeholder={t('auth.register.placeholders.confirm')}
                                            />
                                            {errors.confirmPassword && (
                                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                                            )}
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                {...register('acceptTerms', {
                                                    required: t('auth.register.validation.terms')
                                                })}
                                                type="checkbox"
                                                id="terms"
                                                className="h-4 w-4 text-gold rounded border-gray-300 focus:ring-gold mt-1"
                                            />
                                            <label htmlFor="terms" className="ml-3 text-xs text-gray-600">
                                                {t('auth.register.fields.terms')}{' '}
                                                <Link to="/terms" className="text-gold hover:underline font-bold">{t('auth.register.fields.terms_link')}</Link>
                                                {' '}et la{' '}
                                                <Link to="/privacy" className="text-gold hover:underline font-bold">{t('auth.register.fields.privacy_link')}</Link>
                                            </label>
                                        </div>
                                        {errors.acceptTerms && (
                                            <p className="text-red-500 text-[10px] mt-1">{errors.acceptTerms.message}</p>
                                        )}

                                        <div className="flex justify-between pt-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-bold hover:border-gold hover:text-gold transition-all"
                                            >
                                                {t('auth.register.buttons.prev')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="bg-gradient-to-r from-gold to-lightGold text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        {t('auth.register.buttons.loading')}
                                                    </>
                                                ) : (
                                                    t('auth.register.buttons.submit')
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>

                            {/* Mobile Footer */}
                            <div className="mt-8 pt-8 border-t border-gray-100 md:hidden">
                                <p className="text-center text-sm text-gray-500">
                                    {t('auth.register.already_member')}{' '}
                                    <Link to="/login" className="text-gold font-bold hover:underline">
                                        {t('auth.register.login_link')}
                                    </Link>
                                </p>
                                <div className="text-center mt-4">
                                    <Link to="/" className="inline-flex items-center text-xs text-gray-400 hover:text-bordeaux transition-colors">
                                        <FaArrowLeft className="mr-1" />
                                        {t('auth.register.buttons.prev_home')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div >

            {/* Floating Home Button */}
            < Link
                to="/"
                className="fixed top-8 left-8 flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md text-bordeaux rounded-full shadow-xl border border-white/50 hover:bg-white hover:scale-105 transition-all font-bold group z-50 md:flex hidden"
            >
                <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Retour au Site</span>
            </Link >
        </div >
    )
}

export default Register
