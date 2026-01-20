import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaThumbtack } from 'react-icons/fa'
import { eventService } from '../api'

const EventsManagement = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [showFormModal, setShowFormModal] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: '',
        is_annual: false,
        is_past: false,
        is_pinned: false
    })
    const [imageFile, setImageFile] = useState(null)

    const loadEvents = async () => {
        setLoading(true)
        try {
            const params = {}
            if (searchTerm) params.search = searchTerm
            if (categoryFilter) params.category = categoryFilter

            const data = await eventService.getEvents(params)
            setEvents(data)
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadEvents()
    }, [searchTerm, categoryFilter])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const data = new FormData()
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key])
            }
        })
        if (imageFile) {
            data.append('image', imageFile)
        }

        try {
            if (editingEvent) {
                await eventService.updateEvent(editingEvent.id, data)
            } else {
                await eventService.createEvent(data)
            }

            loadEvents()
            setShowFormModal(false)
            resetForm()
            alert(editingEvent ? 'Événement modifié !' : 'Événement ajouté !')
        } catch (error) {
            console.error('Error saving event:', error)
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Erreur lors de la sauvegarde. Vérifiez les champs.';
            alert(errorMsg)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return

        try {
            await eventService.deleteEvent(id)
            loadEvents()
            alert('Événement supprimé !')
        } catch (error) {
            console.error('Error deleting event:', error)
            alert('Erreur lors de la suppression')
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            category: '',
            is_annual: false,
            is_past: false,
            is_pinned: false
        })
        setImageFile(null)
        setEditingEvent(null)
    }

    const openEditModal = (event) => {
        setEditingEvent(event)
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            category: event.category,
            is_annual: event.is_annual,
            is_past: event.is_past,
            is_pinned: event.is_pinned
        })
        setShowFormModal(true)
    }

    if (loading && events.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bordeaux"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un événement..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20 bg-white"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Toutes les catégories</option>
                        <option value="CONFERENCE">Conférence</option>
                        <option value="CONCERT">Concert</option>
                        <option value="YOUTH">Jeunesse</option>
                        <option value="SPECIAL">Spécial</option>
                    </select>
                    <button
                        onClick={() => { resetForm(); setShowFormModal(true) }}
                        className="flex items-center gap-2 px-6 py-3 bg-bordeaux text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        <FaPlus /> Ajouter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all relative"
                    >
                        {event.is_pinned && (
                            <div className="absolute top-4 right-4 bg-gold text-white p-2 rounded-full z-10">
                                <FaThumbtack />
                            </div>
                        )}
                        <div className="h-48 bg-gray-100 relative">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <FaCalendarAlt size={48} />
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-bordeaux text-xs font-bold rounded-full">
                                    {event.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{event.title}</h3>
                            <div className="space-y-1 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-gold" /> {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-gold" /> {event.time}
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gold" /> {event.location}
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-gray-50">
                                <button
                                    onClick={() => openEditModal(event)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl w-full max-w-2xl my-8"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold">{editingEvent ? 'Modifier l\'événement' : 'Ajouter un événement'}</h2>
                                <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Titre</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            rows="3"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Heure</label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Lieu</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bordeaux/20 bg-white"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="CONFERENCE">Conférence</option>
                                            <option value="CONCERT">Concert</option>
                                            <option value="YOUTH">Jeunesse</option>
                                            <option value="SPECIAL">Spécial</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bordeaux/10 file:text-bordeaux hover:file:bg-bordeaux/20"
                                        />
                                    </div>
                                    <div className="flex items-center gap-6 mt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_pinned}
                                                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                                className="w-4 h-4 text-bordeaux focus:ring-bordeaux"
                                            />
                                            <span className="text-sm font-bold text-gray-700">Épingler</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_annual}
                                                onChange={(e) => setFormData({ ...formData, is_annual: e.target.checked })}
                                                className="w-4 h-4 text-bordeaux focus:ring-bordeaux"
                                            />
                                            <span className="text-sm font-bold text-gray-700">Annuel</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-bordeaux text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        {editingEvent ? 'Modifier' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default EventsManagement
