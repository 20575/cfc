import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPray, FaHeart, FaHandsHelping, FaLock, FaPaperPlane, FaLeaf, FaDove } from 'react-icons/fa'
import { useForm } from 'react-hook-form'

const prayerTypes = [
    { id: 'healing', label: 'Guérison', icon: FaHeart, color: 'from-red-400 to-pink-500' },
    { id: 'peace', label: 'Paix', icon: FaDove, color: 'from-blue-400 to-cyan-500' },
    { id: 'guidance', label: 'Direction', icon: FaLeaf, color: 'from-green-400 to-emerald-500' },
    { id: 'provision', label: 'Pourvoyance', icon: FaHandsHelping, color: 'from-yellow-400 to-orange-500' },
    { id: 'family', label: 'Famille', icon: FaHeart, color: 'from-purple-400 to-pink-500' },
    { id: 'other', label: 'Autre', icon: FaPray, color: 'from-gray-400 to-gray-600' }
]

import { useAuth } from '../context/AuthContext'

const PrayerRequests = () => {
    const { user } = useAuth()
    const [requests, setRequests] = useState([])

    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedType, setSelectedType] = useState('healing')

    const onSubmit = async (data) => {
        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${baseUrl}/prayers/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    title: data.request.substring(0, 50) + (data.request.length > 50 ? "..." : ""),
                    content: data.request,
                    is_anonymous: data.isAnonymous,
                    full_name: data.isAnonymous ? '' : data.name,
                    email: data.email || '',  // Ajouter l'email
                }),
            })

            if (response.ok) {
                const newRequest = await response.json()
                // setRequests(prev => [newRequest, ...prev]) // If we want to show it immediately
                reset()
                alert('Votre demande de prière a été envoyée. L\'équipe de prière prie pour vous!')
            } else {
                throw new Error('Erreur lors de l\'envoi')
            }
        } catch (error) {
            console.error(error)
            alert("Une erreur est survenue. Veuillez réessayer.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const incrementPrayers = (id) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, prayersCount: req.prayersCount + 1 } : req
        ))
    }

    const getPrayerTypeInfo = (typeId) => {
        return prayerTypes.find(t => t.id === typeId) || prayerTypes[prayerTypes.length - 1]
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-purple-50/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gold to-lightGold rounded-full mb-4">
                        <FaPray className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-playfair font-bold text-bordeaux mb-2">
                        Requêtes de Prière
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Partagez vos besoins en prière. Notre communauté à Cyprus For Christ est là pour vous soutenir dans l'intercession.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Prayer Types & Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Prayer Type Selection */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-bold text-bordeaux mb-6">Type de prière</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {prayerTypes.map((type) => {
                                    const Icon = type.icon
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${selectedType === type.id
                                                ? `border-gold bg-gradient-to-r ${type.color} text-white transform scale-105`
                                                : 'border-gray-200 hover:border-gold/50 hover:shadow-md'
                                                }`}
                                        >
                                            <Icon className="h-8 w-8 mx-auto mb-2" />
                                            <span className="font-medium">{type.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* Prayer Request Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-bold text-bordeaux mb-6">Soumettre une demande</h3>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">Votre nom (optionnel)</label>
                                    <input
                                        {...register('name')}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                                        placeholder="Votre nom"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Email *</label>
                                    <input
                                        {...register('email', {
                                            required: 'L\'adresse email est requise pour recevoir la confirmation',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Adresse email invalide'
                                            }
                                        })}
                                        type="email"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="votre@email.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Votre demande de prière *</label>
                                    <textarea
                                        {...register('request', { required: 'Ce champ est requis' })}
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                                        placeholder="Décrivez votre besoin de prière..."
                                    />
                                    {errors.request && (
                                        <p className="text-red-500 text-sm mt-1">{errors.request.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register('isAnonymous')}
                                        id="anonymous"
                                        className="h-5 w-5 text-gold rounded focus:ring-gold"
                                    />
                                    <label htmlFor="anonymous" className="ml-3 text-gray-700">
                                        <div className="flex items-center">
                                            <FaLock className="h-4 w-4 mr-2" />
                                            Rendre cette demande anonyme
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Votre nom ne sera pas affiché publiquement
                                        </p>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-gold to-lightGold text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane className="mr-3" />
                                            Envoyer ma demande de prière
                                        </>
                                    )}
                                </button>

                                <p className="text-sm text-gray-500 text-center">
                                    Toutes les demandes sont traitées avec confidentialité et amour.
                                    Notre équipe de prière prie quotidiennement pour chaque requête.
                                </p>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column - Recent Requests & Encouragement */}
                    <div className="space-y-8">
                        {/* Encouragement Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-gold/20 to-lightGold/20 rounded-2xl p-6 border border-gold/30"
                        >
                            <FaHeart className="h-12 w-12 text-gold mb-4" />
                            <h3 className="text-xl font-bold text-bordeaux mb-4">Dieu vous entend</h3>
                            <p className="text-gray-700 mb-4">
                                "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces."
                            </p>
                            <p className="text-sm text-gray-600">Philippiens 4:6</p>
                        </motion.div>

                        {/* Recent Prayer Requests - Only visible to Pastors/Admins */}
                        {/* Prayer Team Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-r from-royalBlue to-blue-600 rounded-2xl p-6 text-white"
                        >
                            <h3 className="text-xl font-bold mb-2">Équipe de Prière</h3>
                            <p className="mb-4 opacity-90">
                                Notre équipe prie chaque jour pour toutes les requêtes reçues.
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">24/7</p>
                                    <p className="text-sm opacity-90">Prières continues</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">15</p>
                                    <p className="text-sm opacity-90">Intercesseurs</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrayerRequests
