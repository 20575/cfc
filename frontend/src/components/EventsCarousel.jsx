import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const EventsCarousel = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        // Fetch from backend API
        fetch('http://127.0.0.1:8000/api/about/events/')
            .then(response => response.json())
            .then(data => {
                const eventList = Array.isArray(data) ? data : (data.results || [])
                if (eventList.length > 0) {
                    const formattedEvents = eventList.map(e => ({
                        id: e.id,
                        title: e.title,
                        date: e.date,
                        time: e.time ? e.time.substring(0, 5) : 'À déterminer',
                        location: e.location || 'Cyprus For Christ',
                        description: e.description,
                        image: e.image || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        category: e.category || 'Événement'
                    }))
                    setEvents(formattedEvents)
                } else {
                    // Fallback data if no events in backend
                    setEvents([
                        {
                            id: 1,
                            title: 'Culte de Dimanche',
                            date: '2024-01-21',
                            time: '10:00',
                            location: 'Salle Principale',
                            description: 'Culte hebdomadaire avec louanges et prédication',
                            image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            category: 'Culte'
                        }
                    ])
                }
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching events:', error)
                // Use fallback data on error
                setEvents([
                    {
                        id: 1,
                        title: 'Culte de Dimanche',
                        date: '2024-01-21',
                        time: '10:00',
                        location: 'Cyprus For Christ',
                        description: 'Culte hebdomadaire avec louanges et prédication',
                        image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        category: 'Culte'
                    }
                ])
                setLoading(false)
            })
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="animate-pulse">Chargement des événements...</div>
                </div>
            </section>
        )
    }

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
                        Prochains <span className="text-gradient">Événements</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Rejoignez-nous pour ces moments de communion, de prière et d'enseignement
                    </p>
                </motion.div>

                {/* Carousel */}
                <div className="relative">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000 }}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                        }}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                        className="pb-12"
                    >
                        {events.map((event) => (
                            <SwiperSlide key={event.id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={event.image || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                            alt={event.title}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                {event.category || 'Événement'}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <h3 className="text-xl font-bold text-white">{event.title}</h3>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-gray-600">
                                                <FaCalendarAlt className="h-5 w-5 text-gold mr-3" />
                                                <span className="font-medium">{formatDate(event.date)}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <FaClock className="h-5 w-5 text-gold mr-3" />
                                                <span className="font-medium">{event.time || 'À déterminer'}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <FaMapMarkerAlt className="h-5 w-5 text-gold mr-3" />
                                                <span className="font-medium">{event.location}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-6">{event.description}</p>


                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button className="swiper-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 bg-white/80 hover:bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-gold hover:text-bordeaux transition-colors">
                        <FaChevronLeft />
                    </button>
                    <button className="swiper-button-next absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 bg-white/80 hover:bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-gold hover:text-bordeaux transition-colors">
                        <FaChevronRight />
                    </button>
                </div>

                {/* View All Events Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        to="/events"
                        className="inline-flex items-center bg-gradient-to-r from-bordeaux to-purple-700 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <FaCalendarAlt className="mr-3" />
                        Voir tous les événements
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default EventsCarousel
