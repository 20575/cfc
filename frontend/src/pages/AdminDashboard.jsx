import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import {
    Users,
    MessageSquare,
    Heart,
    Video,
    Calendar,
    Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const AdminDashboard = () => {
    const { user, isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState([])
    const [chartsData, setChartsData] = useState({ lineChart: [], pieChart: [] })
    const [recentActivities, setRecentActivities] = useState([])
    const [isLoadingData, setIsLoadingData] = useState(true)

    const COLORS = ['#D4AF37', '#722F37', '#4169E1', '#800080']

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/login')
                return
            }
            // Check for admin/pastor role
            if (user?.role !== 'ADMIN' && user?.role !== 'PASTOR') {
                navigate('/')
                return
            }
            fetchDashboardData()
        }
    }, [isAuthenticated, loading, user, navigate])

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const [statsRes, chartsRes, activityRes] = await Promise.all([
                fetch(`${baseUrl}/dashboard/stats/`, { headers }),
                fetch(`${baseUrl}/dashboard/charts/`, { headers }),
                fetch(`${baseUrl}/dashboard/activity/`, { headers })
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (chartsRes.ok) setChartsData(await chartsRes.json())
            if (activityRes.ok) setRecentActivities(await activityRes.json())

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoadingData(false)
        }
    }

    if (loading || isLoadingData) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bordeaux"></div>
            </div>
        )
    }

    // Map icon strings back to components
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'FaUsers': return Users;
            case 'FaPray': return MessageSquare;
            case 'FaDonate': return Heart;
            case 'FaVideo': return Video;
            case 'FaCalendarAlt': return Calendar;
            case 'FaImage': return ImageIcon;
            default: return Users;
        }
    }

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = getIcon(stat.icon)
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                    <p className="text-green-500 text-sm mt-1">{stat.change}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-full`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Line Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Dons (6 derniers mois)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartsData.lineChart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} name="Montant (€)" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Utilisateurs par Rôle</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartsData.pieChart}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartsData.pieChart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}+
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Recent Activities */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h2 className="text-xl font-semibold mb-4">Activités récentes</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Utilisateur</th>
                                <th className="text-left py-3 px-4">Action</th>
                                <th className="text-left py-3 px-4">Date</th>
                                <th className="text-left py-3 px-4">Détail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivities.map((activity) => (
                                <tr key={activity.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{activity.user}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-3 py-1 rounded-full text-sm ${activity.action === 'Inscription' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {activity.action}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">{activity.time}</td>
                                    <td className="py-3 px-4 font-semibold">{activity.amount}</td>
                                </tr>
                            ))}
                            {recentActivities.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-gray-500">Aucune activité récente</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}

export default AdminDashboard
