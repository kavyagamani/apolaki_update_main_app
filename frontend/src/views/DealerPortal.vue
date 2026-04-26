<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">🔧 Dealer Portal</h1>
        <p class="mt-2 text-gray-600">Manage installations, quotes, and commissions</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm font-medium text-gray-500">Total Installations</p>
          <p class="text-3xl font-bold text-orange-600">{{ installations.length }}</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm font-medium text-gray-500">This Month</p>
          <p class="text-3xl font-bold text-green-600">{{ recentCount }}</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm font-medium text-gray-500">Pending</p>
          <p class="text-3xl font-bold text-yellow-600">{{ pendingCount }}</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm font-medium text-gray-500">Status</p>
          <p class="text-xl font-bold text-blue-600">Active Dealer</p>
        </div>
      </div>

      <!-- Commission Form -->
      <div class="bg-white rounded-xl shadow p-6 mb-8">
        <h2 class="text-xl font-bold mb-4">Commission New Installation</h2>
        <form @submit.prevent="submitCommission" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="form.ownerId" placeholder="Owner User ID" class="input-field" required />
          <input v-model="form.name" placeholder="Installation Name" class="input-field" required />
          <input v-model="form.address" placeholder="Address" class="input-field" />
          <input v-model="form.city" placeholder="City" class="input-field" />
          <input v-model="form.capacity" type="number" step="0.1" placeholder="Capacity (kW)" class="input-field" />
          <input v-model="form.panelCount" type="number" placeholder="Panel Count" class="input-field" />
          <div class="md:col-span-2">
            <button type="submit" :disabled="submitting" class="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50">
              {{ submitting ? 'Commissioning...' : '⚡ Commission Installation' }}
            </button>
          </div>
          <p v-if="successMsg" class="md:col-span-2 text-green-600 font-medium">{{ successMsg }}</p>
          <p v-if="errorMsg" class="md:col-span-2 text-red-600 font-medium">{{ errorMsg }}</p>
        </form>
      </div>

      <!-- Installations List -->
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-bold mb-4">My Installations</h2>
        <div v-if="loading" class="text-gray-500">Loading...</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-gray-500">
              <th class="pb-3">Name</th>
              <th class="pb-3">City</th>
              <th class="pb-3">Capacity</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inst in installations" :key="inst.id" class="border-b hover:bg-gray-50">
              <td class="py-3 font-medium">{{ inst.name }}</td>
              <td class="py-3">{{ inst.city }}</td>
              <td class="py-3">{{ inst.capacity }} kW</td>
              <td class="py-3">
                <span :class="statusClass(inst.status)" class="px-2 py-1 rounded text-xs font-medium">{{ inst.status }}</span>
              </td>
              <td class="py-3">{{ new Date(inst.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!loading && installations.length === 0" class="text-gray-400 text-center py-8">No installations yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../services/api'

const installations = ref([])
const loading = ref(true)
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const form = reactive({ ownerId: '', name: '', address: '', city: '', capacity: '', panelCount: '' })

const recentCount = computed(() => {
  const now = new Date()
  return installations.value.filter(i => {
    const d = new Date(i.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
})
const pendingCount = computed(() => installations.value.filter(i => i.status === 'pending').length)

function statusClass(status) {
  return {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
  }[status] || 'bg-gray-100 text-gray-800'
}

async function fetchInstallations() {
  loading.value = true
  try {
    const res = await api.get('/personas/dealer/installations')
    installations.value = res.data.data || []
  } catch { installations.value = [] }
  loading.value = false
}

async function submitCommission() {
  submitting.value = true; successMsg.value = ''; errorMsg.value = ''
  try {
    await api.post('/personas/dealer/commission', {
      ownerId: form.ownerId,
      name: form.name,
      address: form.address,
      city: form.city,
      capacity: parseFloat(form.capacity) || 0,
      panelCount: parseInt(form.panelCount) || 0,
    })
    successMsg.value = 'Installation commissioned successfully!'
    Object.keys(form).forEach(k => form[k] = '')
    await fetchInstallations()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Commission failed'
  }
  submitting.value = false
}

onMounted(fetchInstallations)
</script>

<style scoped>
@reference "tailwindcss";
.input-field {
  @apply border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500;
}

:global(.dark-theme) .input-field {
  background-color: #0F172A;
  border-color: #475569;
  color: #E2E8F0;
}
</style>
