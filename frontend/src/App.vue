<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="container">
        <div class="nav-content">
          <h1 class="nav-brand">App Quiz</h1>
          <div class="nav-menu">
            <router-link to="/dashboard" class="nav-link"
              >Dashboard</router-link
            >
            <router-link to="/questions" class="nav-link"
              >Questions</router-link
            >
            <router-link v-if="isAdmin" to="/game" class="nav-link"
              >Game</router-link
            >
          </div>
          <div class="nav-actions">
            <span class="user-greeting">Hello, {{ user?.name }}!</span>
            <button @click="logout" class="btn btn-secondary">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { auth } from "./services/auth"

export default {
  name: "App",
  setup() {
    const router = useRouter()

    const isAuthenticated = computed(() => auth.isAuthenticated.value)
    const user = computed(() => auth.user.value)
    console.log("🚀 ~ setup ~ user:", user.value)
    const isAdmin = computed(() => auth.isAdmin.value)
    console.log("🚀 ~ setup ~ isAdmin:", isAdmin.value)

    const logout = () => {
      auth.logout()
      router.push("/login")
    }

    onMounted(() => {
      auth.checkAuth()
    })

    return {
      isAuthenticated,
      user,
      isAdmin,
      logout,
    }
  },
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: #f8f9fa;
  color: var(--primary-color);
}

.nav-link.router-link-active {
  background: var(--primary-color);
  color: white;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
}

.user-greeting {
  font-weight: 500;
  color: var(--text-light);
}

.main-content {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}
</style>
