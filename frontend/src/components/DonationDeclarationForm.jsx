import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDonate, FaCheckCircle } from 'react-icons/fa';

const DonationDeclarationForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        amount: '',
        project: 'general',
        payment_method: 'whatsapp',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const projects = [
        { id: 'general', label: 'Général' },
        { id: 'missions', label: 'Missions' },
        { id: 'benevolence', label: 'Bénévolence' },
        { id: 'youth', label: 'Jeunesse' }
    ];

    const paymentMethods = [
        { id: 'whatsapp', label: 'WhatsApp' },
        { id: 'bank_transfer', label: 'Virement bancaire' },
        { id: 'paypal', label: 'PayPal' },
        { id: 'cash', label: 'Espèces' },
        { id: 'other', label: 'Autre' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const token = localStorage.getItem('access_token');

            const res = await fetch(`${baseUrl}/donations/declare/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);

                // Préparer le message WhatsApp avec la méthode choisie
                const projectLabels = {
                    'general': 'Général',
                    'missions': 'Missions',
                    'benevolence': 'Bénévolence',
                    'youth': 'Jeunesse'
                };

                const paymentMethodLabels = {
                    'whatsapp': 'WhatsApp',
                    'bank_transfer': 'Virement bancaire',
                    'paypal': 'PayPal',
                    'cash': 'Espèces',
                    'other': 'Autre'
                };

                const message = `Bonjour,\n\nJe souhaite faire un don de ${formData.amount} EUR pour le projet "${projectLabels[formData.project] || formData.project}".\n\nMéthode de paiement : ${paymentMethodLabels[formData.payment_method] || formData.payment_method}\n${formData.notes ? `\nRemarques : ${formData.notes}` : ''}\n\nMerci !`;

                const whatsappNumber = '905338748646';
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

                // Ouvrir WhatsApp
                window.open(whatsappUrl, '_blank');

                // Call callback if provided
                if (onSuccess) {
                    onSuccess(data.donation);
                }

                // Reset form
                setFormData({
                    amount: '',
                    project: 'general',
                    payment_method: 'whatsapp',
                    notes: ''
                });

                // Reset success message after 5 seconds
                setTimeout(() => setSuccess(false), 5000);
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            console.error('Error declaring donation:', err);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };


    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center"
            >
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-700 mb-2">Don déclaré avec succès !</h3>
                <p className="text-green-600 mb-2">
                    Votre don est enregistré en attente de validation.
                </p>
                <p className="text-sm text-green-600">
                    ✅ WhatsApp va s'ouvrir pour finaliser votre don.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
        >
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-gold to-lightGold p-3 rounded-lg">
                    <FaDonate className="text-white text-2xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-bordeaux">Déclarer un Don</h2>
                    <p className="text-sm text-gray-500">Enregistrez votre contribution</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Montant */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant (EUR) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                        placeholder="50.00"
                    />
                </div>

                {/* Projet */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Projet <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={formData.project}
                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    >
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Méthode de paiement */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Méthode de paiement <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    >
                        {paymentMethods.map(method => (
                            <option key={method.id} value={method.id}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarques (optionnel)
                    </label>
                    <textarea
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-bordeaux focus:border-transparent resize-none"
                        placeholder="Informations complémentaires..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-bordeaux to-gold hover:shadow-lg transform hover:-translate-y-0.5'
                        }`}
                >
                    {loading ? 'En cours...' : '✅ Déclarer le Don'}
                </button>
            </form>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                    <strong>💡 Comment ça marche :</strong> Après avoir soumis ce formulaire,
                    vous serez automatiquement redirigé vers WhatsApp avec un message pré-rempli
                    contenant votre montant, projet et méthode de paiement choisie.
                    Envoyez ce message pour finaliser votre don.
                </p>
            </div>
        </motion.div>
    );
};

export default DonationDeclarationForm;
