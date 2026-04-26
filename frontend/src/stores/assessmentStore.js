import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useAssessmentStore = defineStore('assessments', () => {
  const assessments = ref([])
  const currentAssessment = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchAssessments = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/assessments')
      assessments.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch assessments'
    } finally {
      loading.value = false
    }
  }

  const calculateAssessment = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/assessments/calculate', data)
      const result = response.data.data
      currentAssessment.value = result
      // Add to list
      assessments.value.unshift(result)
      return result
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to calculate assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAssessment = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/assessments/${id}`)
      currentAssessment.value = response.data.data || response.data
      return currentAssessment.value
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch assessment'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    assessments,
    currentAssessment,
    loading,
    error,
    fetchAssessments,
    calculateAssessment,
    getAssessment
  }
})
