<template>
  <div class="installation-detail">
    <div v-if="installationStore.loading" class="loading">
      <div class="spinner"></div>
      Loading installation...
    </div>

    <div v-else-if="installationStore.currentInstallation" class="card">
      <div class="detail-header">
        <router-link to="/installations" class="btn btn-sm btn-outline">← Back</router-link>
        <h1>{{ installationStore.currentInstallation.name }}</h1>
      </div>

      <div class="detail-grid">
        <div class="detail-section">
          <h2>Installation Details</h2>
          <div class="details-list">
            <div class="detail">
              <span class="label">Name:</span>
              <span class="value">{{ installationStore.currentInstallation.name }}</span>
            </div>
            <div class="detail">
              <span class="label">Address:</span>
              <span class="value">{{ installationStore.currentInstallation.address }}</span>
            </div>
            <div class="detail">
              <span class="label">Capacity:</span>
              <span class="value">{{ installationStore.currentInstallation.capacity }} kW</span>
            </div>
            <div class="detail">
              <span class="label">Panel Count:</span>
              <span class="value">{{ installationStore.currentInstallation.panel_count }}</span>
            </div>
            <div class="detail">
              <span class="label">Inverter:</span>
              <span class="value">{{ installationStore.currentInstallation.inverter_type }}</span>
            </div>
            <div class="detail">
              <span class="label">Status:</span>
              <span :class="['status-badge', `status-${installationStore.currentInstallation.status}`]">
                {{ installationStore.currentInstallation.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h2>Performance Metrics</h2>
          <div class="metrics">
            <div class="metric">
              <div class="metric-label">Today's Output</div>
              <div class="metric-value">24.5 kWh</div>
            </div>
            <div class="metric">
              <div class="metric-label">Monthly Total</div>
              <div class="metric-value">735 kWh</div>
            </div>
            <div class="metric">
              <div class="metric-label">Efficiency</div>
              <div class="metric-value">98.5%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Peak Power</div>
              <div class="metric-value">5.8 kW</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card empty-state">
      <p>Installation not found</p>
      <router-link to="/installations" class="btn btn-primary mt-4">Back to Installations</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInstallationStore } from '../stores/installationStore'

const route = useRoute()
const installationStore = useInstallationStore()

onMounted(async () => {
  await installationStore.fetchInstallation(route.params.id)
})
</script>

<style scoped>
.installation-detail {
  width: 100%;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-header h1 {
  margin: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.detail-section h2 {
  margin-top: 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-200);
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--gray-50);
  border-radius: 0.375rem;
}

.label {
  font-weight: 600;
  color: var(--gray-700);
}

.value {
  color: var(--gray-600);
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

.metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.metric {
  background-color: var(--gray-50);
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--gray-600);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--gray-600);
}

.mt-4 {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Dark Theme Overrides ── */
:global(.dark-theme) .installation-detail h1 {
  color: #F1F5F9;
}

:global(.dark-theme) .installation-detail .card {
  background-color: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .installation-detail .loading {
  color: #94A3B8;
}

:global(.dark-theme) .status-active {
  background-color: #064E3B;
  color: #6EE7B7;
}

:global(.dark-theme) .status-inactive {
  background-color: #450A0A;
  color: #FCA5A5;
}

:global(.dark-theme) .detail {
  background-color: #0F172A;
}

:global(.dark-theme) .label {
  color: #CBD5E1;
}

:global(.dark-theme) .value {
  color: #94A3B8;
}

:global(.dark-theme) .metric {
  background-color: #0F172A;
}

:global(.dark-theme) .metric-label {
  color: #94A3B8;
}

:global(.dark-theme) .detail-section h2 {
  border-bottom-color: #334155;
  color: #E2E8F0;
}
</style>
