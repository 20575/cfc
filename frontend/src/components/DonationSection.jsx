import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaDonate, FaHandHoldingHeart, FaChurch, FaUsers, FaCheckCircle, FaWhatsapp, FaQuoteLeft } from 'react-icons/fa'

const DonationSection = () => {
    const [selectedProject, setSelectedProject] = useState('general')

    const projects = [
        {
            id: 'general',
            title: 'Fonds Général',
            description: 'Soutenir les besoins quotidiens de l\'église (loyer, équipements, événements)',
            icon: FaChurch,
            color: 'from-gold to-lightGold'
        },
        {
            id: 'missions',
            title: 'Missions',
            description: 'Soutenez la mission à l\'étranger',
            icon: FaUsers,
            color: 'from-royalBlue to-blue-400'
        },
        {
            id: 'benevolence',
            title: 'Fonds de Bienveillance',
            description: 'Aidez les membres dans le besoin',
            icon: FaHandHoldingHeart,
            color: 'from-bordeaux to-pink-600'
        }
    ]

    const selectedProjectData = projects.find(p => p.id === selectedProject) || projects[0]

    return (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-playfair font-bold text-bordeaux mb-4">
                        Soutenez <span className="text-gradient">Notre Mission</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Votre don contribue à répandre l'Évangile et à soutenir notre communauté à Chypre "Cyprus For Christ"
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Projects */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-bold text-bordeaux mb-6">Choisissez un projet</h3>
                        <div className="space-y-4 mb-8">
                            {projects.map((project) => {
                                const Icon = project.icon
                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProject(project.id)}
                                        className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${selectedProject === project.id
                                            ? `border-gold bg-gradient-to-r ${project.color}/10 shadow-lg scale-[1.02]`
                                            : 'border-gray-200 hover:border-gold/50 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-lg bg-gradient-to-r ${project.color}`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-800">{project.title}</h4>
                                                <p className="text-gray-600 text-sm">{project.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>

                    {/* Right Column - WhatsApp CTA */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
                    >
                        <div className={`inline-block p-3 rounded-full bg-gradient-to-r ${selectedProjectData.color} mb-4`}>
                            <selectedProjectData.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-bordeaux mb-4">
                            Faire un don pour : {selectedProjectData.title}
                        </h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Pour effectuer votre don, nous vous invitons à nous contacter directement sur WhatsApp. Nous pourrons ainsi vous guider et vous fournir les informations nécessaires en toute sécurité.
                        </p>

                        <a
                            href="https://wa.me/905338748646?text=Bonjour, je souhaite soutenir le projet : "
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <FaWhatsapp className="mr-3 h-6 w-6" />
                            Contacter pour Donner
                        </a>

                        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                            <FaCheckCircle className="text-gold mr-2" />
                            <span>Réponse rapide & Sécurisée</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default DonationSection
