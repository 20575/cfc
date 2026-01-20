import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
    // Cyprus For Christ WhatsApp Number
    const phoneNumber = '905338748646';
    const message = 'Bonjour, je viens du site web Cyprus For Christ et j\'aimerais plus d\'informations.';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300 z-50"
            aria-label="Contact us on WhatsApp"
        >
            <FaWhatsapp size={30} />
        </a>
    );
};

export default WhatsAppButton;
