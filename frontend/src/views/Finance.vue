<template>
  <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8" :class="isDark ? 'bg-slate-900' : 'bg-gray-50'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">💰 Financial Overview</h1>
          <p class="mt-2" :class="isDark ? 'text-slate-400' : 'text-gray-600'">Track solar savings, payments, and financial performance</p>
        </div>
        <button @click="showAddForm = true" class="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition">
          + Record Transaction
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Total Income / Savings</p>
          <p class="text-3xl font-bold text-green-600 dark:text-emerald-400">{{ formatCurrency(financeStore.totalIncome) }}</p>
        </div>
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Total Expenses</p>
          <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(financeStore.totalExpenses) }}</p>
        </div>
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Net Balance</p>
          <p class="text-3xl font-bold" :class="financeStore.netBalance >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatCurrency(financeStore.netBalance) }}
          </p>
        </div>
        <div class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Transactions</p>
          <p class="text-3xl font-bold" :class="isDark ? 'text-blue-400' : 'text-blue-600'">{{ financeStore.transactions.length }}</p>
        </div>
      </div>

      <!-- Summary by Type -->
      <div v-if="financeStore.summary.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-for="s in financeStore.summary" :key="s.type" class="rounded-xl shadow-sm border p-6" :class="cardClass">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">{{ typeIcon(s.type) }}</span>
            <p class="text-sm font-medium capitalize" :class="isDark ? 'text-slate-400' : 'text-gray-500'">{{ s.type }}</p>
          </div>
          <p class="text-2xl font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">{{ formatCurrency(s.total || 0) }}</p>
          <p class="text-sm" :class="isDark ? 'text-slate-500' : 'text-gray-400'">{{ s.count }} transaction{{ s.count != 1 ? 's' : '' }} · Avg {{ formatCurrency(s.average || 0) }}</p>
        </div>
      </div>

      <!-- Add Transaction Form -->
      <div v-if="showAddForm" class="rounded-xl shadow-lg border p-6 mb-8" :class="cardClass">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">Record Transaction</h2>
          <button @click="showAddForm = false" class="text-2xl" :class="isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'">&times;</button>
        </div>
        <form @submit.prevent="handleCreateTransaction" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Type</label>
            <select v-model="form.type" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass">
              <option value="">Select type...</option>
              <option value="income">Income / Savings</option>
              <option value="expense">Expense / Payment</option>
              <option value="credit">Tax Credit</option>
              <option value="payment">Loan Payment</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Category</label>
            <select v-model="form.category" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass">
              <option value="">Select category...</option>
              <option value="energy_savings">Energy Savings</option>
              <option value="equipment_purchase">Equipment Purchase</option>
              <option value="installation_cost">Installation Cost</option>
              <option value="maintenance">Maintenance</option>
              <option value="tax_credit">Tax Credit</option>
              <option value="loan_payment">Loan Payment</option>
              <option value="utility_bill">Utility Bill</option>
              <option value="net_metering">Net Metering Income</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Amount ({{ currencySymbol }})</label>
            <input v-model.number="form.amount" type="number" step="0.01" placeholder="1000.00" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Date</label>
            <input v-model="form.transactionDate" type="date" required class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-slate-300' : 'text-gray-700'">Description</label>
            <input v-model="form.description" type="text" placeholder="Monthly electricity savings from solar" class="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500" :class="inputClass" />
          </div>
          <div class="md:col-span-2 flex gap-3">
            <button type="submit" :disabled="financeStore.loading" class="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition">
              {{ financeStore.loading ? 'Saving...' : 'Save Transaction' }}
            </button>
            <button type="button" @click="showAddForm = false" class="border px-6 py-3 rounded-lg font-medium transition" :class="isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'">
              Cancel
            </button>
          </div>
          <p v-if="financeStore.error" class="md:col-span-2 text-red-500 text-sm">{{ financeStore.error }}</p>
          <p v-if="createSuccess" class="md:col-span-2 text-green-500 text-sm font-medium">✓ Transaction recorded</p>
        </form>
      </div>

      <!-- Transactions Table -->
      <div class="rounded-xl shadow-sm border overflow-hidden" :class="cardClass">
        <div class="px-6 py-4 border-b flex justify-between items-center" :class="isDark ? 'border-slate-700' : 'border-gray-200'">
          <h2 class="text-xl font-bold" :class="isDark ? 'text-slate-100' : 'text-gray-900'">Transaction History</h2>
          <button @click="loadData" class="text-sm font-medium" :class="isDark ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-800'">🔄 Refresh</button>
        </div>

        <div v-if="financeStore.loading && !financeStore.transactions.length" class="text-center py-16" :class="isDark ? 'text-slate-400' : 'text-gray-500'">
          Loading transactions...
        </div>

        <div v-else-if="financeStore.transactions.length === 0" class="text-center py-16">
          <div class="text-5xl mb-4">💸</div>
          <h3 class="text-lg font-semibold" :class="isDark ? 'text-slate-200' : 'text-gray-700'">No transactions yet</h3>
          <p class="mt-2" :class="isDark ? 'text-slate-400' : 'text-gray-500'">Record your first solar-related transaction to start tracking</p>
        </div>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b text-left uppercase text-xs" :class="isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-gray-50 text-gray-500 border-gray-200'">
              <th class="px-6 py-3">Date</th>
              <th class="px-6 py-3">Type</th>
              <th class="px-6 py-3">Category</th>
              <th class="px-6 py-3">Description</th>
              <th class="px-6 py-3 text-right">Amount</th>
              <th class="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="txn in financeStore.transactions" :key="txn.id" class="border-b transition" :class="isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-50'">
              <td class="px-6 py-4">{{ formatDate(txn.transaction_date) }}</td>
              <td class="px-6 py-4">
                <span :class="typeBadgeClass(txn.type)" class="px-2 py-1 rounded text-xs font-medium capitalize">
                  {{ txn.type }}
                </span>
              </td>
              <td class="px-6 py-4 capitalize">{{ (txn.category || '').replace(/_/g, ' ') }}</td>
              <td class="px-6 py-4 max-w-xs truncate" :class="isDark ? 'text-slate-400' : 'text-gray-600'">{{ txn.description || '—' }}</td>
              <td class="px-6 py-4 text-right font-semibold" :class="isPositive(txn.type) ? 'text-green-500' : 'text-red-500'">
                {{ isPositive(txn.type) ? '+' : '-' }}{{ formatCurrency(txn.amount || 0) }}
              </td>
              <td class="px-6 py-4">
                <span :class="txn.status === 'completed' ? 'text-green-500' : 'text-yellow-500'" class="text-xs font-medium capitalize">
                  {{ txn.status || 'pending' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'
import { useThemeStore } from '../stores/themeStore'
import { formatCurrency, getCurrencySymbol } from '../utils/currency'

const financeStore = useFinanceStore()
const themeStore = useThemeStore()
const showAddForm = ref(false)
const createSuccess = ref(false)

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
  type: '',
  category: '',
  amount: '',
  transactionDate: new Date().toISOString().split('T')[0],
  description: ''
})

function typeIcon(type) {
  const icons = { income: '💵', savings: '💵', expense: '💳', payment: '💳', credit: '🏛️' }
  return icons[type] || '📄'
}

function typeBadgeClass(type) {
  return {
    income: 'bg-green-100 text-green-800',
    savings: 'bg-green-100 text-green-800',
    credit: 'bg-blue-100 text-blue-800',
    expense: 'bg-red-100 text-red-800',
    payment: 'bg-yellow-100 text-yellow-800',
  }[type] || 'bg-gray-100 text-gray-800'
}

function isPositive(type) {
  return ['income', 'savings', 'credit'].includes(type)
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : '—'
}

async function handleCreateTransaction() {
  createSuccess.value = false
  try {
    await financeStore.createTransaction({
      type: form.type,
      category: form.category,
      amount: form.amount,
      transactionDate: form.transactionDate,
      description: form.description
    })
    createSuccess.value = true
    // Reset form
    Object.assign(form, { type: '', category: '', amount: '', transactionDate: new Date().toISOString().split('T')[0], description: '' })
    showAddForm.value = false
    // Refresh summary
    await financeStore.fetchSummary()
  } catch (err) {
    console.error('Failed to create transaction:', err)
  }
}

async function loadData() {
  await Promise.all([
    financeStore.fetchTransactions(),
    financeStore.fetchSummary()
  ])
}

onMounted(loadData)
</script>
