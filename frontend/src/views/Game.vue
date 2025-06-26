<template>
  <div class="game-page">
    <div class="container">
      <div class="game-header">
        <h1>{{ $t("game.title") }}</h1>
        <p>{{ $t("game.subtitle") }}</p>
      </div>

      <div class="game-content">
        <!-- Room Selection -->
        <div v-if="!selectedRoom && !gameStarted" class="card text-center">
          <div class="room-selection">
            <h3>{{ $t("game.selectMode") }}</h3>
            <p>{{ $t("game.selectModeDesc") }}</p>
            <div class="mode-actions">
              <button @click="playWithoutRoom" class="btn btn-primary">
                {{ $t("game.playAll") }}
              </button>
            </div>
          </div>
        </div>

        <!-- Available Rooms List -->
        <div v-if="!selectedRoom && !gameStarted" class="card">
          <div class="available-rooms">
            <h3>{{ $t("game.availableRooms") }}</h3>
            <div v-if="loadingRooms" class="loading-rooms">
              {{ $t("common.loading") }}...
            </div>
            <div
              v-else-if="availableRooms.length === 0"
              class="no-available-rooms"
            >
              {{ $t("game.noAvailableRooms") }}
            </div>
            <div v-else class="rooms-list">
              <div
                v-for="room in availableRooms"
                :key="room.id"
                class="room-item"
                @click="openJoinModal(room)"
              >
                <div class="room-item-header">
                  <h4>{{ room.name }}</h4>
                  <span class="room-number">#{{ room.room_number }}</span>
                </div>
                <div class="room-item-info">
                  <span
                    >{{ $t("rooms.creator") }}: {{ room.creator_name }}</span
                  >
                  <span
                    >{{ $t("rooms.members") }}: {{ room.member_count }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Join Room Modal -->
        <div v-if="showJoinModal" class="modal-overlay" @click="closeJoinModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>{{ $t("game.joinRoom") }}: {{ selectedRoomToJoin?.name }}</h3>
              <button @click="closeJoinModal" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="joinSelectedRoom">
                <div class="form-group">
                  <label for="modalRoomPassword">{{
                    $t("rooms.password")
                  }}</label>
                  <input
                    id="modalRoomPassword"
                    v-model="joinModalPassword"
                    type="password"
                    :placeholder="$t('rooms.passwordPlaceholder')"
                    required
                    ref="passwordInput"
                  />
                </div>
                <div class="form-actions">
                  <button
                    type="submit"
                    :disabled="isJoiningRoom"
                    class="btn btn-primary"
                  >
                    {{
                      isJoiningRoom
                        ? $t("common.loading")
                        : $t("game.startGame")
                    }}
                  </button>
                  <button
                    type="button"
                    @click="closeJoinModal"
                    class="btn btn-secondary"
                  >
                    {{ $t("common.cancel") }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Room Info -->
        <div v-else-if="selectedRoom" class="card room-info-card">
          <div class="room-info">
            <h4>
              {{ $t("game.playingInRoom") }}: {{ selectedRoom.name }} (#{{
                selectedRoom.room_number
              }})
            </h4>
            <button @click="exitRoom" class="btn btn-secondary btn-small">
              {{ $t("game.exitRoom") }}
            </button>
          </div>
        </div>

        <!-- Playing All Questions Info -->
        <div v-else-if="gameStarted" class="card room-info-card">
          <div class="room-info">
            <h4>{{ $t("game.playingAllQuestions") }}</h4>
            <button @click="backToMenu" class="btn btn-secondary btn-small">
              {{ $t("game.backToMenu") }}
            </button>
          </div>
        </div>

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
import { ref, computed, onMounted, nextTick } from "vue"
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
    const selectedRoom = ref(null)
    const isJoiningRoom = ref(false)
    const availableRooms = ref([])
    const loadingRooms = ref(false)
    const showJoinModal = ref(false)
    const selectedRoomToJoin = ref(null)
    const joinModalPassword = ref("")
    const gameStarted = ref(false)

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
        const url = selectedRoom.value
          ? `/game/questions?room_id=${selectedRoom.value.id}`
          : "/game/questions"

        const response = await api.get(url)
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

    const loadAvailableRooms = async () => {
      loadingRooms.value = true
      try {
        const response = await api.get("/rooms/available")
        availableRooms.value = response.data.rooms
      } catch (err) {
        error.value = "Failed to load available rooms"
      } finally {
        loadingRooms.value = false
      }
    }

    const playWithoutRoom = () => {
      selectedRoom.value = null
      gameStarted.value = true
      localStorage.removeItem("selectedRoom")
      loadQuestions()
    }

    const openJoinModal = (room) => {
      selectedRoomToJoin.value = room
      joinModalPassword.value = ""
      showJoinModal.value = true
      // Focus password input after modal opens
      nextTick(() => {
        const passwordInput = document.getElementById("modalRoomPassword")
        if (passwordInput) passwordInput.focus()
      })
    }

    const closeJoinModal = () => {
      showJoinModal.value = false
      selectedRoomToJoin.value = null
      joinModalPassword.value = ""
    }

    const joinSelectedRoom = async () => {
      if (!joinModalPassword.value.trim()) {
        error.value = "Please enter the room password"
        return
      }

      isJoiningRoom.value = true
      try {
        const joinData = {
          room_number: selectedRoomToJoin.value.room_number,
          password: joinModalPassword.value,
        }

        const response = await api.post("/rooms/join", joinData)
        selectedRoom.value = response.data.room
        closeJoinModal()
        await loadQuestions()
      } catch (err) {
        error.value = err.response?.data?.error || "Failed to join room"
      } finally {
        isJoiningRoom.value = false
      }
    }

    const exitRoom = async () => {
      if (selectedRoom.value) {
        try {
          // Leave the room in the backend
          await api.post(`/rooms/${selectedRoom.value.id}/leave`)
        } catch (err) {
          // Even if leaving fails, we still exit locally
          console.error("Failed to leave room:", err)
        }
      }

      selectedRoom.value = null
      gameStarted.value = false
      localStorage.removeItem("selectedRoom")
      questions.value = []
      gameComplete.value = false
      error.value = ""

      // Reload available rooms to show updated member counts
      await loadAvailableRooms()
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

    const backToMenu = () => {
      gameStarted.value = false
      selectedRoom.value = null
      questions.value = []
      gameComplete.value = false
      error.value = ""
      loadAvailableRooms()
    }

    onMounted(() => {
      // Check if room was selected from Rooms page
      const storedRoom = localStorage.getItem("selectedRoom")
      if (storedRoom) {
        try {
          selectedRoom.value = JSON.parse(storedRoom)
          loadQuestions()
        } catch (e) {
          localStorage.removeItem("selectedRoom")
        }
      } else {
        // Load available rooms for selection
        loadAvailableRooms()
      }
    })

    return {
      questions,
      currentQuestion,
      currentQuestionIndex,
      totalQuestions,
      loading,
      error,
      gameComplete,
      selectedRoom,
      gameStarted,
      availableRooms,
      loadingRooms,
      showJoinModal,
      selectedRoomToJoin,
      joinModalPassword,
      isJoiningRoom,
      progressPercentage,
      isLastQuestion,
      loadQuestions,
      loadAvailableRooms,
      playWithoutRoom,
      openJoinModal,
      closeJoinModal,
      joinSelectedRoom,
      exitRoom,
      nextQuestion,
      skipQuestion,
      restartGame,
      backToMenu,
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

.room-selection,
.room-join {
  padding: 2rem;
  text-align: center;
}

.room-selection h3,
.room-join h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.room-selection p {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.mode-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.room-info-card {
  margin-bottom: 1rem;
}

.room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.room-info h4 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.available-rooms {
  text-align: left;
  padding: 1.5rem;
}

.available-rooms h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
  text-align: center;
}

.loading-rooms,
.no-available-rooms {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

.rooms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.room-item {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.room-item-header h4 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.1rem;
}

.room-item-header .room-number {
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.room-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--text-light);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 1.5rem;
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

  .mode-actions,
  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .room-info {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .rooms-list {
    grid-template-columns: 1fr;
  }

  .modal-content {
    min-width: 300px;
    margin: 1rem;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }
}
</style>
