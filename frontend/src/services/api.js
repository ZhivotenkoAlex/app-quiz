import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    failedQueue = []
}

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            // console.log('🔄 Token expired, attempting refresh...');
            if (isRefreshing) {
                // console.log('⏳ Refresh already in progress, queuing request...');
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                // Use raw axios to avoid circular dependency
                const response = await axios.post(`${API_BASE_URL}/refresh`, {
                    refreshToken: refreshToken
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const { token: newToken, refreshToken: newRefreshToken, user } = response.data

                localStorage.setItem('token', newToken)
                localStorage.setItem('refreshToken', newRefreshToken)
                localStorage.setItem('user', JSON.stringify(user))

                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
                originalRequest.headers.Authorization = `Bearer ${newToken}`

                // Update reactive state if auth is available
                if (window.__auth_update_tokens) {
                    window.__auth_update_tokens(newToken, newRefreshToken, user)
                }

                processQueue(null, newToken)
                // console.log('✅ Token refreshed successfully, retrying original request');

                return api(originalRequest)
            } catch (refreshError) {
                // console.log('❌ Token refresh failed, redirecting to login');
                processQueue(refreshError, null)
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api 