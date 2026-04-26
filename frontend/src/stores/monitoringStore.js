import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useMonitoringStore = defineStore('monitoring', () => {
  const monitoringData = ref([])
  const performanceData = ref([])
  const currentData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchMonitoringData = async (installationId, limit = 50) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/installations/${installationId}/monitoring?limit=${limit}`)
      monitoringData.value = response.data.data || []
      if (monitoringData.value.length > 0) {
        currentData.value = monitoringData.value[0]
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch monitoring data'
    } finally {
      loading.value = false
    }
  }

  const fetchPerformanceData = async (installationId, limit = 30) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/installations/${installationId}/performance?limit=${limit}`)
      performanceData.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch performance data'
    } finally {
      loading.value = false
    }
  }

  const recordMonitoringData = async (installationId, data) => {
    try {
      const response = await api.post(`/installations/${installationId}/monitoring`, data)
      const recorded = response.data.data || response.data
      monitoringData.value.unshift(recorded)
      currentData.value = recorded
      return recorded
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to record monitoring data'
      throw err
    }
  }

  return {
    monitoringData,
    performanceData,
    currentData,
    loading,
    error,
    fetchMonitoringData,
    fetchPerformanceData,
    recordMonitoringData
  }
})
