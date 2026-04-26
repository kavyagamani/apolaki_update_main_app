import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '../services/api'

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref([])
  const summary = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalIncome = computed(() => {
    return summary.value
      .filter(s => s.type === 'income' || s.type === 'savings' || s.type === 'credit')
      .reduce((sum, s) => sum + Number(s.total || 0), 0)
  })

  const totalExpenses = computed(() => {
    return summary.value
      .filter(s => s.type === 'expense' || s.type === 'payment')
      .reduce((sum, s) => sum + Number(s.total || 0), 0)
  })

  const netBalance = computed(() => totalIncome.value - totalExpenses.value)

  const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/finance/transactions')
      transactions.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch transactions'
    } finally {
      loading.value = false
    }
  }

  const fetchSummary = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/finance/summary')
      summary.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch summary'
    } finally {
      loading.value = false
    }
  }

  const createTransaction = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/finance/transactions', data)
      const created = response.data.data || response.data
      transactions.value.unshift(created)
      return created
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    summary,
    loading,
    error,
    totalIncome,
    totalExpenses,
    netBalance,
    fetchTransactions,
    fetchSummary,
    createTransaction
  }
})
