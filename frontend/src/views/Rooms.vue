<template>
  <div class="rooms-container">
    <div class="rooms-header">
      <h1>{{ $t("rooms.title") }}</h1>
      <p>{{ $t("rooms.subtitle") }}</p>
    </div>

    <!-- Create Room Section -->
    <div class="create-room-section">
      <h2>{{ $t("rooms.createRoom") }}</h2>
      <form @submit.prevent="createRoom">
        <div class="form-group">
          <label for="roomName">{{ $t("rooms.roomName") }}</label>
          <input
            id="roomName"
            v-model="newRoom.name"
            type="text"
            :placeholder="$t('rooms.roomNamePlaceholder')"
            required
          />
        </div>
        <div class="form-group">
          <label for="roomPassword">{{ $t("rooms.roomPassword") }}</label>
          <input
            id="roomPassword"
            v-model="newRoom.password"
            type="password"
            :placeholder="$t('rooms.roomPasswordPlaceholder')"
            minlength="3"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="isCreatingRoom"
          class="btn btn-primary"
        >
          {{ isCreatingRoom ? $t("common.loading") : $t("rooms.createRoom") }}
        </button>
      </form>
    </div>

    <!-- Join Room Section -->
    <!-- <div class="join-room-section">
      <h2>{{ $t("rooms.joinRoom") }}</h2>
      <form @submit.prevent="joinRoom">
        <div class="form-group">
          <label for="roomNumber">{{ $t("rooms.roomNumber") }}</label>
          <input
            id="roomNumber"
            v-model="joinForm.room_number"
            type="text"
            :placeholder="$t('rooms.roomNumberPlaceholder')"
            maxlength="3"
            pattern="[0-9]{3}"
            required
          />
        </div>
        <div class="form-group">
          <label for="joinPassword">{{ $t("rooms.password") }}</label>
          <input
            id="joinPassword"
            v-model="joinForm.password"
            type="password"
            :placeholder="$t('rooms.passwordPlaceholder')"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="isJoiningRoom"
          class="btn btn-secondary"
        >
          {{ isJoiningRoom ? $t("common.loading") : $t("rooms.joinRoom") }}
        </button>
      </form>
    </div> -->

    <!-- My Rooms Section -->
    <div class="my-rooms-section">
      <h2>{{ $t("rooms.myRooms") }}</h2>
      <div v-if="isLoadingRooms" class="loading">
        {{ $t("common.loading") }}...
      </div>
      <div v-else-if="rooms.length === 0" class="no-rooms">
        {{ $t("rooms.noRooms") }}
      </div>
      <div v-else class="rooms-grid">
        <div v-for="room in rooms" :key="room.id" class="room-card">
          <div class="room-header">
            <h3>{{ room.name }}</h3>
            <span class="room-number">#{{ room.room_number }}</span>
          </div>
          <div class="room-info">
            <p>
              <strong>{{ $t("rooms.creator") }}:</strong>
              {{ room.creator_name }}
            </p>
            <p>
              <strong>{{ $t("rooms.members") }}:</strong>
              {{ room.member_count }}
            </p>
            <p>
              <strong>{{ $t("rooms.created") }}:</strong>
              {{ formatDate(room.created_at) }}
            </p>
          </div>
          <div class="room-actions">
            <button @click="selectRoomForGame(room)" class="btn btn-primary">
              {{ $t("rooms.playGame") }}
            </button>
            <button
              v-if="room.created_by !== user.id"
              @click="leaveRoom(room.id)"
              class="btn btn-warning"
              :disabled="isLeavingRoom === room.id"
            >
              {{
                isLeavingRoom === room.id
                  ? $t("common.loading")
                  : $t("rooms.leaveRoom")
              }}
            </button>
            <button
              v-if="room.created_by === user.id"
              @click="deleteRoom(room.id)"
              class="btn btn-danger"
              :disabled="isDeletingRoom === room.id"
            >
              {{
                isDeletingRoom === room.id
                  ? $t("common.loading")
                  : $t("rooms.deleteRoom")
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { user } from "../services/auth.js"
import api from "../services/api.js"

export default {
  name: "Rooms",
  setup() {
    const router = useRouter()

    const newRoom = ref({
      name: "",
      password: "",
    })

    const joinForm = ref({
      room_number: "",
      password: "",
    })

    const rooms = ref([])
    const isCreatingRoom = ref(false)
    const isJoiningRoom = ref(false)
    const isLoadingRooms = ref(false)
    const isDeletingRoom = ref(null)
    const isLeavingRoom = ref(null)
    const message = ref("")
    const messageType = ref("")

    const showMessage = (text, type = "success") => {
      message.value = text
      messageType.value = type
      setTimeout(() => {
        message.value = ""
        messageType.value = ""
      }, 5000)
    }

    const createRoom = async () => {
      if (!newRoom.value.name.trim() || !newRoom.value.password.trim()) {
        showMessage("Please fill in all fields", "error")
        return
      }

      isCreatingRoom.value = true
      try {
        const response = await api.post("/rooms", newRoom.value)
        showMessage(
          `Room created successfully! Room number: ${response.data.room.room_number}`
        )
        newRoom.value = { name: "", password: "" }
        await loadRooms()
      } catch (error) {
        showMessage(
          error.response?.data?.error || "Failed to create room",
          "error"
        )
      } finally {
        isCreatingRoom.value = false
      }
    }

    const joinRoom = async () => {
      if (
        !joinForm.value.room_number.trim() ||
        !joinForm.value.password.trim()
      ) {
        showMessage("Please fill in all fields", "error")
        return
      }

      isJoiningRoom.value = true
      try {
        await api.post("/rooms/join", joinForm.value)
        showMessage("Successfully joined room!")
        joinForm.value = { room_number: "", password: "" }
        await loadRooms()
      } catch (error) {
        showMessage(
          error.response?.data?.error || "Failed to join room",
          "error"
        )
      } finally {
        isJoiningRoom.value = false
      }
    }

    const loadRooms = async () => {
      isLoadingRooms.value = true
      try {
        const response = await api.get("/rooms/my-rooms")
        rooms.value = response.data.rooms
      } catch (error) {
        showMessage("Failed to load rooms", "error")
      } finally {
        isLoadingRooms.value = false
      }
    }

    const leaveRoom = async (roomId) => {
      if (!confirm("Are you sure you want to leave this room?")) {
        return
      }

      isLeavingRoom.value = roomId
      try {
        await api.post(`/rooms/${roomId}/leave`)
        showMessage("Successfully left the room")
        await loadRooms()
      } catch (error) {
        showMessage(
          error.response?.data?.error || "Failed to leave room",
          "error"
        )
      } finally {
        isLeavingRoom.value = null
      }
    }

    const deleteRoom = async (roomId) => {
      if (
        !confirm(
          "Are you sure you want to delete this room? This action cannot be undone."
        )
      ) {
        return
      }

      isDeletingRoom.value = roomId
      try {
        await api.delete(`/rooms/${roomId}`)
        showMessage("Room deleted successfully")
        await loadRooms()
      } catch (error) {
        showMessage(
          error.response?.data?.error || "Failed to delete room",
          "error"
        )
      } finally {
        isDeletingRoom.value = null
      }
    }

    const selectRoomForGame = (room) => {
      // Store selected room in localStorage and navigate to game
      localStorage.setItem("selectedRoom", JSON.stringify(room))
      router.push("/game")
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(() => {
      loadRooms()
    })

    return {
      user,
      newRoom,
      joinForm,
      rooms,
      isCreatingRoom,
      isJoiningRoom,
      isLoadingRooms,
      isDeletingRoom,
      isLeavingRoom,
      message,
      messageType,
      createRoom,
      joinRoom,
      leaveRoom,
      deleteRoom,
      selectRoomForGame,
      formatDate,
    }
  },
}
</script>

<style scoped>
.rooms-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.rooms-header {
  text-align: center;
  margin-bottom: 40px;
}

.rooms-header h1 {
  color: #ffffff;
  margin-bottom: 10px;
}

.rooms-header p {
  color: #ffffff;
  font-size: 16px;
}

.create-room-section,
.join-room-section,
.my-rooms-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.create-room-section h2,
.join-room-section h2,
.my-rooms-section h2 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  margin-right: 10px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.room-card {
  border: 2px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  background: #f8f9fa;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.room-header h3 {
  margin: 0;
  color: #333;
}

.room-number {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.room-info {
  margin-bottom: 20px;
}

.room-info p {
  margin: 8px 0;
  color: #666;
}

.room-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.loading,
.no-rooms {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  max-width: 400px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .rooms-container {
    padding: 10px;
  }

  .create-room-section,
  .join-room-section,
  .my-rooms-section {
    padding: 20px;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
  }

  .room-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
