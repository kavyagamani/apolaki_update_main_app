<template>
  <div class="installations">
    <div class="header">
      <h1>Solar Installations</h1>
      <button @click="showForm = true" class="btn btn-primary">+ New Installation</button>
    </div>

    <!-- New Installation Form -->
    <div v-if="showForm" class="card form-card">
      <div class="card-header">
        <h2>Create New Installation</h2>
        <button @click="showForm = false" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleCreate">
        <div class="grid grid-cols-2">
          <div>
            <label for="name">Installation Name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="My Solar System"
              required
            />
          </div>

          <div>
            <label for="capacity">Capacity (kW)</label>
            <input
              id="capacity"
              v-model.number="form.capacity"
              type="number"
              step="0.1"
              placeholder="5.5"
              required
            />
          </div>
        </div>

        <div>
          <label for="address">Address</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            placeholder="123 Main Street"
            required
          />
        </div>

        <div class="grid grid-cols-2">
          <div>
            <label for="panelCount">Panel Count</label>
            <input
              id="panelCount"
              v-model.number="form.panel_count"
              type="number"
              placeholder="20"
              required
            />
          </div>

          <div>
            <label for="inverterType">Inverter Type</label>
            <input
              id="inverterType"
              v-model="form.inverter_type"
              type="text"
              placeholder="SMA Sunny Boy"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="installationStore.loading">
            {{ installationStore.loading ? 'Creating...' : 'Create Installation' }}
          </button>
          <button type="button" @click="showForm = false" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Installations List -->
    <div v-if="installationStore.loading" class="card">
      <div class="loading">
        <div class="spinner"></div>
        Loading installations...
      </div>
    </div>

    <div v-else-if="installationStore.installations.length === 0" class="card empty-state">
      <p>No solar installations yet. Create your first one!</p>
      <button @click="showForm = true" class="btn btn-primary mt-4">+ New Installation</button>
    </div>

    <div v-else class="installations-grid">
      <div v-for="installation in installationStore.installations" :key="installation.id" class="card installation-card">
        <div class="installation-header">
          <h3>{{ installation.name }}</h3>
          <span :class="['status-badge', `status-${installation.status}`]">
            {{ installation.status }}
          </span>
        </div>

        <div class="installation-details">
          <div class="detail">
            <span class="label">Location:</span>
            <span class="value">{{ installation.address }}</span>
          </div>
          <div class="detail">
            <span class="label">Capacity:</span>
            <span class="value">{{ installation.capacity }} kW</span>
          </div>
          <div class="detail">
            <span class="label">Panels:</span>
            <span class="value">{{ installation.panel_count }}</span>
          </div>
          <div class="detail">
            <span class="label">Inverter:</span>
            <span class="value">{{ installation.inverter_type }}</span>
          </div>
        </div>

        <div class="installation-actions">
          <router-link :to="`/installations/${installation.id}`" class="btn btn-sm btn-primary">
            View Details
          </router-link>
          <button @click="deleteInstallation(installation.id)" class="btn btn-sm btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useInstallationStore } from '../stores/installationStore'

const installationStore = useInstallationStore()
const showForm = ref(false)

const form = reactive({
  name: '',
  address: '',
  capacity: 5.5,
  panel_count: 20,
  inverter_type: ''
})

const handleCreate = async () => {
  try {
    await installationStore.createInstallation(form)
    form.name = ''
    form.address = ''
    form.capacity = 5.5
    form.panel_count = 20
    form.inverter_type = ''
    showForm.value = false
  } catch (err) {
    console.error('Failed to create installation:', err)
  }
}

const deleteInstallation = async (id) => {
  if (confirm('Are you sure you want to delete this installation?')) {
    try {
      await installationStore.deleteInstallation(id)
    } catch (err) {
      console.error('Failed to delete installation:', err)
    }
  }
}

onMounted(async () => {
  await installationStore.fetchInstallations()
})
</script>

<style scoped>
.installations {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.form-card {
  margin-bottom: 2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-600);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.installations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.installation-card {
  display: flex;
  flex-direction: column;
}

.installation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.installation-header h3 {
  margin: 0;
}

.installation-details {
  flex: 1;
  margin-bottom: 1rem;
}

.detail {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.label {
  font-weight: 600;
  color: var(--gray-700);
}

.value {
  color: var(--gray-600);
}

.installation-actions {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.status-maintenance {
  background-color: #fef3c7;
  color: #92400e;
}

.grid-cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.grid-cols-2 > div {
  margin-bottom: 0;
}

.grid-cols-2 input {
  margin-bottom: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--gray-600);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--gray-600);
}

.mt-4 {
  margin-top: 1rem;
}

/* ── Dark Theme Overrides ── */
:global(.dark-theme) .installations h1,
:global(.dark-theme) .installations h2,
:global(.dark-theme) .installations h3 {
  color: #F1F5F9;
}

:global(.dark-theme) .installation-card {
  background-color: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .installation-header {
  border-bottom-color: #334155;
}

:global(.dark-theme) .detail {
  border-bottom-color: #1E293B;
}

:global(.dark-theme) .status-active {
  background-color: #064E3B;
  color: #6EE7B7;
}

:global(.dark-theme) .status-inactive {
  background-color: #450A0A;
  color: #FCA5A5;
}

:global(.dark-theme) .status-maintenance {
  background-color: #451A03;
  color: #FCD34D;
}

:global(.dark-theme) .form-card {
  background-color: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .label {
  color: #CBD5E1;
}

:global(.dark-theme) .value {
  color: #94A3B8;
}

:global(.dark-theme) .close-btn {
  color: #94A3B8;
}

:global(.dark-theme) .empty-state {
  color: #94A3B8;
}

:global(.dark-theme) .loading {
  color: #94A3B8;
}
</style>
