import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlay, FaArrowRight, FaPray, FaHandHoldingHeart, FaUsers, FaBible, FaPhone } from 'react-icons/fa'
import { motion } from 'framer-motion'

// Assets
import heroBg from '../assets/images/IMG_8402.JPG'
import visionaryImg from '../assets/images/IMG_8403.JPG'
import communityImg from '../assets/images/IMG_8404.JPG'

// Import existing components
import RecentSermons from '../components/RecentSermons'
import RhemaOfTheDay from '../components/RhemaOfTheDay'
import EventsCarousel from '../components/EventsCarousel'
import DonationSection from '../components/DonationSection'
import Testimonials from '../components/Testimonials'

import { useLanguage } from '../context/LanguageContext'

const Home = () => {
    const { t } = useLanguage()
    const [visionary, setVisionary] = useState(null)

    useEffect(() => {
        const fetchVisionary = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
                const res = await fetch(`${baseUrl}/about/visionaries/`)
                if (res.ok) {
                    const data = await res.json()
                    const items = data.results || data
                    if (items.length > 0) setVisionary(items[0])
                }
            } catch (error) {
                console.error("Error fetching visionary:", error)
            }
        }
        fetchVisionary()
    }, [])

    return (
        <div className="font-sans antialiased text-gray-900 bg-white selection:bg-compassion-purple selection:text-white">

            {/* HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroBg}
                        alt="Background Culte"
                        className="w-full h-full object-cover transform scale-105"
                    />
                    <div className="absolute inset-0 bg-black/70" /> {/* Increased contrast */}
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto space-y-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none uppercase"
                    >
                        {t('home.hero.title')}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm md:text-base font-bold tracking-[0.2em] uppercase text-gray-300"
                    >
                        <span>Former</span>
                        <span className="hidden md:block">•</span>
                        <span>Transformer</span>
                        <span className="hidden md:block">•</span>
                        <span>Exposer</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="pt-8 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            to="/sermons"
                            className="bg-compassion-purple text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-opacity-90 transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2 shadow-2xl"
                        >
                            {t('home.hero.watch_sermons')} <FaPlay />
                        </Link>
                        <Link
                            to="/prayer-requests"
                            className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all inline-flex items-center justify-center gap-2"
                        >
                            {t('home.hero.request_prayer')} <FaPray />
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce"
                >
                    <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent mx-auto"></div>
                </motion.div>
            </section>

            {/* RHEMA OF THE DAY */}
            <RhemaOfTheDay />

            {/* NOTRE HISTOIRE (Dark Section) */}
            <section className="relative bg-gradient-to-br from-compassion-dark via-gray-900 to-black text-white py-24 px-6 overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-compassion-purple/10 via-transparent to-compassion-purple/10 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center relative z-10 space-y-8"
                >
                    <h2 className="text-sm font-bold tracking-[0.2em] text-compassion-purple uppercase">{t('home.history.title')}</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold leading-tight">
                        {t('home.history.subtitle')}
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        {t('home.history.text')}
                    </p>
                    <Link to="/about" className="inline-block border-b-2 border-white pb-1 hover:text-compassion-purple hover:border-compassion-purple transition-all font-bold uppercase tracking-wider text-sm mt-4">
                        {t('home.history.more')}
                    </Link>
                </motion.div>
            </section>

            {/* PROGRAMMES / SERVICES (Deep Purple Section) */}
            <section className="bg-compassion-purple text-white py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8"
                    >
                        <div className="max-w-xl">
                            <h2 className="text-5xl font-extrabold mb-6">{t('home.programs.title')}</h2>
                            <p className="text-white/80 text-lg">
                                {t('home.programs.subtitle')}
                            </p>
                        </div>
                        <Link to="/contact" className="bg-white text-compassion-purple px-8 py-3 rounded-full font-bold uppercase text-sm hover:bg-gray-100 transition-colors">
                            {t('home.programs.view_agenda')}
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <ProgramCard
                            icon={<FaUsers className="text-4xl" />}
                            title={t('home.programs.sunday_service.title')}
                            time={t('home.programs.sunday_service.time')}
                            desc={t('home.programs.sunday_service.desc')}
                            link="/sermons"
                            moreText={t('home.programs.learn_more')}
                        />
                        <ProgramCard
                            icon={<FaPray className="text-4xl" />}
                            title={t('home.programs.prayer_intercession.title')}
                            time={t('home.programs.prayer_intercession.time')}
                            desc={t('home.programs.prayer_intercession.desc')}
                            link="/prayer-requests"
                            moreText={t('home.programs.learn_more')}
                        />
                        <ProgramCard
                            icon={<FaBible className="text-4xl" />}
                            title={t('home.programs.bible_ai.title')}
                            time={t('home.programs.bible_ai.time')}
                            desc={t('home.programs.bible_ai.desc')}
                            link="/bible-ai"
                            moreText={t('home.programs.learn_more')}
                        />
                        <ProgramCard
                            icon={<FaHandHoldingHeart className="text-4xl" />}
                            title={t('home.programs.support.title')}
                            time={t('home.programs.support.time')}
                            desc={t('home.programs.support.desc')}
                            link="/donations"
                            moreText={t('home.programs.learn_more')}
                        />
                    </div>
                </div>
            </section>

            {/* RECENT SERMONS */}
            <RecentSermons />

            {/* VISIONARY (Split Section) */}
            <section className="flex flex-col md:flex-row min-h-[80vh]">
                <div className="md:w-1/2 relative min-h-[50vh]">
                    <img
                        src={visionary?.photo || visionaryImg}
                        alt="Visionnaire"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="md:w-1/2 bg-gray-50 flex flex-col justify-center p-12 md:p-16 space-y-6"
                >
                    <h2 className="text-sm font-bold tracking-[0.2em] text-compassion-purple uppercase">{visionary?.title || t('home.visionary.label')}</h2>
                    <h3 className="text-4xl font-extrabold text-gray-900">{visionary?.name || t('home.visionary.title')}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed line-clamp-6">
                        {visionary?.biography || t('home.visionary.desc')}
                    </p>
                    <div className="pt-4">
                        <Link to="/about" className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase text-sm hover:bg-compassion-purple transition-all">
                            {t('home.visionary.read_bio')}
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* EVENTS CAROUSEL */}
            <EventsCarousel />

            {/* MEDIA / ENSEIGNEMENTS (Split Section Reversed) */}
            <section className="flex flex-col md:flex-row-reverse bg-black text-white">
                <div className="md:w-1/2 relative min-h-[50vh] bg-gray-900 flex items-center justify-center group cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundImage: `url(${communityImg})` }}></div>
                    <Link to="/sermons" className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                        <FaPlay className="ml-1 text-2xl text-white" />
                    </Link>
                </div>
                <div className="md:w-1/2 flex flex-col justify-center p-12 md:p-24 space-y-6">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-red-500 uppercase">{t('home.media.label')}</h2>
                    <h3 className="text-4xl font-extrabold">{t('home.media.title')}</h3>
                    <p className="text-gray-400 text-lg">
                        {t('home.media.desc')}
                    </p>
                    <div className="pt-4">
                        <Link to="/sermons" className="inline-flex items-center gap-3 font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                            {t('home.media.view_all')} <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <Testimonials />

            {/* DONATION SECTION */}
            <DonationSection />

            {/* CONTACT BANNER */}
            <section className="py-24 bg-compassion-purple text-center px-6 text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <FaPhone className="text-6xl mx-auto mb-4 animate-pulse" />
                    <h2 className="text-4xl font-extrabold">{t('home.contact_banner.title')}</h2>
                    <p className="text-white/80 text-lg">
                        {t('home.contact_banner.desc')}
                    </p>
                    <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact" className="bg-white text-compassion-purple px-10 py-5 rounded-full font-bold uppercase text-sm shadow-xl hover:bg-gray-100 transition-all">
                            {t('home.contact_banner.contact_us')}
                        </Link>
                        <Link to="/prayer-requests" className="border-2 border-white text-white px-10 py-5 rounded-full font-bold uppercase text-sm hover:bg-white hover:text-compassion-purple transition-all">
                            {t('home.contact_banner.request_prayer')}
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}

// Helper Component for Program Cards
const ProgramCard = ({ icon, title, time, desc, link, moreText }) => (
    <Link
        to={link}
        className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-300 group block"
    >
        <div className="mb-6 text-white/80 group-hover:text-white transition-colors">
            {icon}
        </div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <div className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">{time}</div>
        <p className="text-white/70 leading-relaxed">
            {desc}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all">
            {moreText} <FaArrowRight className="text-xs" />
        </div>
    </Link>
)

export default Home
