import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'

const Footer = () => {
    const { t } = useLanguage()

    return (
        <footer className="bg-black text-white pt-24 pb-12">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Brand & Schedule */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-extrabold uppercase tracking-tighter mb-2">Cyprus For Christ</h3>
                            <p className="text-gray-400 text-sm">{t('footer.slogan')}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{t('footer.services')}</h4>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex justify-between border-b border-gray-800 pb-2">
                                    <span>{t('footer.sunday')}</span>
                                    <span className="font-bold text-white">17h15</span>
                                </li>
                                <li className="flex justify-between border-b border-gray-800 pb-2">
                                    <span>{t('footer.wednesday')}</span>
                                    <span className="font-bold text-white">17h15</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">{t('footer.links')}</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/about" className="text-lg font-bold hover:text-gold transition-colors">{t('footer.about')}</Link>
                            </li>
                            <li>
                                <Link to="/programs" className="text-lg font-bold hover:text-gold transition-colors">{t('home.programs.title')}</Link>
                            </li>
                            <li>
                                <Link to="/sermons" className="text-lg font-bold hover:text-gold transition-colors">{t('nav.sermons')}</Link>
                            </li>
                            <li>
                                <Link to="/donations" className="text-lg font-bold hover:text-gold transition-colors">{t('nav.donate')}</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-lg font-bold hover:text-gold transition-colors">{t('nav.contact')}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">{t('footer.contact')}</h4>
                        <ul className="space-y-6">
                            <a
                                href="https://www.google.com/maps/dir/?api=1&destination=Turgut+Hasan+Sokak+No:2+Kucuk+Kaymakli+Lefkosa+TEB+Bankasi+Karsisi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start space-x-4 group cursor-pointer"
                            >
                                <div className="p-3 rounded-full bg-gray-900 group-hover:bg-gold transition-colors text-white">
                                    <FaMapMarkerAlt />
                                </div>
                                <span className="text-gray-300 leading-relaxed group-hover:text-white transition-colors uppercase">
                                    TURGUT HASAN SOKAK NO:2, KUCUK KAYMAKLI<br />
                                    LEFKOSA (TEB BANKASI KARSISI)
                                </span>
                            </a>
                            <a href="tel:+905338748646" className="flex items-center space-x-4 group cursor-pointer">
                                <div className="p-3 rounded-full bg-gray-900 group-hover:bg-gold transition-colors text-white">
                                    <FaPhone />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors tracking-wider font-medium">+90 533 874 86 46</span>
                            </a>
                            <a href="mailto:cyprusforchrist@gmail.com" className="flex items-center space-x-4 group cursor-pointer">
                                <div className="p-3 rounded-full bg-gray-900 group-hover:bg-gold transition-colors text-white">
                                    <FaEnvelope />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors font-medium">cyprusforchrist@gmail.com</span>
                            </a>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter/Social */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">{t('footer.stay_connected')}</h4>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            {t('footer.follow_us')}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <SocialLink href="https://www.instagram.com/cyprusforchrist/" icon={<FaInstagram />} />
                            <SocialLink href="https://www.youtube.com/@CyprusForChrist01" icon={<FaYoutube />} />
                            <SocialLink href="https://wa.me/905338748646" icon={<FaWhatsapp />} />
                            <SocialLink href="#" icon={<FaFacebook />} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Cyprus For Christ. {t('footer.rights')}</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">{t('auth.register.fields.privacy_link')}</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">{t('auth.register.fields.terms_link')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

const SocialLink = ({ href, icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gold hover:-translate-y-1 transition-all duration-300"
    >
        {icon}
    </a>
)

export default Footer
