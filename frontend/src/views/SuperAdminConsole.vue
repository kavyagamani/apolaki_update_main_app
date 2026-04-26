<template>
  <div class="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center gap-4">
        <div class="text-4xl">🚨</div>
        <div>
          <h1 class="text-3xl font-bold text-red-400">Super Admin — Break-Glass Console</h1>
          <p class="mt-1 text-gray-400">Emergency access panel. All actions are logged and audited.</p>
        </div>
      </div>

      <!-- Active Session Banner -->
      <div v-if="activeSession" class="bg-red-900/50 border border-red-500 rounded-xl p-6 mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-bold text-red-300">🔓 Active Break-Glass Session</h2>
            <p class="text-sm text-gray-300 mt-1">Session: {{ activeSession.sessionId }}</p>
            <p class="text-sm text-gray-300">Expires: {{ new Date(activeSession.expiresAt).toLocaleString() }}</p>
          </div>
          <button @click="endSession" class="bg-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-700">
            End Session
          </button>
        </div>
        <!-- Record Action -->
        <div class="mt-4 flex gap-2">
          <input v-model="actionText" placeholder="Describe action taken..." class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500" />
          <button @click="recordAction" :disabled="!actionText" class="bg-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50">
            Log Action
          </button>
        </div>
        <div v-if="actionSuccess" class="mt-2 text-green-400 text-sm">✓ Action logged</div>
      </div>

      <!-- Activate Break-Glass -->
      <div v-else class="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 class="text-xl font-bold text-yellow-400 mb-4">Activate Emergency Access</h2>
        <p class="text-gray-400 mb-4 text-sm">Requires justification (min 10 chars). Session expires in 60 minutes.</p>
        <textarea v-model="justification" rows="3" placeholder="Describe the emergency requiring break-glass access..."
          class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-4" />
        <button @click="activateBreakGlass" :disabled="!justification || justification.length < 10 || activating"
          class="bg-red-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50">
          {{ activating ? 'Activating...' : '🔐 Activate Break-Glass' }}
        </button>
        <p v-if="errorMsg" class="mt-3 text-red-400">{{ errorMsg }}</p>
      </div>

      <!-- Session History -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 class="text-xl font-bold text-gray-300 mb-4">Break-Glass Audit Trail</h2>
        <div v-if="historyLoading" class="text-gray-500">Loading...</div>
        <div v-else-if="sessionHistory.length" class="space-y-4">
          <div v-for="s in sessionHistory" :key="s.id" class="border border-gray-700 rounded-lg p-4">
            <div class="flex justify-between items-start">
              <div>
                <span :class="s.status === 'active' ? 'text-red-400' : 'text-gray-400'" class="font-bold">{{ s.status.toUpperCase() }}</span>
                <span class="text-gray-500 ml-2 text-sm">{{ s.id.substring(0, 8) }}…</span>
              </div>
              <span class="text-gray-500 text-sm">{{ new Date(s.started_at).toLocaleString() }}</span>
            </div>
            <p class="text-gray-300 text-sm mt-2">{{ s.justification }}</p>
            <div v-if="s.actions_taken?.length" class="mt-2 text-xs text-gray-400">
              <span class="font-medium">Actions: </span>{{ s.actions_taken.length }} recorded
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-6">No break-glass sessions recorded.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'

const activeSession = ref(null)
const justification = ref('')
const actionText = ref('')
const activating = ref(false)
const actionSuccess = ref(false)
const errorMsg = ref('')
const sessionHistory = ref([])
const historyLoading = ref(true)

async function fetchHistory() {
  historyLoading.value = true
  try {
    const res = await api.get('/personas/superadmin/break-glass')
    sessionHistory.value = res.data.data || []
    // Check if any active session exists
    const active = sessionHistory.value.find(s => s.status === 'active')
    if (active) {
      activeSession.value = { sessionId: active.id, expiresAt: active.expires_at }
    }
  } catch { sessionHistory.value = [] }
  historyLoading.value = false
}

async function activateBreakGlass() {
  activating.value = true; errorMsg.value = ''
  try {
    const res = await api.post('/personas/superadmin/break-glass', { justification: justification.value })
    activeSession.value = res.data.data
    justification.value = ''
    await fetchHistory()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Failed to activate'
  }
  activating.value = false
}

async function recordAction() {
  actionSuccess.value = false
  try {
    await api.post(`/personas/superadmin/break-glass/${activeSession.value.sessionId}/action`, {
      action: actionText.value,
      details: 'Via Super Admin Console'
    })
    actionText.value = ''
    actionSuccess.value = true
    setTimeout(() => actionSuccess.value = false, 3000)
  } catch (e) {
    alert('Failed: ' + (e.response?.data?.error || e.message))
  }
}

async function endSession() {
  if (!confirm('Are you sure you want to end this break-glass session?')) return
  try {
    await api.post(`/personas/superadmin/break-glass/${activeSession.value.sessionId}/end`)
    activeSession.value = null
    await fetchHistory()
  } catch (e) {
    alert('Failed: ' + (e.response?.data?.error || e.message))
  }
}

onMounted(fetchHistory)
</script>
