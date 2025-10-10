import { useState, useEffect } from 'react'
import api from './api'

export function useAuth() {
    const [user, setUser] = useState('null')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        if (token && storedUser) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            setUser(JSON.parse(storedUser))
            setLoading(false)
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        return user
    }

    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password })
        const { token, user } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        return user
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/me')
            const user = response.data.user
            setUser(user)
            localStorage.setItem('user', JSON.stringify(user))
            return user
        } catch (err) {
            logout() // If token invalid, logout
            throw err
        }
    }

    return { user, loading, login, register, logout, fetchProfile }
}
