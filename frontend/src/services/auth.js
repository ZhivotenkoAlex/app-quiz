import { ref, computed } from 'vue'
import api from './api'

const token = ref(localStorage.getItem('token'))
const refreshToken = ref(localStorage.getItem('refreshToken'))
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

export const auth = {
    token: computed(() => token.value),
    refreshToken: computed(() => refreshToken.value),
    user: user,  // Export the ref directly, not as computed
    isAuthenticated: computed(() => !!token.value),
    isAdmin: computed(() => user.value?.isAdmin || false),

    async login(email, password) {
        try {
            const response = await api.post('/login', { email, password })
            const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data

            token.value = newToken
            refreshToken.value = newRefreshToken
            user.value = userData
            localStorage.setItem('token', newToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            localStorage.setItem('user', JSON.stringify(userData))

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
            const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data

            token.value = newToken
            refreshToken.value = newRefreshToken
            user.value = userData
            localStorage.setItem('token', newToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            localStorage.setItem('user', JSON.stringify(userData))

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
        refreshToken.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
    },

    async refreshTokens() {
        try {
            if (!refreshToken.value) {
                throw new Error('No refresh token available')
            }

            const response = await api.post('/refresh', {
                refreshToken: refreshToken.value
            })

            const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data

            token.value = newToken
            refreshToken.value = newRefreshToken
            user.value = userData
            localStorage.setItem('token', newToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            localStorage.setItem('user', JSON.stringify(userData))

            return { success: true }
        } catch (error) {
            this.logout()
            return { success: false, error: 'Token refresh failed' }
        }
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
        localStorage.setItem('user', JSON.stringify(userData))
    },

    // Internal method for API service to update tokens
    _updateTokens(newToken, newRefreshToken, userData) {
        token.value = newToken
        refreshToken.value = newRefreshToken
        user.value = userData
    }
}

// Export user ref directly for components that need it
export { user }

// Expose update function globally to avoid circular dependency
if (typeof window !== 'undefined') {
    window.__auth_update_tokens = auth._updateTokens
} 