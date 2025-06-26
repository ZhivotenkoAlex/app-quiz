<template>
  <div class="dashboard-page">
    <div class="container">
      <div class="dashboard-header">
        <h1>{{ $t("dashboard.title") }}</h1>
        <p>{{ $t("dashboard.subtitle") }}</p>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <h3>{{ $t("dashboard.profile") }}</h3>
          <div v-if="editingProfile" class="profile-edit">
            <div class="form-group">
              <label class="form-label">{{ $t("dashboard.name") }}</label>
              <input
                v-model="profileForm.name"
                type="text"
                class="form-input"
                :placeholder="$t('dashboard.name')"
                required
              />
            </div>
            <div class="profile-actions">
              <button
                @click="saveProfile"
                class="btn btn-primary"
                :disabled="updatingProfile"
              >
                <span v-if="updatingProfile" class="loading"></span>
                {{
                  updatingProfile
                    ? $t("dashboard.saving")
                    : $t("dashboard.save")
                }}
              </button>
              <button @click="cancelProfileEdit" class="btn btn-secondary">
                {{ $t("dashboard.cancel") }}
              </button>
            </div>
          </div>
          <div v-else class="profile-info">
            <p>
              <strong>{{ $t("dashboard.name") }}:</strong> {{ user?.name }}
            </p>
            <p>
              <strong>{{ $t("dashboard.email") }}:</strong> {{ user?.email }}
            </p>
            <p>
              <strong>{{ $t("dashboard.questionsCreated") }}:</strong>
              {{ questionCount }}
            </p>
            <button
              @click="startProfileEdit"
              class="btn btn-secondary btn-small"
              style="margin-top: 1rem"
            >
              {{ $t("dashboard.editProfile") }}
            </button>
            <button
              @click="testTokenRefresh"
              class="btn btn-primary btn-small"
              style="margin-top: 1rem; margin-left: 0.5rem"
            >
              🔄 Test Token Refresh
            </button>
            <button
              @click="testAuthCall"
              class="btn btn-secondary btn-small"
              style="margin-top: 1rem; margin-left: 0.5rem"
            >
              🔐 Test Auth Call
            </button>
          </div>
        </div>
      </div>

      <div v-if="message" class="alert" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { auth } from "../services/auth"
import api from "../services/api"

export default {
  name: "Dashboard",
  setup() {
    const { t } = useI18n()
    const user = computed(() => auth.user.value)
    const loading = ref(false)
    const saving = ref(false)
    const updatingProfile = ref(false)
    const editingProfile = ref(false)
    const message = ref("")
    const messageType = ref("alert-success")
    const profileForm = ref({ name: "" })

    const userNotes = ref("")
    const favoriteColor = ref("")
    const savedData = ref(null)
    const questionCount = ref(0)

    const showMessage = (text, type = "alert-success") => {
      message.value = text
      messageType.value = type
      setTimeout(() => {
        message.value = ""
      }, 3000)
    }

    const saveData = async () => {
      saving.value = true
      try {
        const data = {
          notes: userNotes.value,
          favoriteColor: favoriteColor.value,
          timestamp: new Date().toISOString(),
        }

        await api.post("/user/data", { data })
        savedData.value = { ...data, updated_at: new Date().toISOString() }
        showMessage("Data saved successfully!")
      } catch (error) {
        showMessage(
          "Failed to save data: " +
            (error.response?.data?.error || error.message),
          "alert-error"
        )
      } finally {
        saving.value = false
      }
    }

    const loadUserData = async () => {
      loading.value = true
      try {
        const response = await api.get("/user/data")
        if (response.data.data) {
          savedData.value = {
            ...response.data.data,
            updated_at: response.data.updated_at,
          }
          userNotes.value = response.data.data.notes || ""
          favoriteColor.value = response.data.data.favoriteColor || ""
          // showMessage("Data loaded successfully!") // Removed to reduce UI updates
        }
      } catch (error) {
        showMessage(
          "Failed to load data: " +
            (error.response?.data?.error || error.message),
          "alert-error"
        )
      } finally {
        loading.value = false
      }
    }

    const clearData = () => {
      userNotes.value = ""
      favoriteColor.value = ""
      showMessage("Local data cleared!")
    }

    const loadQuestionCount = async () => {
      try {
        const response = await api.get("/questions")
        questionCount.value = response.data.questions.length
      } catch (error) {
        console.error("Failed to load question count:", error)
        questionCount.value = 0
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return "N/A"
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const startProfileEdit = () => {
      editingProfile.value = true
      profileForm.value.name = user.value?.name || ""
    }

    const cancelProfileEdit = () => {
      editingProfile.value = false
      profileForm.value.name = ""
    }

    const saveProfile = async () => {
      updatingProfile.value = true

      try {
        if (!profileForm.value.name.trim()) {
          showMessage(t("messages.fillAllFields"), "alert-error")
          return
        }

        const response = await api.put("/user/profile", {
          name: profileForm.value.name.trim(),
        })

        // Update the user in auth store
        auth.updateUser(response.data.user)

        showMessage(t("messages.profileUpdated"))
        editingProfile.value = false
      } catch (error) {
        showMessage(
          "Failed to update profile: " +
            (error.response?.data?.error || error.message),
          "alert-error"
        )
      } finally {
        updatingProfile.value = false
      }
    }

    const testTokenRefresh = async () => {
      try {
        // console.log("🧪 Testing token refresh...")
        // console.log("Current token:", auth.token.value?.substring(0, 20) + "...")

        // Manually call the refresh endpoint
        const result = await auth.refreshTokens()

        // if (result.success) {
        // showMessage("✅ Token refreshed successfully!")
        // console.log("New token:", auth.token.value?.substring(0, 20) + "...")
        // } else {
        //   showMessage("❌ Token refresh failed: " + result.error, "alert-error")
        // }
      } catch (error) {
        console.error("Token refresh test error:", error)
        showMessage(
          "❌ Token refresh test failed: " + error.message,
          "alert-error"
        )
      }
    }

    const testAuthCall = async () => {
      try {
        // console.log("🔐 Testing authenticated API call...")
        const response = await api.get("/test-auth")
        showMessage(
          "✅ Authenticated call successful! User: " + response.data.user
        )
        // console.log("Auth test response:", response.data)
      } catch (error) {
        console.error("Auth test error:", error)
        showMessage(
          "❌ Auth test failed: " +
            (error.response?.data?.error || error.message),
          "alert-error"
        )
      }
    }

    onMounted(() => {
      loadUserData()
      loadQuestionCount()
    })

    return {
      user,
      loading,
      saving,
      updatingProfile,
      editingProfile,
      message,
      messageType,
      profileForm,
      userNotes,
      favoriteColor,
      savedData,
      questionCount,
      saveData,
      loadUserData,
      clearData,
      loadQuestionCount,
      startProfileEdit,
      cancelProfileEdit,
      saveProfile,
      testTokenRefresh,
      testAuthCall,
      formatDate,
    }
  },
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: var(--text-light);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-info p {
  margin-bottom: 0.5rem;
}

.profile-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  min-width: auto;
}

.data-display {
  margin-top: 1rem;
}

.data-value {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 3px solid var(--primary-color);
}

.no-data {
  text-align: center;
  color: var(--text-light);
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-buttons .btn {
  flex: 1;
  min-width: 120px;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }
}
</style>
