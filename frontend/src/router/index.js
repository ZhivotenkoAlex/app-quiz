import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../services/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Questions from '../views/Questions.vue'
import Game from '../views/Game.vue'
import About from '../views/About.vue'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresGuest: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/questions',
        name: 'Questions',
        component: Questions,
        meta: { requiresAuth: true }
    },
    {
        path: '/game',
        name: 'Game',
        component: Game,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/about',
        name: 'About',
        component: About,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const isAuthenticated = auth.isAuthenticated.value
    const isAdmin = auth.isAdmin.value

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if (to.meta.requiresAdmin && !isAdmin) {
        next('/dashboard')
    } else if (to.meta.requiresGuest && isAuthenticated) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router 