<template>
  <div class="forgot-container">
    <div class="forgot-card card">
      <div class="card-header">
        <h2>Reset Your Password</h2>
        <p class="text-gray-600">Enter your email and we'll send you a reset link</p>
      </div>

      <div v-if="success" class="alert alert-success">
        <p>{{ successMessage }}</p>
        <div v-if="devResetUrl" class="dev-reset-link">
          <p class="text-xs text-gray-500 mt-2">🛠️ Dev mode — use this link:</p>
          <router-link :to="devResetPath" class="text-primary text-sm">Reset Password →</router-link>
        </div>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <form v-if="!success" @submit.prevent="handleSubmit">
        <div>
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            autofocus
          />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <p class="text-center mt-4">
        Remember your password?
        <router-link to="/login" class="text-primary">Back to Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const email = ref('')
const loading = ref(false)
const error = ref(null)
const success = ref(false)
const successMessage = ref('')
const devResetUrl = ref(null)
const devResetPath = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.post('/auth/forgot-password', { email: email.value })
    success.value = true
    successMessage.value = response.data.message

    // Dev mode: show direct link
    if (response.data.resetToken) {
      devResetUrl.value = response.data.resetUrl
      devResetPath.value = `/reset-password?token=${response.data.resetToken}`
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send reset link'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.forgot-card {
  width: 100%;
  max-width: 420px;
  background-color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.w-full { width: 100%; }
.mt-4 { margin-top: 1rem; }
.text-center { text-align: center; }
.text-primary {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}
.text-primary:hover { text-decoration: underline; }

.alert-success {
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.dev-reset-link {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #a7f3d0;
}

/* ── Dark Theme Overrides ── */
:global(.dark-theme) .forgot-container {
  background: linear-gradient(135deg, #1E293B 0%, #3B1F6E 100%);
}

:global(.dark-theme) .forgot-card {
  background-color: #1E293B;
  color: #E2E8F0;
}

:global(.dark-theme) .forgot-card h2 {
  color: #F1F5F9;
}

:global(.dark-theme) .forgot-card .text-gray-600 {
  color: #94A3B8;
}

:global(.dark-theme) .alert-success {
  background-color: #022C22;
  border-color: #064E3B;
  color: #6EE7B7;
}
</style>
