import { ref, computed } from 'vue'
import api from './api'

const token = ref(localStorage.getItem('token'))
const user = ref(null)

export const auth = {
    token: computed(() => token.value),
    user: user,  // Export the ref directly, not as computed
    isAuthenticated: computed(() => !!token.value),
    isAdmin: computed(() => user.value?.isAdmin || false),

    async login(email, password) {
        try {
            const response = await api.post('/login', { email, password })
            const { token: newToken, user: userData, isAdmin: isAdminData } = response.data

            token.value = newToken
            user.value = userData
            isAdmin.value = isAdminData
            localStorage.setItem('token', newToken)

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            }
        }
    },

    async register(email, password, name) {
        try {
            const response = await api.post('/register', { email, password, name })
            const { token: newToken, user: userData } = response.data

            token.value = newToken
            user.value = userData
            localStorage.setItem('token', newToken)

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            }
        }
    },

    logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
    },

    async checkAuth() {
        if (!token.value) return

        try {
            // For now, we'll skip the profile check since we don't have that endpoint
            // We'll just keep the user logged in if they have a token
            if (token.value && !user.value) {
                // Token exists but no user data, let them re-login
                this.logout()
            }
        } catch (error) {
            this.logout()
        }
    },

    updateUser(userData) {
        user.value = userData
    }
} 