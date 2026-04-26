<template>
  <div class="auth-callback">
    <!-- Standard OAuth token callback -->
    <div v-if="loading && !whatsappFlow" class="loading">
      <div class="spinner"></div>
      <p>Completing authentication...</p>
    </div>

    <!-- WhatsApp Phone Verification Flow -->
    <div v-else-if="whatsappFlow" class="whatsapp-card">
      <div class="wa-header">
        <svg class="wa-logo" viewBox="0 0 24 24" width="48" height="48">
          <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <h2>WhatsApp Login</h2>
        <p class="wa-subtitle">Verify your phone number to continue</p>
      </div>

      <div v-if="waError" class="alert alert-error">{{ waError }}</div>

      <!-- Step 1: Enter phone number -->
      <form v-if="waStep === 'phone'" @submit.prevent="sendWhatsAppOtp" class="wa-form">
        <div class="form-group">
          <label for="waPhone">Phone Number</label>
          <input
            id="waPhone"
            v-model="waPhone"
            type="tel"
            placeholder="+63 917 123 4567"
            class="wa-input"
            required
          />
          <p class="wa-hint">Enter your number with country code (e.g. +63 for Philippines)</p>
        </div>

        <button type="submit" class="btn btn-whatsapp" :disabled="waSending">
          {{ waSending ? 'Sending...' : 'Send OTP via WhatsApp' }}
        </button>
      </form>

      <!-- Step 2: Enter OTP -->
      <form v-if="waStep === 'otp'" @submit.prevent="verifyWhatsAppOtp" class="wa-form">
        <div class="form-group">
          <label for="waOtp">Verification Code</label>
          <input
            id="waOtp"
            v-model="waOtp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="123456"
            class="wa-input otp-input"
            required
          />
          <p class="wa-hint">Enter the 6-digit code sent to {{ waPhone }}</p>
        </div>

        <button type="submit" class="btn btn-whatsapp" :disabled="waSending || waOtp.length !== 6">
          {{ waSending ? 'Verifying...' : 'Verify & Login' }}
        </button>

        <button type="button" class="btn-link" @click="waStep = 'phone'; waOtp = ''; waError = null">
          ← Change number
        </button>
      </form>

      <router-link to="/login" class="btn-link back-link">
        ← Back to Login
      </router-link>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <h2>Authentication Failed</h2>
      <p>{{ error }}</p>
      <router-link to="/login" class="btn btn-primary">
        Back to Login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(true)
const error = ref(null)

// WhatsApp flow state
const whatsappFlow = ref(false)
const waStep = ref('phone') // 'phone' | 'otp'
const waPhone = ref('')
const waOtp = ref('')
const waError = ref(null)
const waSending = ref(false)

const sendWhatsAppOtp = async () => {
  waError.value = null
  waSending.value = true
  try {
    await api.post('/auth/whatsapp/send-otp', { phone: waPhone.value })
    waStep.value = 'otp'
  } catch (err) {
    waError.value = err.response?.data?.error || 'Failed to send OTP. Please try again.'
  } finally {
    waSending.value = false
  }
}

const verifyWhatsAppOtp = async () => {
  waError.value = null
  waSending.value = true
  try {
    const { data } = await api.post('/auth/whatsapp/verify-otp', {
      phone: waPhone.value,
      otp: waOtp.value
    })

    // Set tokens and fetch profile
    userStore.setAuthTokens({
      token: data.token,
      refreshToken: data.refreshToken,
      sessionToken: data.sessionToken
    })

    if (data.user) {
      userStore.user = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    await userStore.getProfile()

    // Redirect to assessment page
    router.push('/assessment')
  } catch (err) {
    waError.value = err.response?.data?.error || 'OTP verification failed. Please try again.'
  } finally {
    waSending.value = false
  }
}

onMounted(async () => {
  try {
    const { token, refreshToken, sessionToken, provider, step } = route.query

    // WhatsApp phone-verification flow
    if (provider === 'whatsapp' && step === 'phone') {
      whatsappFlow.value = true
      loading.value = false
      return
    }

    if (!token) {
      error.value = route.query.error || 'No authentication token received'
      loading.value = false
      return
    }

    // Standard OAuth token callback
    userStore.setAuthTokens({ token, refreshToken, sessionToken })
    await userStore.getProfile()

    loading.value = false

    // Redirect to solar potential assessment page
    setTimeout(() => {
      router.push('/assessment')
    }, 1000)
  } catch (err) {
    console.error('OAuth callback error:', err)
    error.value = 'Failed to complete authentication. Please try again.'
    loading.value = false
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading,
.error,
.whatsapp-card {
  text-align: center;
  background-color: white;
  padding: 3rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 420px;
  width: 100%;
}

/* ── WhatsApp Card ── */
.wa-header {
  margin-bottom: 1.5rem;
}

.wa-logo {
  margin: 0 auto 0.75rem;
  display: block;
}

.wa-header h2 {
  margin: 0 0 0.25rem;
  font-size: 1.35rem;
  color: #111827;
}

.wa-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.wa-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.35rem;
}

.wa-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.wa-input:focus {
  outline: none;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15);
}

.otp-input {
  text-align: center;
  font-size: 1.75rem;
  letter-spacing: 0.75rem;
  font-weight: 700;
}

.wa-hint {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: #9ca3af;
}

.btn-whatsapp {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: #25D366;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-whatsapp:hover:not(:disabled) {
  background: #1da851;
}

.btn-whatsapp:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-link {
  display: inline-block;
  margin-top: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  transition: color 0.2s;
  text-decoration: none;
}

.btn-link:hover {
  color: #25D366;
}

.back-link {
  display: block;
  margin-top: 1.5rem;
}

.alert-error {
  background: #fee2e2;
  color: #7f1d1d;
  border-left: 4px solid #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: left;
}

/* ── Spinner ── */
.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1.5rem;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 1rem 0 0;
}

.error h2 {
  color: #dc2626;
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.error p {
  color: #6b7280;
  margin: 1rem 0;
  font-size: 0.95rem;
}

.btn {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5568d3;
}

/* ── Dark Theme Overrides ── */
:global(.dark-theme) .auth-callback {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
}

:global(.dark-theme) .loading,
:global(.dark-theme) .error,
:global(.dark-theme) .whatsapp-card {
  background-color: #1E293B;
  color: #E2E8F0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

:global(.dark-theme) .wa-header h2 {
  color: #F1F5F9;
}

:global(.dark-theme) .wa-subtitle {
  color: #94A3B8;
}

:global(.dark-theme) .form-group label {
  color: #CBD5E1;
}

:global(.dark-theme) .wa-input {
  background-color: #0F172A;
  color: #F1F5F9;
  border-color: #475569;
}

:global(.dark-theme) .wa-input:focus {
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.25);
}

:global(.dark-theme) .wa-hint {
  color: #64748B;
}

:global(.dark-theme) .alert-error {
  background: #450A0A;
  color: #FCA5A5;
  border-left-color: #F87171;
}

:global(.dark-theme) .btn-link {
  color: #94A3B8;
}

:global(.dark-theme) .btn-link:hover {
  color: #25D366;
}

:global(.dark-theme) .loading p {
  color: #94A3B8;
}

:global(.dark-theme) .error p {
  color: #94A3B8;
}

:global(.dark-theme) .error h2 {
  color: #F87171;
}

:global(.dark-theme) .spinner {
  border-color: #334155;
  border-top-color: #FFCA4F;
}
</style>
