import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Vérifier l'authentification au chargement
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token')
        if (token) {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
                // Verify token with backend
                const response = await fetch(`${baseUrl}/auth/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData)
                    setIsAuthenticated(true)
                } else {
                    // Token invalid, clear it
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                }
            } catch (error) {
                console.error('Auth check error:', error)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
            }
        }
        setLoading(false)
    }

    const login = async (email, password) => {
        try {
            // Connect to backend JWT login API
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const response = await fetch(`${baseUrl}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email, // Backend expects username field
                    password: password,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                // Store JWT tokens
                localStorage.setItem('access_token', data.access)
                localStorage.setItem('refresh_token', data.refresh)

                // Fetch user profile
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
                const profileResponse = await fetch(`${baseUrl}/auth/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${data.access}`,
                    },
                })

                if (profileResponse.ok) {
                    const userData = await profileResponse.json()
                    setUser(userData)
                    setIsAuthenticated(true)
                }
            } else {
                throw new Error(data.detail || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const register = async (data) => {
        try {
            // Connect to backend registration API
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const response = await fetch(`${baseUrl}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (response.ok) {
                // Auto-login after registration if tokens are returned
                if (result.access && result.refresh) {
                    localStorage.setItem('access_token', result.access)
                    localStorage.setItem('refresh_token', result.refresh)

                    // Fetch user profile
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
                    const profileResponse = await fetch(`${baseUrl}/auth/profile/`, {
                        headers: {
                            'Authorization': `Bearer ${result.access}`,
                        },
                    })

                    if (profileResponse.ok) {
                        const userData = await profileResponse.json()
                        setUser(userData)
                        setIsAuthenticated(true)
                    }
                }
            } else {
                // Extract specific error messages if available
                let errorMessage = 'Registration failed'
                if (result) {
                    if (typeof result === 'object') {
                        // Handle Django Rest Framework validation errors
                        const errors = []
                        for (const [key, value] of Object.entries(result)) {
                            errors.push(`${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
                        }
                        if (errors.length > 0) {
                            errorMessage = errors.join(' | ')
                        } else if (result.detail) {
                            errorMessage = result.detail
                        }
                    } else if (typeof result === 'string') {
                        errorMessage = result
                    }
                }
                throw new Error(errorMessage)
            }
        } catch (error) {
            console.error('Registration error details:', error)
            throw error
        }
    }

    const logout = () => {
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
    }

    const updateUser = (userData) => {
        setUser(userData)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateUser, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
