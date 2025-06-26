<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="container">
        <div class="nav-content">
          <h1 class="nav-brand">App Quiz</h1>

          <!-- Hamburger button (visible on mobile) -->
          <button
            class="hamburger-btn"
            @click="toggleMobileMenu"
            :class="{ active: mobileMenuOpen }"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div class="nav-menu" :class="{ 'mobile-open': mobileMenuOpen }">
            <router-link
              to="/dashboard"
              class="nav-link"
              @click="closeMobileMenu"
            >
              {{ $t("nav.dashboard") }}
            </router-link>
            <router-link
              to="/questions"
              class="nav-link"
              @click="closeMobileMenu"
            >
              {{ $t("nav.questions") }}
            </router-link>
            <router-link to="/rooms" class="nav-link" @click="closeMobileMenu">
              {{ $t("nav.rooms") }}
            </router-link>
            <router-link to="/game" class="nav-link" @click="closeMobileMenu">
              {{ $t("nav.game") }}
            </router-link>
            <router-link to="/about" class="nav-link" @click="closeMobileMenu">
              {{ $t("nav.about") }}
            </router-link>

            <!-- Mobile nav actions (inside hamburger menu) -->
            <div class="mobile-nav-actions">
              <LanguageSwitcher />
              <span class="user-greeting">{{
                $t("nav.hello", { name: user?.name })
              }}</span>
              <button @click="logout" class="btn btn-secondary">
                {{ $t("nav.logout") }}
              </button>
            </div>
          </div>

          <div class="nav-actions desktop-actions">
            <LanguageSwitcher />
            <span class="user-greeting">{{
              $t("nav.hello", { name: user?.name })
            }}</span>
            <button @click="logout" class="btn btn-secondary">
              {{ $t("nav.logout") }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <InstallPrompt />
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { auth } from "./services/auth"
import InstallPrompt from "./components/InstallPrompt.vue"
import LanguageSwitcher from "./components/LanguageSwitcher.vue"

export default {
  name: "App",
  components: {
    InstallPrompt,
    LanguageSwitcher,
  },
  setup() {
    const router = useRouter()
    const mobileMenuOpen = ref(false)

    const isAuthenticated = computed(() => auth.isAuthenticated.value)
    const user = computed(() => auth.user.value)
    const isAdmin = computed(() => auth.isAdmin.value)

    const logout = () => {
      auth.logout()
      router.push("/login")
    }

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      mobileMenuOpen.value = false
    }

    onMounted(() => {
      auth.checkAuth()
    })

    return {
      isAuthenticated,
      user,
      isAdmin,
      mobileMenuOpen,
      logout,
      toggleMobileMenu,
      closeMobileMenu,
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
  flex-wrap: wrap;
}

/* Prevent wrapping only above 1200px (matching container max-width) */
@media (min-width: 1200px) {
  .nav-content {
    flex-wrap: nowrap;
  }
}

.nav-brand {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 600;
}

/* Hamburger button */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger-btn span {
  width: 100%;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(8px, -8px);
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  padding: 0.25rem 0;
}

.mobile-nav-actions {
  display: none;
}

/* Mobile hamburger menu styles */
@media (max-width: 1100px) {
  .hamburger-btn {
    display: flex;
  }

  .nav-actions.desktop-actions {
    display: none !important;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: white;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 80px 2rem 2rem;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
  }

  .nav-menu.mobile-open {
    right: 0;
  }

  .nav-link {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
    width: 100%;
  }

  .nav-link:last-of-type {
    border-bottom: none;
  }

  .mobile-nav-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #f0f0f0;
  }

  .mobile-nav-actions .user-greeting {
    text-align: center;
    padding: 0.5rem;
  }
}

/* Enable scrolling for screens between 1100px and 1200px */
@media (min-width: 1100px) and (max-width: 1200px) {
  .nav-menu {
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    justify-content: flex-start;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .nav-menu::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  white-space: nowrap; /* Prevent text wrapping */
  flex-shrink: 0; /* Prevent links from shrinking */
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
