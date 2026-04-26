<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">👤 Admin Console</h1>
        <p class="mt-2 text-gray-600">Manage users, roles, and audit activity</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm font-medium text-gray-500">Total Users</p>
          <p class="text-3xl font-bold text-blue-600">{{ allUsers.length }}</p>
        </div>
        <div v-for="r in roleCounts" :key="r.role" class="bg-white rounded-xl shadow p-6">
          <p class="text-sm font-medium text-gray-500 capitalize">{{ r.role }}s</p>
          <p class="text-3xl font-bold" :class="roleColor(r.role)">{{ r.count }}</p>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-xl shadow p-6 mb-8">
        <h2 class="text-xl font-bold mb-4">User Management</h2>
        <div v-if="loading" class="text-gray-500">Loading users...</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-gray-500">
              <th class="pb-3">Email</th>
              <th class="pb-3">Name</th>
              <th class="pb-3">Role</th>
              <th class="pb-3">Active</th>
              <th class="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in allUsers" :key="u.id" class="border-b hover:bg-gray-50">
              <td class="py-3 font-medium">{{ u.email }}</td>
              <td class="py-3">{{ u.fullName }}</td>
              <td class="py-3">
                <select v-model="u._newRole" @change="changeRole(u)" class="border rounded px-2 py-1 text-sm">
                  <option v-for="r in availableRoles" :key="r" :value="r">{{ r }}</option>
                </select>
              </td>
              <td class="py-3">
                <span :class="u.active ? 'text-green-600' : 'text-red-600'" class="font-medium">{{ u.active ? 'Yes' : 'No' }}</span>
              </td>
              <td class="py-3 text-xs text-gray-400">{{ u.id.substring(0, 8) }}…</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Audit Logs -->
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-bold mb-4">Recent Audit Logs</h2>
        <div v-if="auditLoading" class="text-gray-500">Loading...</div>
        <table v-else-if="auditLogs.length" class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-gray-500">
              <th class="pb-3">Time</th>
              <th class="pb-3">Action</th>
              <th class="pb-3">Resource</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in auditLogs.slice(0, 50)" :key="log.id" class="border-b hover:bg-gray-50">
              <td class="py-2">{{ new Date(log.created_at).toLocaleString() }}</td>
              <td class="py-2 font-mono text-xs">{{ log.action }}</td>
              <td class="py-2">{{ log.resource_type }} {{ log.resource_id?.substring(0, 8) }}</td>
              <td class="py-2">
                <span :class="log.status === 'success' ? 'text-green-600' : 'text-red-600'">{{ log.status }}</span>
              </td>
              <td class="py-2 text-xs text-gray-400">{{ log.ip_address }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-gray-400 text-center py-8">No audit logs found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'

const allUsers = ref([])
const auditLogs = ref([])
const loading = ref(true)
const auditLoading = ref(true)
const availableRoles = ['customer', 'dealer', 'installer', 'operations', 'admin', 'superadmin']

const roleCounts = computed(() => {
  const counts = {}
  allUsers.value.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1 })
  return Object.entries(counts).map(([role, count]) => ({ role, count })).slice(0, 3)
})

function roleColor(role) {
  return { admin: 'text-purple-600', customer: 'text-blue-600', dealer: 'text-orange-600', operations: 'text-green-600', superadmin: 'text-red-600' }[role] || 'text-gray-600'
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await api.get('/personas/admin/users')
    allUsers.value = (res.data.data || []).map(u => ({ ...u, _newRole: u.role }))
  } catch { allUsers.value = [] }
  loading.value = false
}

async function fetchAuditLogs() {
  auditLoading.value = true
  try {
    const res = await api.get('/personas/admin/audit-logs?limit=50')
    auditLogs.value = res.data.data || []
  } catch { auditLogs.value = [] }
  auditLoading.value = false
}

async function changeRole(u) {
  try {
    await api.put(`/personas/admin/users/${u.id}/role`, { role: u._newRole })
    u.role = u._newRole
  } catch (e) {
    alert('Failed: ' + (e.response?.data?.error || e.message))
    u._newRole = u.role
  }
}

onMounted(() => { fetchUsers(); fetchAuditLogs() })
</script>

<style scoped>
/* ── Dark Theme Overrides ── */
:global(.dark-theme) .border-b {
  border-color: #334155;
}

:global(.dark-theme) select {
  background-color: #0F172A;
  color: #E2E8F0;
  border-color: #475569;
}

:global(.dark-theme) .border-l-4 {
  /* keep colored left border visible on dark cards */
}
</style>
