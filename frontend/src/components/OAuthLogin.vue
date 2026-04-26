<template>
  <div class="oauth-container">
    <div class="oauth-divider">
      <span>Or continue with</span>
    </div>
    
    <div class="oauth-buttons">
      <button @click="loginWithGoogle" class="oauth-btn google-btn" :disabled="isLoading">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>

      <button @click="loginWithFacebook" class="oauth-btn facebook-btn" :disabled="isLoading">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>

      <button @click="loginWithInstagram" class="oauth-btn instagram-btn" :disabled="isLoading">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
        </svg>
        Instagram
      </button>

      <button @click="loginWithViber" class="oauth-btn viber-btn" :disabled="isLoading">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.96.6 3.88 1.68 5.52L2 22l4.5-1.68C8.12 21.4 10 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.78-.36-4.12-1.03l-.3-.16-3.09 1.16.75-3.07-.2-.32C3.44 14.3 3 13.18 3 12c0-4.96 4.04-9 9-9s9 4.04 9 9-4.04 9-9 9z"/>
          <path d="M8 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
        </svg>
        Viber
      </button>

      <button @click="loginWithTelegram" class="oauth-btn telegram-btn" :disabled="isLoading">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.4-1.12 7.12-.16.95-.48 1.27-1.1 1.3-.94.05-1.64-.62-2.55-1.21l-1.57-1.03c-.76-.52-1.04-.76.23-1.97.99-.99 1.73-1.81 1.73-2.81 0-.5-.1-1.01-.66-1.01-.54 0-1.01.27-1.36.5l-.14.1c-.27.2-.71.53-1.04.53-.22 0-.44-.11-.66-.33l-.9-.9c-.27-.27-.62-.62-.62-1.23 0-.76.38-1.56 1.35-2.13 1.25-.75 2.97-.76 3.9-.76 1.08 0 1.92.12 2.44.88.37.54.45 1.12.58 2.02z"/>
        </svg>
        Telegram
      </button>

      <button @click="loginWithWhatsApp" class="oauth-btn whatsapp-btn" :disabled="isLoading">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const error = ref(null)

// Use relative paths so OAuth works on both localhost and Netlify
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL
  // If VITE_API_URL is set and is an absolute URL, use it; otherwise use relative path
  if (envUrl && envUrl.startsWith('http')) return envUrl
  return ''  // relative to current origin
}

const loginWithGoogle = () => {
  isLoading.value = true
  window.location.href = `${getApiBase()}/api/auth/google`
}

const loginWithFacebook = () => {
  isLoading.value = true
  window.location.href = `${getApiBase()}/api/auth/facebook`
}

const loginWithInstagram = () => {
  isLoading.value = true
  window.location.href = `${getApiBase()}/api/auth/instagram`
}

const loginWithViber = () => {
  isLoading.value = true
  window.location.href = `${getApiBase()}/api/auth/viber`
}

const loginWithTelegram = () => {
  isLoading.value = true
  window.location.href = `${getApiBase()}/api/auth/telegram`
}

const loginWithWhatsApp = () => {
  isLoading.value = true
  window.location.href = `${getApiBase()}/api/auth/whatsapp`
}
</script>

<style scoped>
.oauth-container {
  width: 100%;
  margin-top: 1.5rem;
}

.oauth-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}

.oauth-divider span {
  margin: 0 1rem;
}

.oauth-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.oauth-btn:hover:not(:disabled) {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.oauth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-btn:hover:not(:disabled) {
  color: #4285f4;
  border-color: #4285f4;
}

.facebook-btn:hover:not(:disabled) {
  color: #1877f2;
  border-color: #1877f2;
}

.instagram-btn:hover:not(:disabled) {
  color: #e1306c;
  border-color: #e1306c;
}

.viber-btn:hover:not(:disabled) {
  color: #7b68ee;
  border-color: #7b68ee;
}

.telegram-btn:hover:not(:disabled) {
  color: #0088cc;
  border-color: #0088cc;
}

.whatsapp-btn:hover:not(:disabled) {
  color: #25D366;
  border-color: #25D366;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee;
  border: 1px solid #f99;
  color: #c33;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .oauth-buttons {
    grid-template-columns: 1fr;
  }

  .oauth-btn {
    flex-direction: column;
    padding: 1rem;
  }
}
</style>
