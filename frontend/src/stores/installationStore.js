import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useInstallationStore = defineStore('installations', () => {
  const installations = ref([])
  const currentInstallation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchInstallations = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/installations')
      installations.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch installations'
    } finally {
      loading.value = false
    }
  }

  const fetchInstallation = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/installations/${id}`)
      currentInstallation.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch installation'
    } finally {
      loading.value = false
    }
  }

  const createInstallation = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/installations', data)
      const created = response.data.data || response.data
      installations.value.push(created)
      return created
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create installation'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInstallation = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/installations/${id}`, data)
      const updated = response.data.data || response.data
      const index = installations.value.findIndex(i => i.id === id)
      if (index !== -1) {
        installations.value[index] = updated
      }
      if (currentInstallation.value?.id === id) {
        currentInstallation.value = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update installation'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteInstallation = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/installations/${id}`)
      installations.value = installations.value.filter(i => i.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete installation'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    installations,
    currentInstallation,
    loading,
    error,
    fetchInstallations,
    fetchInstallation,
    createInstallation,
    updateInstallation,
    deleteInstallation
  }
})
