import { create } from 'zustand'
import axios from 'axios'

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (username, password) => {
    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      
      const response = await axios.post('/api/auth/login', formData)
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      set({ token: access_token, isAuthenticated: true })
      
      await get().fetchUser()
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  },

  register: async (userData) => {
    try {
      await axios.post('/api/auth/register', userData)
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  },

  fetchUser: async () => {
    try {
      const token = get().token
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ user: response.data })
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
  }
}))

export default useAuthStore
