import React, { useEffect, useRef, useState } from 'react';
import { liveApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaUsers, FaCircle, FaInfoCircle } from 'react-icons/fa';
import SupportChat from '../../chat/components/SupportChat';

const LivePlayer = () => {
    const [activeLive, setActiveLive] = useState(null);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Charger le SDK Amazon IVS
        const script = document.createElement('script');
        script.src = "https://player.live-video.net/1.24.0/amazon-ivs-player.min.js";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        fetchActiveLive();
        const interval = setInterval(fetchActiveLive, 30000);

        return () => {
            clearInterval(interval);
            document.body.removeChild(script);
        };
    }, []);

    const fetchActiveLive = async () => {
        try {
            const data = await liveApi.getActiveStream();
            setActiveLive(data);
        } catch (error) {
            console.error("Error fetching active live:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (scriptLoaded && activeLive && videoRef.current && window.IVSPlayer) {
            if (!window.IVSPlayer.isPlayerSupported) {
                console.warn("IVS Player is not supported in this browser");
                return;
            }

            const player = window.IVSPlayer.create();
            player.attachHTMLVideoElement(videoRef.current);
            player.load(activeLive.playback_url);
            player.play();

            return () => {
                player.delete();
            };
        }
    }, [scriptLoaded, activeLive]);

    if (loading) return <div className="p-12 text-center text-gray-500">Chargement du direct...</div>;

    if (!activeLive) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 px-6 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <FaVideo className="text-4xl text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Aucun signal détecté</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                    Le pasteur n'a pas encore lancé la diffusion. Si vous êtes le pasteur, assurez-vous de démarrer votre logiciel (ex: OBS) et de cliquer sur "Lancer le Direct" dans votre interface de gestion.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold">MODE SIMULATION</div>
                    <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold italic">Amazon IVS Player Required</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Player Area */}
                <div className="flex-1">
                    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <video
                            ref={videoRef}
                            playsInline
                            className="w-full h-full object-contain"
                            controls
                        />

                        {/* Live Overlay */}
                        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                            <FaCircle className="text-[8px]" />
                            <span>EN DIRECT</span>
                        </div>
                    </div>

                    <div className="mt-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 leading-tight">
                                    {activeLive.title}
                                </h1>
                                <p className="text-gray-500 mt-2 flex items-center">
                                    <FaInfoCircle className="mr-2" />
                                    {activeLive.description || "Pas de description fournie."}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                <FaUsers className="text-indigo-500" />
                                <span className="font-bold">LIVE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Simple Chat Info for now */}
                <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-gradient-to-br from-bordeaux to-red-900 p-6 rounded-3xl text-white shadow-xl">
                        <h3 className="font-bold flex items-center">
                            <FaUsers className="mr-2" /> Discussion
                        </h3>
                        <p className="text-xs text-white/70 mt-2 leading-relaxed">
                            Vous pouvez interagir avec l'admin et les autres membres via le chat de support situé en bas à droite de votre écran.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 text-sm text-gray-600">
                        <p className="font-bold text-gray-900 mb-2">Instructions</p>
                        <ul className="space-y-2 list-disc list-inside text-xs">
                            <li>Qualité auto-adaptative</li>
                            <li>Faible latence activée</li>
                            <li>Replay disponible après le live</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePlayer;
