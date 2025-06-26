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
          </div>
        </div>

        <!-- User Statistics (Admin Only) -->
        <div v-if="user?.isAdmin" class="card user-stats-card">
          <h3>{{ $t("dashboard.userStats") }}</h3>
          <div v-if="loadingStats" class="loading-stats">
            <div class="loading"></div>
            <p>{{ $t("common.loading") }}...</p>
          </div>
          <div v-else-if="userStats.length === 0" class="no-stats">
            {{ $t("dashboard.noStats") }}
          </div>
          <div v-else class="stats-list">
            <div
              v-for="stat in userStats"
              :key="stat.creator_name"
              class="user-stat-item"
            >
              <div class="stat-header">
                <h4>{{ stat.creator_name }}</h4>
                <span class="total-count"
                  >{{ $t("dashboard.totalQuestions") }}:
                  {{ stat.total_questions }}</span
                >
              </div>
              <div class="addressee-breakdown">
                <div
                  v-for="addressee in stat.by_addressee"
                  :key="addressee.addressee_name"
                  class="addressee-item"
                >
                  <span class="addressee-name">{{
                    addressee.addressee_name
                  }}</span>
                  <span class="question-count">{{
                    addressee.question_count
                  }}</span>
                </div>
              </div>
            </div>
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
    const userStats = ref([])
    const loadingStats = ref(false)

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

    const loadUserStats = async () => {
      if (!user.value?.isAdmin) return

      loadingStats.value = true
      try {
        const response = await api.get("/admin/user-stats")
        userStats.value = response.data.stats
      } catch (error) {
        console.error("Failed to load user stats:", error)
        showMessage(
          "Failed to load user statistics: " +
            (error.response?.data?.error || error.message),
          "alert-error"
        )
      } finally {
        loadingStats.value = false
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

    onMounted(() => {
      loadUserData()
      loadQuestionCount()
      loadUserStats()
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
      userStats,
      loadingStats,
      saveData,
      loadUserData,
      clearData,
      loadQuestionCount,
      loadUserStats,
      startProfileEdit,
      cancelProfileEdit,
      saveProfile,
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

.user-stats-card {
  grid-column: 1 / -1;
}

.loading-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.no-stats {
  text-align: center;
  color: var(--text-light);
  font-style: italic;
  padding: 2rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-stat-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.stat-header h4 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.total-count {
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.addressee-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.addressee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}

.addressee-name {
  font-weight: 500;
  color: var(--text-color);
}

.question-count {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
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
