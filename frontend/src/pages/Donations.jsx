import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FaDonate,
    FaHandHoldingHeart,
    FaChurch,
    FaUsers,
    FaGlobe,
    FaWhatsapp,
    FaCheckCircle,
} from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'

const Donations = () => {
    const { t } = useLanguage()
    const [selectedProject, setSelectedProject] = useState('general')

    const projects = [
        {
            id: 'general',
            title: t('home.donations.projects.general.title'),
            description: t('home.donations.projects.general.desc'),
            icon: FaChurch,
            color: 'from-gold to-lightGold',
            features: t('home.donations.projects.general.features', { returnObjects: true })
        },
        {
            id: 'missions',
            title: t('home.donations.projects.missions.title'),
            description: t('home.donations.projects.missions.desc'),
            icon: FaGlobe,
            color: 'from-royalBlue to-blue-400',
            features: t('home.donations.projects.missions.features', { returnObjects: true })
        },
        {
            id: 'benevolence',
            title: t('home.donations.projects.benevolence.title'),
            description: t('home.donations.projects.benevolence.desc'),
            icon: FaHandHoldingHeart,
            color: 'from-bordeaux to-pink-600',
            features: t('home.donations.projects.benevolence.features', { returnObjects: true })
        },
        {
            id: 'youth',
            title: t('home.donations.projects.youth.title'),
            description: t('home.donations.projects.youth.desc'),
            icon: FaUsers,
            color: 'from-green-500 to-emerald-400',
            features: t('home.donations.projects.youth.features', { returnObjects: true })
        }
    ]

    const selectedProjectData = projects.find(p => p.id === selectedProject) || projects[0]

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gold to-lightGold rounded-full mb-4">
                        <FaDonate className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-playfair font-bold text-bordeaux mb-2">
                        {t('home.donations.title')}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t('home.donations.subtitle')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column - Project Selection */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h2 className="text-2xl font-bold text-bordeaux mb-6">{t('home.donations.projects.title')}</h2>
                            <div className="space-y-4">
                                {projects.map((project) => {
                                    const Icon = project.icon
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => setSelectedProject(project.id)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${selectedProject === project.id
                                                ? `border-gold bg-gradient-to-r ${project.color}/10 transform scale-[1.02] shadow-md`
                                                : 'border-gray-100 hover:border-gold/50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-3 rounded-lg bg-gradient-to-r ${project.color} shrink-0`}>
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                                                    <p className="text-gray-600 text-sm hidden sm:block">{project.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - WhatsApp Donation */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-24"
                    >
                        <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${selectedProjectData.color} mb-6`}>
                            <selectedProjectData.icon className="h-8 w-8 text-white" />
                        </div>

                        <h2 className="text-3xl font-bold text-bordeaux mb-4">
                            Soutenir : {selectedProjectData.title}
                        </h2>

                        <p className="text-gray-600 mb-6 text-lg">
                            {selectedProjectData.description}
                        </p>

                        <div className="space-y-3 mb-8">
                            {selectedProjectData.features && selectedProjectData.features.map((feature, index) => (
                                <div key={index} className="flex items-center text-gray-700">
                                    <FaCheckCircle className="h-5 w-5 text-gold mr-3 shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                            <h3 className="font-bold text-gray-900 mb-2">Comment faire un don ?</h3>
                            <p className="text-gray-600 mb-4">
                                Pour effectuer un don, veuillez nous contacter directement via WhatsApp. Nous vous transmettrons les coordonnées bancaires ou les moyens de paiement disponibles.
                            </p>
                            <a
                                href="https://wa.me/905338748646?text=Bonjour, je souhaite faire un don pour le projet : "
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <FaWhatsapp className="mr-3 h-6 w-6" />
                                Faire un don via WhatsApp
                            </a>
                        </div>

                        <p className="text-center text-sm text-gray-400">
                            {t('home.donations.tax.desc')}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Donations
