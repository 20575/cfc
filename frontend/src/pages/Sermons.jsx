import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FaPlay,
    FaDownload,
    FaFilter,
    FaSearch,
    FaCalendarAlt,
    FaUser,
    FaEye,
    FaSortAmountDown,
    FaYoutube,
    FaBookOpen
} from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'

const Sermons = () => {
    const { t, language } = useLanguage()

    // Dynamic categories based on translation
    const categories = [
        { id: 'Tous', label: t('sermons.filters.all') },
        { id: 'SUNDAY_SERVICE', label: t('sermons.filters.sunday') },
        { id: 'PREACHING', label: t('sermons.filters.preaching') },
        { id: 'TEACHING', label: t('sermons.filters.teaching') },
        { id: 'EXHORTATION', label: t('sermons.filters.exhortation') },
        { id: 'MEDITATION', label: t('sermons.filters.meditation') },
        { id: 'BIBLE_STUDY', label: t('sermons.filters.bible_study') },
        { id: 'YOUTH', label: t('sermons.filters.youth') },
        { id: 'CONFERENCE', label: t('sermons.filters.conference') },
        { id: 'WORSHIP', label: t('sermons.filters.worship') },
        { id: 'OTHER', label: t('sermons.filters.other') }
    ]

    const [allSermons, setAllSermons] = useState([])
    const [sermons, setSermons] = useState([])
    const [selectedSermon, setSelectedSermon] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('Tous')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('date') // 'date' or 'views'
    const [isPlaying, setIsPlaying] = useState(false)
    const [loading, setLoading] = useState(true)

    // Helper to get label from category ID
    const getCategoryLabel = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.label : catId;
    }

    useEffect(() => {
        const fetchSermons = async () => {
            setLoading(true)
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
                let url = `${baseUrl}/sermons/`
                // If specific category selected (and not 'Tous'), append query param
                if (selectedCategory !== 'Tous') {
                    url += `?category=${selectedCategory}`
                }

                const response = await fetch(url)
                const data = await response.json()

                const sermonList = Array.isArray(data) ? data : (data.results || [])

                const formattedSermons = sermonList.map(s => ({
                    id: s.id.toString(),
                    title: s.title,
                    preacher: s.pastor_name || 'Pasteur',
                    date: s.created_at,
                    youtubeId: s.youtube_id,
                    // Map backend ID to Label for display, or keep ID if not found
                    category: s.category || 'OTHER',
                    categoryLabel: getCategoryLabel(s.category), // Initial label, will update on render if lang changes
                    description: s.description,
                    duration: s.duration || '00:00',
                    views: s.views || 0,
                    thumbnail: s.thumbnail || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    notesUrl: s.pdf_file ? (s.pdf_file.startsWith('http') ? s.pdf_file : `${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '')}${s.pdf_file}`) : null
                }))

                setAllSermons(formattedSermons)
                setSermons(formattedSermons)

                // Update selected sermon if list is not empty
                if (formattedSermons.length > 0) {
                    // Try to keep current selection if valid, otherwise pick first
                    if (selectedSermon && formattedSermons.find(s => s.id === selectedSermon.id)) {
                        // Keep current
                    } else {
                        setSelectedSermon(formattedSermons[0])
                    }
                } else {
                    setSelectedSermon(null)
                }
            } catch (error) {
                console.error('Error fetching sermons:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSermons()
    }, [selectedCategory]) // Re-fetch when category changes

    // Client-side filtering for search and sort
    useEffect(() => {
        if (!allSermons) return

        let filtered = [...allSermons]

        if (searchTerm) {
            filtered = filtered.filter(sermon =>
                sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sermon.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        filtered = filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            } else {
                return b.views - a.views
            }
        })

        setSermons(filtered)
    }, [searchTerm, sortBy, allSermons])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gold to-lightGold rounded-full mb-4">
                        <FaBookOpen className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-playfair font-bold text-bordeaux mb-2">
                        {t('sermons.meta.title')}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t('sermons.meta.subtitle')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Filters and Sermon List */}
                    <div className="lg:col-span-1">
                        {/* Search Bar */}
                        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('sermons.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-bordeaux mb-4 flex items-center">
                                <FaFilter className="mr-2" />
                                {t('sermons.filters.title')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat.id
                                            ? 'bg-gradient-to-r from-gold to-lightGold text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-bordeaux mb-4 flex items-center">
                                <FaSortAmountDown className="mr-2" />
                                {t('sermons.sort.title')}
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSortBy('date')}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${sortBy === 'date'
                                        ? 'bg-gold/10 text-gold border-2 border-gold'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{t('sermons.sort.recent')}</span>
                                        <FaCalendarAlt />
                                    </div>
                                </button>
                                <button
                                    onClick={() => setSortBy('views')}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${sortBy === 'views'
                                        ? 'bg-gold/10 text-gold border-2 border-gold'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{t('sermons.sort.popular')}</span>
                                        <FaEye />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Sermon Count */}
                        <div className="bg-gradient-to-r from-bordeaux to-purple-700 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="text-xl font-bold mb-2">{sermons.length} Sermons</h3>
                            <p className="opacity-90">{t('sermons.stats.available')}</p>
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
                                <p className="text-gray-500 font-medium">{t('sermons.loading')}</p>
                            </div>
                        ) : selectedSermon ? (
                            <>
                                {/* Featured Sermon Player */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8"
                                >
                                    {/* Video Player */}
                                    <div className="relative">
                                        {isPlaying ? (
                                            <div className="aspect-video">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${selectedSermon.youtubeId}?autoplay=1`}
                                                    title={selectedSermon.title}
                                                    className="w-full h-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video relative">
                                                <img
                                                    src={selectedSermon.thumbnail}
                                                    alt={selectedSermon.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <button
                                                        onClick={() => setIsPlaying(true)}
                                                        className="bg-gradient-to-r from-gold to-lightGold text-white p-6 rounded-full hover:scale-110 transition-transform duration-300"
                                                    >
                                                        <FaPlay className="h-8 w-8" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute top-4 left-4">
                                            <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                {getCategoryLabel(selectedSermon.category)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sermon Info */}
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-bordeaux mb-2">{selectedSermon.title}</h2>
                                                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                                    <div className="flex items-center">
                                                        <FaUser className="mr-2 text-gold" />
                                                        <span className="font-medium">{selectedSermon.preacher}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FaCalendarAlt className="mr-2 text-gold" />
                                                        <span>{formatDate(selectedSermon.date)}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FaEye className="mr-2 text-gold" />
                                                        <span>{selectedSermon.views.toLocaleString()} {t('sermons.views')}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FaPlay className="mr-2 text-gold" />
                                                        <span>{selectedSermon.duration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedSermon.notesUrl && (
                                                <a
                                                    href={selectedSermon.notesUrl}
                                                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                >
                                                    <FaDownload className="text-xl group-hover:animate-bounce" />
                                                    <span>{t('sermons.download_pdf')}</span>
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{selectedSermon.description}</p>
                                    </div>
                                </motion.div>

                                {/* Sermon List */}
                                <div>
                                    <h3 className="text-2xl font-bold text-bordeaux mb-6">{t('sermons.all_sermons')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {sermons.map((sermon) => (
                                            <motion.div
                                                key={sermon.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ y: -5 }}
                                                onClick={() => {
                                                    setSelectedSermon(sermon)
                                                    setIsPlaying(false)
                                                }}
                                                className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${selectedSermon.id === sermon.id ? 'ring-2 ring-gold' : 'hover:shadow-xl'
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={sermon.thumbnail}
                                                        alt={sermon.title}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                                            <FaPlay className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-4 left-4">
                                                        <span className="bg-gold text-white px-2 py-1 rounded text-xs font-semibold">
                                                            {sermon.duration}
                                                        </span>
                                                    </div>
                                                    {sermon.notesUrl && (
                                                        <div className="absolute top-4 right-4">
                                                            <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                                                                <FaDownload className="text-xs" />
                                                                PDF
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                                                        {sermon.title}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                                        <div className="flex items-center">
                                                            <FaUser className="mr-1 h-3 w-3" />
                                                            <span>{sermon.preacher}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FaEye className="mr-1 h-3 w-3" />
                                                            <span>{sermon.views.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                        {sermon.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                            {getCategoryLabel(sermon.category)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(sermon.date)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <FaSearch className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">{t('sermons.no_results')}</p>
                            </div>
                        )}

                        {/* Subscribe Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-12 bg-gradient-to-r from-bordeaux to-purple-800 rounded-2xl p-8 text-white text-center"
                        >
                            <FaYoutube className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">{t('sermons.subscribe.title')}</h3>
                            <p className="mb-6 opacity-90">{t('sermons.subscribe.desc')}</p>
                            <a
                                href="https://m.youtube.com/@CyprusForChrist01/featured"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-white text-bordeaux px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                            >
                                {t('sermons.subscribe.button')}
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sermons
