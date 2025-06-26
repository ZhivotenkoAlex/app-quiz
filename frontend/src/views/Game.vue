<template>
  <div class="game-page">
    <div class="container">
      <div class="game-header">
        <h1>{{ $t("game.title") }}</h1>
        <p>{{ $t("game.subtitle") }}</p>
      </div>

      <div class="game-content">
        <!-- Loading State -->
        <div v-if="loading" class="card text-center">
          <div class="loading-spinner">
            <div class="loading"></div>
            <p>{{ $t("game.loading") }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="card">
          <div class="alert alert-error">
            {{ error }}
          </div>
          <div class="text-center">
            <button @click="loadQuestions" class="btn btn-primary">
              {{ $t("game.tryAgain") }}
            </button>
          </div>
        </div>

        <!-- No Questions State -->
        <div
          v-else-if="!currentQuestion && questions.length === 0"
          class="card text-center"
        >
          <div class="no-questions">
            <h3>{{ $t("game.noQuestions") }}</h3>
            <p>{{ $t("game.noQuestionsDesc") }}</p>
            <router-link to="/questions" class="btn btn-primary">
              {{ $t("game.createQuestions") }}
            </router-link>
          </div>
        </div>

        <!-- Game Complete State -->
        <div v-else-if="gameComplete" class="card text-center">
          <div class="game-complete">
            <h3>🎉 {{ $t("game.completed") }}</h3>
            <p>{{ $t("game.answeredAll", { count: totalQuestions }) }}</p>
            <div class="complete-actions">
              <button @click="restartGame" class="btn btn-primary">
                {{ $t("game.playAgain") }}
              </button>
              <router-link to="/questions" class="btn btn-secondary">
                {{ $t("game.addMore") }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- Game Playing State -->
        <div v-else-if="currentQuestion" class="card">
          <div class="game-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <p class="progress-text">
              {{
                $t("game.progress", {
                  current: currentQuestionIndex + 1,
                  total: totalQuestions,
                })
              }}
            </p>
          </div>

          <div class="question-display">
            <div class="addressee-name">
              {{ currentQuestion.addressee_name }}
            </div>

            <div class="question-text">
              {{ currentQuestion.question_text }}
            </div>
          </div>

          <div class="game-actions">
            <button @click="nextQuestion" class="btn btn-primary btn-large">
              {{ isLastQuestion ? $t("game.finish") : $t("game.next") }}
            </button>

            <div class="game-controls">
              <button @click="restartGame" class="btn btn-secondary btn-small">
                {{ $t("game.restart") }}
              </button>
              <button @click="skipQuestion" class="btn btn-secondary btn-small">
                {{ $t("game.skip") }}
              </button>
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

export default {
  name: "Game",
  setup() {
    const { t } = useI18n()
    const questions = ref([])
    const currentQuestionIndex = ref(0)
    const shownQuestions = ref(new Set())
    const loading = ref(false)
    const error = ref("")
    const gameComplete = ref(false)

    const currentQuestion = computed(() => {
      return questions.value[currentQuestionIndex.value] || null
    })

    const totalQuestions = computed(() => questions.value.length)

    const progressPercentage = computed(() => {
      if (totalQuestions.value === 0) return 0
      return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100
    })

    const isLastQuestion = computed(() => {
      return currentQuestionIndex.value === totalQuestions.value - 1
    })

    const loadQuestions = async () => {
      loading.value = true
      error.value = ""

      try {
        const response = await api.get("/game/questions")
        questions.value = response.data.questions

        if (questions.value.length === 0) {
          gameComplete.value = false
        } else {
          currentQuestionIndex.value = 0
          shownQuestions.value = new Set()
          gameComplete.value = false
        }
      } catch (err) {
        error.value =
          t("game.failedToLoad") +
          ": " +
          (err.response?.data?.error || err.message)
      } finally {
        loading.value = false
      }
    }

    const nextQuestion = () => {
      if (currentQuestion.value) {
        shownQuestions.value.add(currentQuestion.value.id)
      }

      if (isLastQuestion.value) {
        gameComplete.value = true
        return
      }

      currentQuestionIndex.value++
    }

    const skipQuestion = () => {
      nextQuestion()
    }

    const restartGame = () => {
      currentQuestionIndex.value = 0
      shownQuestions.value = new Set()
      gameComplete.value = false
      loadQuestions()
    }

    onMounted(() => {
      loadQuestions()
    })

    return {
      questions,
      currentQuestion,
      currentQuestionIndex,
      totalQuestions,
      loading,
      error,
      gameComplete,
      progressPercentage,
      isLastQuestion,
      loadQuestions,
      nextQuestion,
      skipQuestion,
      restartGame,
    }
  },
}
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.game-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.game-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.game-content {
  max-width: 800px;
  margin: 0 auto;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.loading-spinner p {
  color: var(--text-light);
  font-size: 1.1rem;
}

.no-questions,
.game-complete {
  padding: 3rem;
}

.no-questions h3,
.game-complete h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.no-questions p,
.game-complete p {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.complete-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-progress {
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color)
  );
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-light);
  margin: 0;
}

.question-display {
  text-align: center;
  padding: 2rem 0;
}

.addressee-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 1.3rem;
  line-height: 1.6;
  color: var(--text-color);
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  margin-bottom: 2rem;
}

.game-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.btn-large {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 200px;
}

.game-controls {
  display: flex;
  gap: 1rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  min-width: 80px;
}

@media (max-width: 768px) {
  .game-header h1 {
    font-size: 2rem;
  }

  .addressee-name {
    font-size: 1.2rem;
  }

  .question-text {
    font-size: 1.1rem;
    padding: 1rem;
  }

  .btn-large {
    padding: 0.8rem 2rem;
    font-size: 1rem;
    min-width: 150px;
  }

  .game-controls {
    flex-direction: column;
    align-items: center;
  }

  .complete-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
