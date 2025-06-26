<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="install-content">
      <div class="install-icon">📱</div>
      <div class="install-text">
        <h3>{{ $t("install.title") }}</h3>
        <p>{{ $t("install.subtitle") }}</p>
      </div>
      <div class="install-actions">
        <button @click="installApp" class="btn btn-primary btn-small">
          {{ $t("install.install") }}
        </button>
        <button @click="dismissPrompt" class="btn btn-secondary btn-small">
          {{ $t("install.later") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue"

export default {
  name: "InstallPrompt",
  setup() {
    const showInstallPrompt = ref(false)
    const deferredPrompt = ref(null)

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      deferredPrompt.value = e

      // Don't show if user already dismissed
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (!dismissed) {
        showInstallPrompt.value = true
      }
    }

    const installApp = async () => {
      if (deferredPrompt.value) {
        deferredPrompt.value.prompt()
        const { outcome } = await deferredPrompt.value.userChoice

        if (outcome === "accepted") {
          console.log("User accepted the install prompt")
        }

        deferredPrompt.value = null
        showInstallPrompt.value = false
      }
    }

    const dismissPrompt = () => {
      showInstallPrompt.value = false
      localStorage.setItem("pwa-install-dismissed", "true")
    }

    onMounted(() => {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

      // Check if already installed
      if (window.matchMedia("(display-mode: standalone)").matches) {
        showInstallPrompt.value = false
      }
    })

    return {
      showInstallPrompt,
      installApp,
      dismissPrompt,
    }
  },
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 400px;
  margin: 0 auto;
}

.install-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.install-icon {
  font-size: 2rem;
}

.install-text {
  flex: 1;
}

.install-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--text-color);
}

.install-text p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-light);
}

.install-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-width: auto;
}

@media (max-width: 768px) {
  .install-prompt {
    left: 10px;
    right: 10px;
  }

  .install-content {
    padding: 0.75rem;
  }

  .install-actions {
    flex-direction: column;
  }
}
</style>
