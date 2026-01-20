import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext'
import { formatBibleReference } from '../utils/stringUtils'

const RhemaOfTheDay = () => {
    const { t } = useLanguage()
    const [verse, setVerse] = useState({
        text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
        reference: "Jérémie 29:11",
        meditation: "Dieu a un plan pour votre vie, un plan de paix et d'espérance. Confiez-lui votre avenir."
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from backend API
        fetch('http://127.0.0.1:8000/api/rhema/today/')
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setVerse({
                        title: data.title || '',
                        text: data.content,
                        reference: formatBibleReference(data.verse),
                        meditation: data.meditation || verse.meditation
                    });
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching Rhema:', error);
                // Keep fallback data
                setLoading(false);
            });
    }, []);

    return (
        <section className="py-16 bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-playfair font-bold mb-8">
                    {verse.title || t('home.rhema.title')}
                </h2>
                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-8 bg-white bg-opacity-20 rounded mb-4"></div>
                        <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
                    </div>
                ) : (
                    <>
                        <blockquote className="text-2xl font-inter italic mb-4">
                            "{verse.text}"
                        </blockquote>
                        <p className="text-xl font-semibold mb-4">— {verse.reference}</p>
                        {verse.meditation && (
                            <div className="mt-8 p-6 bg-white bg-opacity-20 rounded-lg">
                                <p className="text-lg">{verse.meditation}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default RhemaOfTheDay;
