<template>
  <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8" :class="isDark ? 'bg-slate-900' : 'bg-gray-50'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">📄 Contract Management</h1>
          <p class="mt-2" :class="isDark ? 'text-slate-400' : 'text-gray-600'">View, sign, and manage your solar contracts</p>
        </div>
        <button @click="showCreateForm = true" class="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition">
          + New Contract
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Total Contracts</p>
          <p class="text-3xl font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">{{ contractStore.contracts.length }}</p>
        </div>
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Pending Signature</p>
          <p class="text-3xl font-bold text-yellow-500">{{ pendingCount }}</p>
        </div>
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Signed</p>
          <p class="text-3xl font-bold text-green-500">{{ signedCount }}</p>
        </div>
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Total Value</p>
          <p class="text-3xl font-bold" :class="isDark ? 'text-blue-400' : 'text-blue-600'">{{ formatCurrency(totalValue) }}</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition',
            activeFilter === filter.value
              ? 'bg-orange-600 text-white'
              : isDark ? 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Create Contract Modal -->
      <div v-if="showCreateForm" class="rounded-xl shadow-lg border p-6 mb-8" :class="cardClass">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">Create New Contract</h2>
          <button @click="showCreateForm = false" class="text-2xl" :class="isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'">&times;</button>
        </div>
        <form @submit.prevent="handleCreate" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Contract Title</label>
            <input v-model="form.title" type="text" placeholder="Solar Installation Agreement" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Provider</label>
            <input v-model="form.provider" type="text" placeholder="SolarCo Inc" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Contract Type</label>
            <select v-model="form.contractType" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass">
              <option value="">Select type...</option>
              <option value="purchase">Purchase Agreement</option>
              <option value="lease">Lease Agreement</option>
              <option value="ppa">Power Purchase Agreement (PPA)</option>
              <option value="maintenance">Maintenance Contract</option>
              <option value="installation">Installation Contract</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Amount ({{ currencySymbol }})</label>
            <input v-model.number="form.amount" type="number" step="0.01" placeholder="25000" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Start Date</label>
            <input v-model="form.startDate" type="date" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Term (months)</label>
            <input v-model.number="form.termMonths" type="number" placeholder="12" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div class="md:col-span-2 flex gap-3">
            <button type="submit" :disabled="contractStore.loading" class="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition">
              {{ contractStore.loading ? 'Creating...' : 'Create Contract' }}
            </button>
            <button type="button" @click="showCreateForm = false" class="border px-6 py-3 rounded-lg font-medium transition" :class="isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'">
              Cancel
            </button>
          </div>
          <p v-if="contractStore.error" class="md:col-span-2 text-red-500 text-sm">{{ contractStore.error }}</p>
        </form>
      </div>

      <!-- Contracts List -->
      <div v-if="contractStore.loading && !contractStore.contracts.length" class="text-center py-20" :class="isDark ? 'text-slate-400' : 'text-gray-500'">
        Loading contracts...
      </div>

      <div v-else-if="filteredContracts.length === 0" class="rounded-xl shadow-sm border p-12 text-center" :class="cardClass">
        <div class="text-5xl mb-4">📋</div>
        <h3 class="text-lg font-semibold" :class="isDark ? 'text-slate-200' : 'text-gray-700'">No contracts found</h3>
        <p class="mt-2" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Create your first contract to get started</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="contract in filteredContracts"
          :key="contract.id"
          class="rounded-xl shadow-sm border p-6 hover:shadow-md transition"
          :class="cardClass"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">{{ contract.title || 'Untitled Contract' }}</h3>
                <span :class="statusBadgeClass(contract.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ contract.status }}
                </span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3" :class="isDark ? 'text-slate-400' : 'text-gray-600'">
                <div>
                  <span :class="isDark ? 'text-slate-500' : 'text-gray-400'">Provider:</span>
                  <p class="font-medium" :class="isDark ? 'text-slate-200' : 'text-gray-900'">{{ contract.provider || '—' }}</p>
                </div>
                <div>
                  <span :class="isDark ? 'text-slate-500' : 'text-gray-400'">Type:</span>
                  <p class="font-medium capitalize" :class="isDark ? 'text-slate-200' : 'text-gray-900'">{{ contract.contract_type || '—' }}</p>
                </div>
                <div>
                  <span :class="isDark ? 'text-slate-500' : 'text-gray-400'">Amount:</span>
                  <p class="font-medium" :class="isDark ? 'text-slate-200' : 'text-gray-900'">{{ formatCurrency(contract.amount || 0) }}</p>
                </div>
                <div>
                  <span :class="isDark ? 'text-slate-500' : 'text-gray-400'">Term:</span>
                  <p class="font-medium" :class="isDark ? 'text-slate-200' : 'text-gray-900'">{{ contract.term_months || '—' }} months</p>
                </div>
              </div>
              <div class="flex gap-2 text-xs mt-3" :class="isDark ? 'text-slate-500' : 'text-gray-400'">
                <span>Created: {{ new Date(contract.created_at).toLocaleDateString() }}</span>
                <span v-if="contract.start_date">• Starts: {{ new Date(contract.start_date).toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <button
                v-if="contract.status === 'pending'"
                @click="handleSign(contract.id)"
                class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                ✍️ Sign
              </button>
              <button
                v-if="contract.status === 'pending'"
                @click="handleCancel(contract.id)"
                class="border text-sm font-medium px-4 py-2 rounded-lg transition"
                :class="isDark ? 'border-red-600 text-red-400 hover:bg-red-900/30' : 'border-red-300 text-red-600 hover:bg-red-50'"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useContractStore } from '../stores/contractStore'
import { useThemeStore } from '../stores/themeStore'
import { formatCurrency, getCurrencySymbol } from '../utils/currency'

const contractStore = useContractStore()
const themeStore = useThemeStore()
const showCreateForm = ref(false)
const activeFilter = ref('all')

const isDark = computed(() => themeStore.isDarkMode)
const currencySymbol = computed(() => getCurrencySymbol())

const cardClass = computed(() =>
  isDark.value
    ? 'bg-slate-800 border-slate-700'
    : 'bg-white border-gray-200'
)

const inputClass = computed(() =>
  isDark.value
    ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500'
    : 'border-gray-300 text-gray-900'
)

const form = reactive({
  title: '',
  provider: '',
  contractType: '',
  amount: '',
  startDate: '',
  termMonths: 12
})

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: '⏳ Pending' },
  { value: 'signed', label: '✅ Signed' },
  { value: 'active', label: '🟢 Active' },
  { value: 'cancelled', label: '❌ Cancelled' }
]

const filteredContracts = computed(() => {
  if (activeFilter.value === 'all') return contractStore.contracts
  return contractStore.contracts.filter(c => c.status === activeFilter.value)
})

const pendingCount = computed(() => contractStore.contracts.filter(c => c.status === 'pending').length)
const signedCount = computed(() => contractStore.contracts.filter(c => c.status === 'signed' || c.status === 'active').length)
const totalValue = computed(() => contractStore.contracts.reduce((sum, c) => sum + Number(c.amount || 0), 0))

function statusBadgeClass(status) {
  return {
    pending: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
  }[status] || 'bg-gray-100 text-gray-800'
}

async function handleCreate() {
  try {
    const endDate = form.startDate && form.termMonths
      ? new Date(new Date(form.startDate).getTime() + form.termMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null

    await contractStore.createContract({
      title: form.title,
      provider: form.provider,
      contractType: form.contractType,
      amount: form.amount,
      startDate: form.startDate,
      endDate,
      termMonths: form.termMonths
    })
    showCreateForm.value = false
    // Reset form
    Object.assign(form, { title: '', provider: '', contractType: '', amount: '', startDate: '', termMonths: 12 })
  } catch (err) {
    console.error('Failed to create contract:', err)
  }
}

async function handleSign(id) {
  if (confirm('Are you sure you want to sign this contract?')) {
    try {
      await contractStore.signContract(id, 'electronic-signature-' + Date.now())
    } catch (err) {
      console.error('Failed to sign contract:', err)
    }
  }
}

async function handleCancel(id) {
  if (confirm('Are you sure you want to cancel this contract?')) {
    try {
      await contractStore.updateContract(id, { status: 'cancelled' })
    } catch (err) {
      console.error('Failed to cancel contract:', err)
    }
  }
}

onMounted(() => {
  contractStore.fetchContracts()
})
</script>
