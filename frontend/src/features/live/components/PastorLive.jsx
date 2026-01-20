import React, { useState, useEffect } from 'react';
import { liveApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaVideo, FaStop, FaPlay, FaPlus, FaTrash,
    FaBroadcastTower, FaCopy, FaCheckCircle, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';

const PastorLive = () => {
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newStream, setNewStream] = useState({ title: '', description: '' });
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        fetchStreams();
    }, []);

    const fetchStreams = async () => {
        try {
            const data = await liveApi.getStreams();
            setStreams(data.results || data);
        } catch (error) {
            console.error("Error fetching streams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await liveApi.createStream(newStream);
            setNewStream({ title: '', description: '' });
            setIsCreating(false);
            fetchStreams();
        } catch (error) {
            alert("Erreur lors de la création");
        }
    };

    const handleStart = async (id) => {
        try {
            await liveApi.startStream(id);
            fetchStreams();
        } catch (error) {
            alert("Erreur lors du démarrage");
        }
    };

    const handleStop = async (id) => {
        if (!window.confirm("Voulez-vous vraiment arrêter ce direct ?")) return;
        try {
            await liveApi.stopStream(id);
            fetchStreams();
        } catch (error) {
            alert("Erreur lors de l'arrêt");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette planification ?")) return;
        try {
            await liveApi.deleteStream(id);
            fetchStreams();
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Gestion du Direct</h1>
                    <p className="text-gray-500 mt-1">Planifiez et diffusez vos cultes en temps réel.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-bordeaux text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:shadow-lg transition-all"
                >
                    <FaPlus />
                    <span>Nouveau Live</span>
                </button>
            </div>

            {/* In-Progress Stream Card */}
            {streams.filter(s => s.status === 'LIVE').map(stream => (
                <div key={stream.id} className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex flex-col md:row items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold mb-4 animate-pulse">
                                <FaBroadcastTower />
                                <span>DIFFUSION EN COURS</span>
                            </div>
                            <h2 className="text-3xl font-bold">{stream.title}</h2>
                            <p className="mt-2 text-white/80">{stream.description}</p>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-xs text-white/60 font-medium uppercase tracking-wider mb-2">Serveur RTMP</p>
                                    <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl">
                                        <code className="text-xs truncate mr-2">{stream.ingest_endpoint}</code>
                                        <button onClick={() => copyToClipboard(stream.ingest_endpoint, 'server')} className="text-white/60 hover:text-white transition-colors">
                                            {copied === 'server' ? <FaCheckCircle className="text-green-400" /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-xs text-white/60 font-medium uppercase tracking-wider mb-2">Clé de Flux</p>
                                    <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl">
                                        <code className="text-xs truncate mr-2">••••••••••••••••</code>
                                        <button onClick={() => copyToClipboard(stream.stream_key, 'key')} className="text-white/60 hover:text-white transition-colors">
                                            {copied === 'key' ? <FaCheckCircle className="text-green-400" /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button
                                onClick={() => handleStop(stream.id)}
                                className="bg-white text-red-600 px-8 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all flex items-center justify-center space-x-3 shadow-lg"
                            >
                                <FaStop />
                                <span>ARRÊTER LE DIRECT</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Instructions for OBS */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                    <FaInfoCircle className="mr-3 text-indigo-500" />
                    Comment diffuser votre culte ?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">1</div>
                        <p className="font-bold text-sm">Préparez votre logiciel</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Téléchargez et installez <strong>OBS Studio</strong> (gratuit). Configurez votre caméra et votre micro dans les sources.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">2</div>
                        <p className="font-bold text-sm">Configurez le flux</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Allez dans <em>Paramètres &gt; Stream</em>. Choisissez 'Personnalisé' et copiez le <strong>Serveur</strong> et la <strong>Clé</strong> ci-dessus.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">3</div>
                        <p className="font-bold text-sm">Lancez le Direct</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Cliquez sur 'Lancer le streaming' dans OBS, puis sur <strong>LANCER LE DIRECT</strong> sur ce site pour alerter les fidèles.</p>
                    </div>
                </div>
            </div>

            {/* List of Other Streams */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.filter(s => s.status !== 'LIVE').map(stream => (
                    <div key={stream.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${stream.status === 'ENDED' ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                {stream.status === 'ENDED' ? 'Terminé' : 'Prévu'}
                            </span>
                            <button onClick={() => handleDelete(stream.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <FaTrash />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">{stream.title}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 h-10">{stream.description || "Pas de description"}</p>

                        {stream.status === 'PLANNED' && (
                            <button
                                onClick={() => handleStart(stream.id)}
                                className="w-full mt-6 bg-indigo-50 text-indigo-600 py-3 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center space-x-2"
                            >
                                <FaPlay className="text-xs" />
                                <span>LANCER LE DIRECT</span>
                            </button>
                        )}
                        {stream.status === 'ENDED' && (
                            <div className="mt-6 pt-6 border-t border-gray-50 text-xs text-gray-400 flex items-center italic">
                                <FaCheckCircle className="mr-2 text-green-500" />
                                Diffusé le {new Date(stream.ended_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                                <FaVideo className="mr-3 text-bordeaux" /> Nouveau Live
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Titre du Culte</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStream.title}
                                        onChange={e => setNewStream({ ...newStream, title: e.target.value })}
                                        placeholder="ex: Culte du Dimanche - Victoire"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-bordeaux/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description / Verset</label>
                                    <textarea
                                        value={newStream.description}
                                        onChange={e => setNewStream({ ...newStream, description: e.target.value })}
                                        rows="3"
                                        placeholder="Un message court pour vos fidèles..."
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-bordeaux/20"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-bordeaux text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        Planifier
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PastorLive;
