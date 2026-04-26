import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useContractStore = defineStore('contracts', () => {
  const contracts = ref([])
  const currentContract = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchContracts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/contracts')
      contracts.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch contracts'
    } finally {
      loading.value = false
    }
  }

  const fetchContract = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/contracts/${id}`)
      currentContract.value = response.data.data || response.data
      return currentContract.value
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch contract'
      return null
    } finally {
      loading.value = false
    }
  }

  const createContract = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/contracts', data)
      const created = response.data.data || response.data
      contracts.value.unshift(created)
      return created
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create contract'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateContract = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/contracts/${id}`, data)
      const updated = response.data.data || response.data
      const index = contracts.value.findIndex(c => c.id === id)
      if (index !== -1) contracts.value[index] = updated
      if (currentContract.value?.id === id) currentContract.value = updated
      return updated
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update contract'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signContract = async (id, signature) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/contracts/${id}/sign`, { signature })
      const signed = response.data.data || response.data
      const index = contracts.value.findIndex(c => c.id === id)
      if (index !== -1) contracts.value[index] = signed
      if (currentContract.value?.id === id) currentContract.value = signed
      return signed
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to sign contract'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    contracts,
    currentContract,
    loading,
    error,
    fetchContracts,
    fetchContract,
    createContract,
    updateContract,
    signContract
  }
})
