<template>
  <div class="login-page">
    <div class="container">
      <div class="login-card card">
        <div class="text-center mb-4">
          <h1 class="login-title">Welcome to App Quiz</h1>
          <p class="login-subtitle">
            {{ isLogin ? "Sign in to your account" : "Create a new account" }}
          </p>
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div v-if="!isLogin" class="form-group">
            <label class="form-label">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            style="width: 100%"
            :disabled="loading"
          >
            <span v-if="loading" class="loading"></span>
            {{ loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up" }}
          </button>
        </form>

        <div class="text-center" style="margin-top: 1.5rem">
          <p>
            {{
              isLogin ? "Don't have an account?" : "Already have an account?"
            }}
            <button @click="toggleMode" class="toggle-link" type="button">
              {{ isLogin ? "Sign Up" : "Sign In" }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { auth } from "../services/auth"

export default {
  name: "Login",
  setup() {
    const router = useRouter()
    const isLogin = ref(true)
    const loading = ref(false)
    const error = ref("")

    const form = ref({
      email: "",
      password: "",
      name: "",
    })

    const toggleMode = () => {
      isLogin.value = !isLogin.value
      error.value = ""
      form.value = { email: "", password: "", name: "" }
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ""

      try {
        let result
        if (isLogin.value) {
          result = await auth.login(form.value.email, form.value.password)
        } else {
          result = await auth.register(
            form.value.email,
            form.value.password,
            form.value.name
          )
        }

        if (result.success) {
          router.push("/dashboard")
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = "An unexpected error occurred"
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      loading,
      error,
      form,
      toggleMode,
      handleSubmit,
    }
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--text-light);
  font-size: 1rem;
}

.toggle-link {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
  padding: 0;
  margin-left: 0.5rem;
}

.toggle-link:hover {
  color: var(--secondary-color);
}
</style>
