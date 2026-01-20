import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaHistory, FaUserTie, FaQuoteLeft, FaChurch, FaHandHoldingHeart, FaGlobe } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'

// Assets (reusing from Home or similar)
import visionaryImg from '../assets/images/IMG_8403.JPG'
import communityImg from '../assets/images/IMG_8404.JPG'

const About = () => {
    const { t } = useLanguage()
    const [visionary, setVisionary] = useState(null)
    const [historyContent, setHistoryContent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
                const [visionaryRes, sectionsRes] = await Promise.all([
                    fetch(`${baseUrl}/about/visionaries/`),
                    fetch(`${baseUrl}/about/sections/`)
                ])

                if (visionaryRes.ok) {
                    const data = await visionaryRes.json();
                    const items = data.results || data;
                    if (items.length > 0) setVisionary(items[0]);
                }

                if (sectionsRes.ok) {
                    const data = await sectionsRes.json();
                    const items = data.results || data;
                    const history = items.find(s => s.type === 'HISTORY');
                    if (history) setHistoryContent(history);
                }
            } catch (error) {
                console.error("Error fetching about data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Fallback static content if no dynamic data
    const staticHistory = (
        <>
            <p>
                <strong>Cyprus For Christ</strong> est né dans la discrétion et la simplicité, porté par un feu intérieur : celui de rassembler les croyants et d’aller à la rencontre de ceux dont le cœur s’était éloigné de Dieu sur l’île de Chypre. Rien n’était spectaculaire au départ, sinon la foi sincère et l’espérance vivante de quelques personnes convaincues que Dieu pouvait agir, même à partir de presque rien.
            </p>
            <p>
                Tout a commencé dans l’intimité d’un salon, autour de prières murmurées, de louanges sincères et d’un profond désir de voir Dieu toucher des vies. Ces rencontres modestes, baignées d’amour et de persévérance, sont rapidement devenues un lieu de transformation. La présence de Dieu s’y manifestait avec force : des cœurs brisés étaient restaurés, des vies trouvaient un sens nouveau, et l’Évangile prenait racine là où l’on ne l’attendait pas toujours.
            </p>
            <p>
                Au fil du temps, la main de Dieu s’est révélée de manière évidente. Des portes se sont ouvertes, parfois de façon inattendue. Des miracles ont marqué le chemin, confirmant que cette œuvre ne reposait pas sur des moyens humains, mais sur une grâce divine fidèle. Dieu a pourvu, pas à pas, aux besoins matériels comme spirituels : des lieux pour se rassembler, des équipements pour servir, et les ressources nécessaires pour étendre la mission.
            </p>
            <p>
                Aujourd’hui, <strong>Cyprus For Christ</strong> est bien plus qu’un ministère : c’est une famille. Une communauté multiculturelle, riche de ses différences, unie par une même foi et un même amour pour Jésus-Christ. Ensemble, nous avançons avec humilité et reconnaissance, conscients que cette histoire continue de s’écrire, guidée par Dieu, au service de l’île de Chypre et au-delà.
            </p>
        </>
    )

    return (
        <div className="font-sans antialiased text-gray-900 bg-white">
            {/* Header / Hero */}
            <section className="relative py-20 bg-compassion-purple text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-extrabold mb-4"
                    >
                        À Propos de Nous
                    </motion.h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                        Découvrez l'histoire de Cyprus For Christ et la vision qui nous anime.
                    </p>
                </div>
            </section>

            {/* Visionary Biography Section */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={visionary?.photo || visionaryImg}
                                alt="Visionnaire"
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <div>
                                    <h3 className="text-white text-2xl font-bold">{visionary?.name || "Pasteur Vincent Kabamba"}</h3>
                                    <p className="text-gold font-medium">{visionary?.title || "Visionnaire & Fondateur"}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2 space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <FaUserTie className="text-compassion-purple text-2xl" />
                            <h2 className="text-3xl font-bold text-gray-900">Biographie du Visionnaire</h2>
                        </div>

                        <div className="prose prose-lg text-gray-600">
                            {visionary?.biography ? (
                                <div dangerouslySetInnerHTML={{ __html: visionary.biography.replace(/\n/g, '<br/>') }} />
                            ) : (
                                <>
                                    <p>
                                        L'histoire de <strong>Cyprus For Christ</strong> est intrinsèquement liée à la vision reçue par le <strong>Pasteur Vincent Kabamba</strong>.
                                    </p>
                                    <p>
                                        Appelé par Dieu pour servir cette génération, le Pasteur Vincent a consacré sa vie à l'enseignement de la parole et à l'édification des âmes. Son parcours est marqué par une passion inébranlable pour voir des vies transformées par l'Évangile.
                                    </p>
                                    <p>
                                        Arrivé à Chypre avec une mission claire, il a fondé Cyprus For Christ non seulement comme une église, mais comme un mouvement de réveil spirituel. Sa prédication, centrée sur la grâce, la foi et la puissance du Saint-Esprit, touche aujourd'hui des milliers de personnes.
                                    </p>
                                    <blockquote className="border-l-4 border-gold pl-4 italic bg-gray-50 p-4 rounded-r-lg">
                                        "Notre mission n'est pas seulement de remplir une salle, mais de remplir le Ciel et d'impacter la terre."
                                    </blockquote>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* History Section */}
            <section className="py-20 bg-gray-50 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <FaHistory className="text-4xl text-gold mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-gray-900">{historyContent?.title || 'Notre Histoire'}</h2>
                        <div className="w-24 h-1 bg-compassion-purple mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6 text-gray-700 leading-relaxed text-lg"
                        >
                            {historyContent ? (
                                <div dangerouslySetInnerHTML={{ __html: historyContent.content.replace(/\n/g, '<br/>') }} />
                            ) : (
                                staticHistory
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <img
                                src={historyContent?.image || communityImg}
                                alt="Communauté"
                                className="rounded-2xl shadow-xl w-full"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg max-w-xs hidden md:block">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaChurch className="text-compassion-purple" />
                                    <span className="font-bold text-gray-900">Une Maison pour Tous</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Peu importe d'où vous venez, vous avez une place parmi nous.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values / Mission */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    <ValueCard
                        icon={<FaGlobe />}
                        title="Vision Globale"
                        desc="Nous croyons que l'impact de l'Évangile ne connaît pas de frontières. Nous sommes appelés à influencer les nations."
                    />
                    <ValueCard
                        icon={<FaHandHoldingHeart />}
                        title="Compassion"
                        desc="L'amour de Dieu se manifeste par nos actions envers les autres. Nous servons notre communauté avec générosité."
                    />
                    <ValueCard
                        icon={<FaChurch />}
                        title="Communauté"
                        desc="Nous ne sommes pas juste une foule, nous sommes une famille. Nous grandissons ensemble dans la foi."
                    />
                </div>
            </section>
        </div>
    )
}

const ValueCard = ({ icon, title, desc }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:-translate-y-2 transition-duration-300">
        <div className="text-4xl text-gold mb-6 flex justify-center">{icon}</div>
        <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
        <p className="text-gray-600">{desc}</p>
    </div>
)

export default About
