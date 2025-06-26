<template>
  <div class="questions-page">
    <div class="container">
      <div class="questions-header">
        <h1>{{ $t("questions.title") }}</h1>
        <p>{{ $t("questions.subtitle") }}</p>
      </div>

      <div class="questions-content">
        <div class="card">
          <h3>{{ $t("questions.addQuestions") }}</h3>

          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div v-if="success" class="alert alert-success">
            {{ success }}
          </div>

          <div class="questions-form">
            <div
              v-for="(question, index) in questions"
              :key="index"
              class="question-item"
            >
              <div class="question-row">
                <div class="question-input-group">
                  <label class="form-label"
                    >{{ $t("questions.question") }} {{ index + 1 }}</label
                  >
                  <textarea
                    v-model="question.text"
                    class="form-input question-textarea"
                    :placeholder="
                      $t('questions.enterQuestion', { number: index + 1 })
                    "
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div class="addressee-group">
                  <label class="form-label">{{
                    $t("questions.addressedTo")
                  }}</label>
                  <select
                    v-model="question.addresseeId"
                    class="form-input addressee-select"
                    required
                  >
                    <option value="">{{ $t("questions.selectUser") }}</option>
                    <option
                      v-for="user in users"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <div class="question-actions">
                  <button
                    @click="removeQuestion(index)"
                    v-if="questions.length > 1"
                    class="btn btn-danger btn-small"
                    type="button"
                  >
                    {{ $t("questions.remove") }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                @click="addQuestion"
                class="btn btn-secondary"
                type="button"
              >
                + {{ $t("questions.addAnother") }}
              </button>

              <div class="save-section">
                <button
                  @click="saveQuestions"
                  class="btn btn-primary"
                  :disabled="saving || !canSave"
                >
                  <span v-if="saving" class="loading"></span>
                  {{
                    saving
                      ? $t("questions.saving")
                      : $t("questions.saveQuestions")
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Statistics -->
        <div class="card">
          <h3>{{ $t("questions.createdBy") }}</h3>
          <div
            v-if="questionStats && questionStats.length > 0"
            class="stats-grid"
          >
            <div v-for="stat in questionStats" :key="stat.id" class="stat-card">
              <div class="stat-info">
                <h4>{{ stat.name }}</h4>
                <!-- <p class="stat-email">{{ stat.email }}</p> -->
              </div>
              <div class="stat-count">
                <span class="count-number">{{ stat.question_count }}</span>
                <span class="count-label">{{
                  $t("questions.question").toLowerCase()
                }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-stats">
            <p>{{ $t("questions.noQuestions") }}</p>
          </div>
        </div>

        <!-- Display existing questions -->
        <div class="card" v-if="existingQuestions.length > 0">
          <h3>{{ $t("questions.myQuestions") }}</h3>
          <div class="questions-list">
            <div
              v-for="question in existingQuestions"
              :key="question.id"
              class="question-card"
            >
              <div
                v-if="editingQuestion?.id === question.id"
                class="question-edit"
              >
                <div class="form-group">
                  <label class="form-label">{{
                    $t("questions.editQuestion")
                  }}</label>
                  <textarea
                    v-model="editForm.text"
                    class="form-input"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">{{
                    $t("questions.addressedTo")
                  }}</label>
                  <select
                    v-model="editForm.addresseeId"
                    class="form-input"
                    required
                  >
                    <option value="">{{ $t("questions.selectUser") }}</option>
                    <option
                      v-for="user in users"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <div class="question-actions">
                  <button
                    @click="saveEdit(question.id)"
                    class="btn btn-primary btn-small"
                    :disabled="updating"
                  >
                    <span v-if="updating" class="loading"></span>
                    {{
                      updating ? $t("questions.saving") : $t("questions.save")
                    }}
                  </button>
                  <button
                    @click="cancelEdit"
                    class="btn btn-secondary btn-small"
                  >
                    {{ $t("questions.cancel") }}
                  </button>
                </div>
              </div>

              <div v-else class="question-content">
                <p class="question-text">{{ question.question_text }}</p>
                <div class="question-meta">
                  <span class="addressee">
                    📧 {{ $t("questions.to") }}: {{ question.addressee_name }}
                  </span>
                  <!-- <span class="date">
                    📅 {{ formatDate(question.created_at) }}
                  </span> -->
                </div>
                <div class="question-actions">
                  <button
                    @click="startEdit(question)"
                    class="btn btn-secondary btn-small"
                  >
                    {{ $t("questions.edit") }}
                  </button>
                  <button
                    @click="deleteQuestion(question.id)"
                    class="btn btn-danger btn-small"
                    :disabled="deleting === question.id"
                  >
                    <span
                      v-if="deleting === question.id"
                      class="loading"
                    ></span>
                    {{
                      deleting === question.id
                        ? $t("questions.deleting")
                        : $t("questions.delete")
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import api from "../services/api"
import { auth } from "../services/auth"

export default {
  name: "Questions",
  setup() {
    const { t } = useI18n()
    const users = ref([])
    const questions = ref([{ text: "", addresseeId: "" }])
    const existingQuestions = ref([])
    const questionStats = ref(null)
    const loading = ref(false)
    const saving = ref(false)
    const updating = ref(false)
    const deleting = ref(null)
    const error = ref("")
    const success = ref("")
    const editingQuestion = ref(null)
    const editForm = ref({ text: "", addresseeId: "" })

    const currentUserId = computed(() => auth.user.value?.id)
    const user = computed(() => auth.user.value)

    const canSave = computed(() => {
      return questions.value.some((q) => q.text.trim() && q.addresseeId)
    })

    const showMessage = (message, type = "success") => {
      if (type === "success") {
        success.value = message
        error.value = ""
      } else {
        error.value = message
        success.value = ""
      }

      setTimeout(() => {
        success.value = ""
        error.value = ""
      }, 5000)
    }

    const loadUsers = async () => {
      try {
        const response = await api.get("/users")
        users.value = response.data.users
      } catch (err) {
        showMessage(
          "Failed to load users: " + (err.response?.data?.error || err.message),
          "error"
        )
      }
    }

    const loadQuestions = async () => {
      try {
        const response = await api.get("/questions")
        existingQuestions.value = response.data.questions
      } catch (err) {
        console.error("Failed to load questions:", err)
      }
    }

    const loadQuestionStats = async () => {
      try {
        const response = await api.get("/questions/stats")
        questionStats.value = response.data.stats
      } catch (err) {
        console.error("Failed to load question stats:", err)
        questionStats.value = []
      }
    }

    const addQuestion = () => {
      questions.value.push({ text: "", addresseeId: "" })
    }

    const removeQuestion = (index) => {
      questions.value.splice(index, 1)
    }

    const saveQuestions = async () => {
      saving.value = true

      try {
        const validQuestions = questions.value.filter(
          (q) => q.text.trim() && q.addresseeId
        )

        if (validQuestions.length === 0) {
          showMessage(t("messages.addValidQuestion"), "error")
          return
        }

        await api.post("/questions", { questions: validQuestions })

        showMessage(
          t("messages.questionsSaved", { count: validQuestions.length })
        )

        // Reset form
        questions.value = [{ text: "", addresseeId: "" }]

        // Reload questions and stats
        await loadQuestions()
        await loadQuestionStats()
      } catch (err) {
        showMessage(
          "Failed to save questions: " +
            (err.response?.data?.error || err.message),
          "error"
        )
      } finally {
        saving.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const startEdit = (question) => {
      editingQuestion.value = question
      editForm.value = {
        text: question.question_text,
        addresseeId:
          question.addressee_id || findUserIdByName(question.addressee_name),
      }
    }

    const findUserIdByName = (name) => {
      const user = users.value.find((u) => u.name === name)
      return user ? user.id : ""
    }

    const cancelEdit = () => {
      editingQuestion.value = null
      editForm.value = { text: "", addresseeId: "" }
    }

    const saveEdit = async (questionId) => {
      updating.value = true

      try {
        if (!editForm.value.text.trim() || !editForm.value.addresseeId) {
          showMessage(t("messages.fillAllFields"), "error")
          return
        }

        await api.put(`/questions/${questionId}`, {
          question_text: editForm.value.text.trim(),
          addressee_id: editForm.value.addresseeId,
        })

        showMessage(t("messages.questionUpdated"))
        cancelEdit()
        await loadQuestions()
        await loadQuestionStats()
      } catch (err) {
        showMessage(
          "Failed to update question: " +
            (err.response?.data?.error || err.message),
          "error"
        )
      } finally {
        updating.value = false
      }
    }

    const deleteQuestion = async (questionId) => {
      if (!confirm(t("messages.confirmDelete"))) {
        return
      }

      deleting.value = questionId

      try {
        await api.delete(`/questions/${questionId}`)
        showMessage(t("messages.questionDeleted"))
        await loadQuestions()
        await loadQuestionStats()
      } catch (err) {
        showMessage(
          "Failed to delete question: " +
            (err.response?.data?.error || err.message),
          "error"
        )
      } finally {
        deleting.value = null
      }
    }

    onMounted(async () => {
      loading.value = true
      await Promise.all([loadUsers(), loadQuestions(), loadQuestionStats()])
      loading.value = false
    })

    return {
      users,
      questions,
      existingQuestions,
      questionStats,
      currentUserId,
      user,
      loading,
      saving,
      updating,
      deleting,
      error,
      success,
      canSave,
      editingQuestion,
      editForm,
      addQuestion,
      removeQuestion,
      saveQuestions,
      startEdit,
      cancelEdit,
      saveEdit,
      deleteQuestion,
      formatDate,
    }
  },
}
</script>

<style scoped>
.questions-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.questions-header {
  text-align: center;
  margin-bottom: 3rem;
}

.questions-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.questions-header p {
  font-size: 1.1rem;
  color: var(--text-light);
}

.questions-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.questions-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-item {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  background: #f8f9fa;
}

.question-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 1rem;
  align-items: start;
}

.question-input-group {
  display: flex;
  flex-direction: column;
}

.question-textarea {
  min-height: 80px;
  resize: vertical;
}

.addressee-group {
  display: flex;
  flex-direction: column;
}

.addressee-select {
  height: auto;
  padding: 12px;
}

.question-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 12px;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-small {
  padding: 8px 16px;
  font-size: 12px;
  min-width: auto;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #e9ecef;
}

.save-section {
  display: flex;
  gap: 1rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

.question-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-text {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-light);
}

.question-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.current-user {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%);
}

.stat-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 600;
}

.stat-email {
  margin: 0;
  color: var(--text-light);
  font-size: 0.85rem;
}

.stat-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.count-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.count-label {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-stats {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .question-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .save-section {
    justify-content: center;
  }

  .question-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
