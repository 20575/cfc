import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaFacebook,
    FaInstagram,
    FaYoutube,
    FaPaperPlane,
    FaWhatsapp,
    FaChurch,
    FaCar
} from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useLanguage } from '../context/LanguageContext'

const Contact = () => {
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    const [contactData, setContactData] = useState(null)

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                const response = await axios.get('/api/contact/info/')
                setContactData(response.data)
            } catch (error) {
                console.error('Error fetching contact info:', error)
            }
        }
        fetchContactData()
    }, [])

    const onSubmit = async (data) => {
        setIsSubmitting(true)

        try {
            await axios.post('/api/contact/messages/', data)
            reset()
            alert(t('contact.form.success'))
        } catch (err) {
            console.error('Error sending message:', err)
            alert("Une erreur est survenue lors de l'envoi du message.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const contactInfo = [
        {
            icon: FaPhone,
            title: t('contact.info.phone'),
            details: [contactData?.phone || '+90 533 874 86 46'],
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: FaEnvelope,
            title: t('contact.info.email'),
            details: [contactData?.email || 'contact@cyprusforchrist.com'],
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: FaMapMarkerAlt,
            title: t('contact.info.address'),
            details: (contactData?.address || t('contact.info.address_value') || 'Turgut hasan sokak no 2, Kucuk kaymakli, Lefkosa, Chypre du Nord').split(','),
            color: 'from-red-500 to-pink-500'
        },
        {
            icon: FaClock,
            title: t('contact.info.service_times'),
            details: [
                contactData?.service_times_sunday || t('contact.info.sunday'),
                contactData?.service_times_wednesday || t('contact.info.wednesday')
            ],
            color: 'from-purple-500 to-pink-500'
        }
    ]

    const socialMedia = [
        { icon: FaInstagram, label: 'Instagram', url: contactData?.instagram || 'https://www.instagram.com/cyprusforchrist', color: 'bg-pink-600' },
        { icon: FaYoutube, label: 'YouTube', url: contactData?.youtube || 'https://m.youtube.com/@CyprusForChrist01', color: 'bg-red-600' },
        { icon: FaWhatsapp, label: 'WhatsApp', url: `https://wa.me/${contactData?.whatsapp || '905338748646'}`, color: 'bg-green-500' }
    ]

    if (contactData?.facebook) {
        socialMedia.push({ icon: FaFacebook, label: 'Facebook', url: contactData.facebook, color: 'bg-blue-600' })
    }

    const serviceTimesList = [
        {
            day: (contactData?.service_times_sunday || t('contact.info.sunday')).split(':')[0],
            times: [(contactData?.service_times_sunday || t('contact.info.sunday'))]
        },
        {
            day: (contactData?.service_times_wednesday || t('contact.info.wednesday')).split(':')[0],
            times: [(contactData?.service_times_wednesday || t('contact.info.wednesday'))]
        }
    ]


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
                        <FaChurch className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-playfair font-bold text-bordeaux mb-2">
                        {t('contact.title')}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t('contact.subtitle')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column - Contact Information */}
                    <div className="space-y-8">
                        {/* Contact Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contactInfo.map((info, index) => {
                                const Icon = info.icon
                                return (
                                    <motion.div
                                        key={info.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${info.color} mb-4`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-bordeaux mb-3">{info.title}</h3>
                                        {info.details.map((detail, i) => (
                                            <p key={i} className="text-gray-600 mb-1">{detail}</p>
                                        ))}
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Map Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                            <div className="h-64 bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                                <div className="text-center">
                                    <FaMapMarkerAlt className="h-12 w-12 text-gold mb-4 mx-auto" />
                                    <h3 className="font-bold text-bordeaux mb-2">Cyprus For Christ</h3>
                                    <p className="text-gray-600">TURGUT HASAN SOKAK NO:2</p>
                                    <p className="text-gray-600">KUCUK KAYMAKLI - LEFKOSA</p>
                                    <p className="text-gray-600 text-sm font-semibold text-gold">TEB BANKASI KARSISI</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-bordeaux mb-1">{t('contact.info.directions')}</h4>
                                        <p className="text-sm text-gray-600">{t('contact.info.plan_route')}</p>
                                    </div>
                                    <a
                                        href="https://www.google.com/maps/dir/?api=1&destination=Turgut+Hasan+Sokak+No:2+Kucuk+Kaymakli+Lefkosa+TEB+Bankasi+Karsisi"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-gold hover:text-bordeaux transition-colors font-semibold"
                                    >
                                        <FaCar className="mr-2" />
                                        {t('contact.info.get_there')}
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Service Times */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-bordeaux to-purple-700 rounded-xl p-6 text-white"
                        >
                            <h3 className="text-xl font-bold mb-6">{t('contact.info.service_times')}</h3>
                            <div className="space-y-4">
                                {serviceTimesList.map((service) => (
                                    <div key={service.day} className="flex justify-between items-center pb-3 border-b border-white/20 last:border-0">
                                        <span className="font-medium">{service.day}</span>
                                        <div className="text-right">
                                            {service.times.map((time, i) => (
                                                <p key={i} className="text-sm opacity-90">{time}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Social Media */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <h3 className="text-lg font-bold text-bordeaux mb-4">Suivez-nous</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {socialMedia.map((social) => {
                                    const Icon = social.icon
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.url}
                                            className={`${social.color} text-white p-4 rounded-xl flex flex-col items-center justify-center hover:opacity-90 transition-opacity`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Icon className="h-6 w-6 mb-2" />
                                            <span className="text-sm font-medium">{social.label}</span>
                                        </a>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-xl p-8"
                    >
                        <h2 className="text-2xl font-bold text-bordeaux mb-2">{t('contact.form.title')}</h2>
                        <p className="text-gray-600 mb-8">{t('contact.form.subtitle')}</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">{t('contact.form.name')}</label>
                                    <input
                                        {...register('name', { required: t('contact.form.required_error') })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                                        placeholder={t('contact.form.name_placeholder')}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">{t('contact.form.email')}</label>
                                    <input
                                        {...register('email', {
                                            required: t('contact.form.required_error'),
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: t('contact.form.email_error')
                                            }
                                        })}
                                        type="email"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                                        placeholder={t('contact.form.email_placeholder')}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">{t('contact.form.phone')}</label>
                                    <input
                                        {...register('phone')}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                                        placeholder={t('contact.form.phone_placeholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">{t('contact.form.subject')}</label>
                                    <select
                                        {...register('subject', { required: t('contact.form.required_error') })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 bg-white"
                                    >
                                        <option value="">{t('contact.form.subject_placeholder')}</option>
                                        <option value="information">{t('contact.form.subjects.info')}</option>
                                        <option value="prayer">{t('contact.form.subjects.prayer')}</option>
                                        <option value="visit">{t('contact.form.subjects.visit')}</option>
                                        <option value="membership">{t('contact.form.subjects.membership')}</option>
                                        <option value="donation">{t('contact.form.subjects.donation')}</option>
                                        <option value="other">{t('contact.form.subjects.other')}</option>
                                    </select>
                                    {errors.subject && (
                                        <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">{t('contact.form.message')}</label>
                                <textarea
                                    {...register('message', {
                                        required: t('contact.form.required_error'),
                                        minLength: {
                                            value: 10,
                                            message: t('contact.form.message_min_error')
                                        }
                                    })}
                                    rows={6}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                                    placeholder={t('contact.form.message_placeholder')}
                                />
                                {errors.message && (
                                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-gold to-lightGold text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        {t('contact.form.sending')}
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane className="mr-3" />
                                        {t('contact.form.submit')}
                                    </>
                                )}
                            </button>

                            <p className="text-sm text-gray-500 text-center">
                                {t('contact.form.response_time')}
                            </p>
                        </form>

                        {/* WhatsApp Quick Contact */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-bordeaux mb-1">{t('contact.quick_contact.title')}</h4>
                                    <p className="text-sm text-gray-600">{t('contact.quick_contact.desc')}</p>
                                </div>
                                <a
                                    href="https://wa.me/905338748646"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                                >
                                    <FaWhatsapp className="mr-2" />
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 pt-16 border-t border-gray-200"
                >
                    <h2 className="text-3xl font-playfair font-bold text-bordeaux text-center mb-12">
                        {t('contact.faq.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                q: t('contact.faq.q1'),
                                a: t('contact.faq.a1')
                            },
                            {
                                q: t('contact.faq.q2'),
                                a: t('contact.faq.a2')
                            },
                            {
                                q: t('contact.faq.q3'),
                                a: t('contact.faq.a3')
                            },
                            {
                                q: t('contact.faq.q4'),
                                a: t('contact.faq.a4')
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <h3 className="font-bold text-bordeaux mb-3">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Contact
