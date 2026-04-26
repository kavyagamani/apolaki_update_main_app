<template>
  <div class="dashboard">
    <!-- Sample Data Banner (shown when no installations) -->
    <div v-if="!hasInstallations && !installationStore.loading" class="sample-data-banner mb-6">
      <div class="sample-banner-content">
        <span class="sample-banner-icon">📍</span>
        <div>
          <strong>Showing sample data for Metro Manila, Philippines</strong>
          <p>This dashboard uses estimated data for a typical 5 kW residential solar system. Create your first installation to see your actual data.</p>
        </div>
        <router-link to="/installations" class="btn btn-primary btn-sm">+ Add Installation</router-link>
      </div>
    </div>

    <!-- Hero Header Section -->
    <section class="hero-section mb-8">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Solar Energy Dashboard</h1>
          <p v-if="userStore.user" class="hero-subtitle">Welcome back, {{ userStore.user.first_name || 'User' }}! Here's your solar overview.</p>
          <p v-else class="hero-subtitle">Monitor and manage your solar installations in real-time.</p>
          <p v-if="!hasInstallations" class="hero-location">📍 {{ locationLabel }} · {{ electricityProvider }}</p>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-number">{{ hasInstallations ? installationStore.installations.length : 1 }}</span>
            <span class="hero-stat-label">{{ hasInstallations ? 'Systems' : 'Sample System' }}</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">{{ totalCapacity }}</span>
            <span class="hero-stat-label">kW Capacity</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">{{ activeCount }}</span>
            <span class="hero-stat-label">Active</span>
          </div>
        </div>
      </div>
    </section>

    <!-- KPI Cards Section -->
    <section class="kpi-section mb-8">
      <div class="section-header">
        <h2>Key Performance Indicators</h2>
        <p class="text-gray-600">Real-time metrics of your solar installations</p>
      </div>
      
      <div class="kpi-grid">
        <!-- KPI Card 1: Total Installations -->
        <div class="kpi-card card-accent-blue">
          <div class="kpi-header">
            <div class="kpi-icon-container icon-layout-grid">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <span class="kpi-trend trend-up">↑ 15%</span>
          </div>
          <h3 class="kpi-title">Total Installations</h3>
          <p class="kpi-value">{{ hasInstallations ? installationStore.installations.length : 1 }}</p>
          <p class="kpi-meta">{{ hasInstallations ? 'Active projects in portfolio' : 'Sample 5kW system · Metro Manila' }}</p>
        </div>

        <!-- KPI Card 2: Daily Energy -->
        <div class="kpi-card card-accent-green">
          <div class="kpi-header">
            <div class="kpi-icon-container icon-zap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
              </svg>
            </div>
            <span class="kpi-trend trend-up">↑ 8%</span>
          </div>
          <h3 class="kpi-title">Daily Energy</h3>
          <p class="kpi-value">{{ dailyEnergyKwh }} <span class="kpi-unit">kWh</span></p>
          <p class="kpi-meta">{{ dailyEnergyValueDisplay }}</p>
        </div>

        <!-- KPI Card 3: Total Capacity -->
        <div class="kpi-card card-accent-amber">
          <div class="kpi-header">
            <div class="kpi-icon-container icon-sun">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </div>
            <span class="kpi-trend trend-up">↑ 12%</span>
          </div>
          <h3 class="kpi-title">Total Capacity</h3>
          <p class="kpi-value">{{ totalCapacity }} <span class="kpi-unit">kW</span></p>
          <p class="kpi-meta">{{ hasInstallations ? activeCount + ' of ' + installationStore.installations.length + ' systems active' : METRO_MANILA_DEFAULTS.peakSunHours + ' peak sun hrs/day · ' + locationLabel }}</p>
        </div>

        <!-- KPI Card 4: Efficiency -->
        <div class="kpi-card card-accent-purple">
          <div class="kpi-header">
            <div class="kpi-icon-container icon-chart">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="20" x2="12" y2="10"/>
                <line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </svg>
            </div>
            <span class="kpi-trend trend-neutral">→ 0%</span>
          </div>
          <h3 class="kpi-title">System Efficiency</h3>
          <p class="kpi-value">94.8%</p>
          <p class="kpi-meta">Average performance</p>
        </div>

        <!-- KPI Card 5: Monthly Savings -->
        <div class="kpi-card card-accent-green">
          <div class="kpi-header">
            <div class="kpi-icon-container icon-wallet">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <path d="M1 10h22"/>
              </svg>
            </div>
            <span class="kpi-trend trend-up">↑ 5%</span>
          </div>
          <h3 class="kpi-title">Monthly Savings</h3>
          <p class="kpi-value">{{ formatCurrencyLocal(monthlySavingsLocal) }}</p>
          <p class="kpi-meta">{{ locationLabel }} · {{ formatCurrencyLocal(localElectricityRate) }}/kWh</p>
        </div>

        <!-- KPI Card 6: CO₂ Offset -->
        <div class="kpi-card card-accent-blue">
          <div class="kpi-header">
            <div class="kpi-icon-container icon-leaf">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12 6c-1.1 0-2 .9-2 2v5h4V8c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <span class="kpi-trend trend-up">↑ 10%</span>
          </div>
          <h3 class="kpi-title">CO₂ Offset</h3>
          <p class="kpi-value">{{ carbonOffsetMonthly }} <span class="kpi-unit">kg/mo</span></p>
          <p class="kpi-meta">{{ carbonOffsetYearly }} tons per year</p>
        </div>
      </div>
    </section>

    <!-- Installations Section -->
    <section class="installations-section mb-8">
      <div class="section-header">
        <div>
          <h2>Your Solar Installations</h2>
          <p class="text-gray-600">Manage and monitor all your solar energy systems</p>
        </div>
        <router-link to="/installations" class="btn btn-primary">
          <span>+ New Installation</span>
        </router-link>
      </div>

      <div v-if="installationStore.loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading your installations...</p>
      </div>

      <div v-else-if="installationStore.installations.length === 0" class="empty-state-container">
        <div class="empty-state">
          <div class="empty-icon-container">
            🌱
          </div>
          <h3>No Solar Installations Yet</h3>
          <p>Start your solar journey by creating your first installation.</p>
          <router-link to="/installations" class="btn btn-primary mt-4">Create Installation</router-link>
        </div>
      </div>

      <div v-else class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" class="checkbox">
              </th>
              <th>Installation Name</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="installation in installationStore.installations.slice(0, 5)" :key="installation.id" class="table-row">
              <td>
                <input type="checkbox" class="checkbox">
              </td>
              <td>
                <div class="installation-name">
                  ☀️
                  <div class="name-content">
                    <p class="font-semibold">{{ installation.name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ installation.id }}</p>
                  </div>
                </div>
              </td>
              <td>{{ installation.address || 'N/A' }}</td>
              <td class="font-semibold">{{ installation.capacity }} kW</td>
              <td>
                <span :class="['status-badge', `status-${installation.status}`]">
                  {{ installation.status }}
                </span>
              </td>
              <td>
                <div class="performance-bar">
                  <div class="bar" :style="{width: (installation.performance_percent || 85) + '%'}"></div>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <router-link :to="`/installations/${installation.id}`" class="btn-icon" title="View details">
                    👁️
                  </router-link>
                  <button class="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button class="btn-icon btn-danger" title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Quick Actions Section -->
    <section class="quick-actions-section mb-8">
      <div class="section-header">
        <h2>Quick Access</h2>
        <p class="text-gray-600">Frequently used features</p>
      </div>
      
      <div class="actions-grid">
        <router-link to="/installations" class="action-card">
          <div class="action-icon">📦</div>
          <h3>Manage Installations</h3>
          <p>View and manage all solar systems</p>
          <span class="arrow">→</span>
        </router-link>
        
        <router-link to="/assessment" class="action-card">
          <div class="action-icon">📋</div>
          <h3>Solar Assessment</h3>
          <p>Calculate solar potential for properties</p>
          <span class="arrow">→</span>
        </router-link>
        
        <router-link to="/monitoring" class="action-card">
          <div class="action-icon">⚙️</div>
          <h3>Monitor Systems</h3>
          <p>Track real-time performance metrics</p>
          <span class="arrow">→</span>
        </router-link>
        
        <router-link to="/marketplace" class="action-card">
          <div class="action-icon">🛒</div>
          <h3>Marketplace</h3>
          <p>Browse and purchase solar products</p>
          <span class="arrow">→</span>
        </router-link>
      </div>
    </section>

    <!-- Chart Section -->
    <section class="charts-section mb-8">
      <div class="section-header">
        <h2>Performance Analytics</h2>
        <div class="time-range-tabs">
          <button v-for="range in timeRanges" :key="range.value"
            @click="selectedRange = range.value"
            :class="['range-tab', { active: selectedRange === range.value }]">
            {{ range.label }}
          </button>
        </div>
      </div>
      
      <div class="charts-grid">
        <!-- Energy Generation Chart -->
        <div class="chart-card">
          <h3>Energy Generation (kWh)</h3>
          <div class="chart-placeholder">
            <div v-for="(bar, idx) in chartData" :key="idx"
              class="chart-bar"
              :style="{ height: bar.heightPercent + '%' }"
              :title="bar.label + ': ' + bar.value + ' kWh'">
            </div>
          </div>
          <div class="chart-labels">
            <span v-for="(bar, idx) in chartData" :key="'l-'+idx">{{ bar.label }}</span>
          </div>
          <div class="chart-summary">
            <span>Total: <strong>{{ chartTotal }} kWh</strong></span>
            <span>Avg: <strong>{{ chartAvg }} kWh</strong></span>
          </div>
        </div>

        <!-- System Status Pie Chart -->
        <div class="chart-card">
          <h3>System Status Distribution</h3>
          <div class="pie-chart" :style="pieChartStyle"></div>
          <div class="pie-legend">
            <div><span class="dot active"></span> Active ({{ activeCount }})</div>
            <div><span class="dot inactive"></span> Inactive ({{ inactiveCount }})</div>
            <div><span class="dot maintenance"></span> Maintenance ({{ maintenanceCount }})</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Energy Economics Section -->
    <section class="energy-economics-section mb-8">
      <div class="section-header">
        <h2>⚡💡 Energy Economics</h2>
        <p class="text-gray-600">Local energy cost & investment payback for {{ locationLabel }}</p>
      </div>

      <div class="economics-grid">
        <!-- Energy Cost Card -->
        <div class="economics-card energy-cost-card">
          <div class="econ-icon">☀️</div>
          <h3>Local Electricity Rate</h3>
          <p class="econ-primary-value">{{ formatCurrencyLocal(localElectricityRate) }}<span class="econ-unit">/kWh</span></p>
          <p class="econ-meta">{{ electricityProvider }} · {{ locationLabel }}</p>
          <div class="econ-detail-row">
            <span>Generation Charge</span>
            <strong>{{ formatCurrencyLocal(localElectricityRate * 0.52) }}/kWh</strong>
          </div>
          <div class="econ-detail-row">
            <span>Distribution & Others</span>
            <strong>{{ formatCurrencyLocal(localElectricityRate * 0.48) }}/kWh</strong>
          </div>
        </div>

        <!-- Monthly Savings Card -->
        <div class="economics-card savings-highlight-card">
          <div class="econ-icon">💰</div>
          <h3>Estimated Savings</h3>
          <p class="econ-primary-value">{{ formatCurrencyLocal(monthlySavingsLocal) }}<span class="econ-unit">/mo</span></p>
          <p class="econ-meta">{{ formatCurrencyLocal(yearlySavingsLocal) }} per year</p>
          <div class="econ-detail-row">
            <span>Energy Produced</span>
            <strong>{{ monthlyEnergyKwh }} kWh/mo</strong>
          </div>
          <div class="econ-detail-row">
            <span>You Save vs Grid</span>
            <strong class="text-green-600">{{ savingsPercent }}%</strong>
          </div>
        </div>

        <!-- Payback Period Card -->
        <div class="economics-card payback-card">
          <div class="econ-icon">📈</div>
          <h3>Investment Recovery</h3>
          <p class="econ-primary-value">{{ paybackYears }}<span class="econ-unit"> years</span></p>
          <p class="econ-meta">System Cost: {{ formatCurrencyLocal(estimatedSystemCost) }}</p>
          <div class="payback-bar-wrapper">
            <div class="payback-bar">
              <div class="payback-progress" :style="{ width: Math.min(paybackProgress, 100) + '%' }"></div>
            </div>
            <div class="payback-labels">
              <span>Now</span>
              <span>{{ paybackYears }} yrs</span>
              <span>25 yrs</span>
            </div>
          </div>
          <div class="econ-detail-row">
            <span>25-Year Net Profit</span>
            <strong class="text-green-600">{{ formatCurrencyLocal(twentyFiveYearProfit) }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Weather & Savings Row -->
    <section class="insights-row mb-8">
      <!-- Weather Widget -->
      <div class="insight-card weather-card">
        <h3 class="section-title-with-icon">
          ☁️ Weather Conditions
        </h3>
        <div class="weather-main">
          <span class="weather-icon">
            {{ weatherData.icon }}
          </span>
          <div>
            <p class="weather-temp">{{ weatherData.temperature }}°C</p>
            <p class="weather-desc">{{ weatherData.description }}</p>
          </div>
        </div>
        <div class="weather-details">
          <div><span class="weather-detail-icon">☀️</span> UV Index<strong>{{ weatherData.uvIndex }}</strong></div>
          <div><span class="weather-detail-icon">💨</span> Wind<strong>{{ weatherData.wind }} km/h</strong></div>
          <div><span class="weather-detail-icon">💧</span> Humidity<strong>{{ weatherData.humidity }}%</strong></div>
          <div><span class="weather-detail-icon">⛅</span> Cloud Cover<strong>{{ weatherData.cloudCover }}%</strong></div>
        </div>
        <p class="weather-impact" :class="weatherData.solarImpact === 'High' ? 'impact-good' : weatherData.solarImpact === 'Moderate' ? 'impact-moderate' : 'impact-low'">
          Solar Production Potential: <strong>{{ weatherData.solarImpact }}</strong>
        </p>
      </div>

      <!-- Savings & CO2 Widget -->
      <div class="insight-card savings-card">
        <h3 class="section-title-with-icon">
          💰 Estimated Savings & Impact
        </h3>
        <div class="savings-grid">
          <div class="savings-item">
            <span class="savings-icon">💵</span>
            <div>
              <p class="savings-value">{{ formatCurrencyLocal(monthlySavingsLocal) }}</p>
              <p class="savings-label">Monthly Savings</p>
            </div>
          </div>
          <div class="savings-item">
            <span class="savings-icon">💰</span>
            <div>
              <p class="savings-value">{{ formatCurrencyLocal(yearlySavingsLocal) }}</p>
              <p class="savings-label">Yearly Savings</p>
            </div>
          </div>
          <div class="savings-item">
            <span class="savings-icon">🌱</span>
            <div>
              <p class="savings-value">{{ carbonOffsetMonthly }} kg</p>
              <p class="savings-label">CO₂ Offset / Month</p>
            </div>
          </div>
          <div class="savings-item">
            <span class="savings-icon">🌍</span>
            <div>
              <p class="savings-value">{{ carbonOffsetYearly }} tons</p>
              <p class="savings-label">CO₂ Offset / Year</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Alerts Section -->
    <section class="alerts-section mb-8">
      <div class="section-header">
        <h2 class="section-title-with-icon">
          ⚠️ System Alerts
        </h2>
        <p class="text-gray-600">{{ systemAlerts.length }} active alert{{ systemAlerts.length !== 1 ? 's' : '' }}</p>
      </div>
      <div v-if="systemAlerts.length === 0" class="alert alert-success">
        <span class="alert-icon">✓</span>
        <span>All systems operating normally. No issues detected.</span>
      </div>
      <div v-for="(alert, idx) in systemAlerts" :key="idx"
        :class="['alert', 'alert-' + alert.severity]">
        <span class="alert-icon">{{ alert.icon }}</span>
        <div>
          <strong>{{ alert.title }}</strong>
          <span>{{ alert.message }}</span>
        </div>
        <span class="alert-time">{{ alert.time }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useInstallationStore } from '../stores/installationStore'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()
const installationStore = useInstallationStore()

// ── Metro Manila Default Data ──
// Used when no installations exist, giving meaningful dashboard data out of the box
const METRO_MANILA_DEFAULTS = {
  location: 'Metro Manila, Philippines',
  provider: 'Meralco',
  capacity: 5.0,         // kW – typical residential rooftop
  peakSunHours: 4.5,     // average daily peak sun hours in Metro Manila
  electricityRate: 11.50, // ₱/kWh – Meralco average residential rate (2024-2026)
  co2PerKwh: 0.42,       // kg CO₂ per kWh (Philippine grid factor)
  panelDegradation: 0.005, // 0.5% per year
  systemLifespan: 25,     // years
}

// ── Installation cost tiers (Philippine market) ──
// Interpolates between known price points: ₱120k for 3kW, ₱200k for 5kW
function getSystemCost(capacityKw) {
  const tiers = [
    { kw: 1, cost: 55000 },
    { kw: 2, cost: 90000 },
    { kw: 3, cost: 120000 },
    { kw: 5, cost: 200000 },
    { kw: 8, cost: 310000 },
    { kw: 10, cost: 380000 },
  ]
  if (capacityKw <= tiers[0].kw) return tiers[0].cost
  if (capacityKw >= tiers[tiers.length - 1].kw) {
    // extrapolate from last two tiers
    const last = tiers[tiers.length - 1]
    const prev = tiers[tiers.length - 2]
    const rate = (last.cost - prev.cost) / (last.kw - prev.kw)
    return Math.round(last.cost + rate * (capacityKw - last.kw))
  }
  // linear interpolation between surrounding tiers
  for (let i = 0; i < tiers.length - 1; i++) {
    if (capacityKw >= tiers[i].kw && capacityKw <= tiers[i + 1].kw) {
      const ratio = (capacityKw - tiers[i].kw) / (tiers[i + 1].kw - tiers[i].kw)
      return Math.round(tiers[i].cost + ratio * (tiers[i + 1].cost - tiers[i].cost))
    }
  }
  return 200000 // fallback
}

// ── Time Range ──
const selectedRange = ref('7d')
const timeRanges = [
  { label: '24h', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'Year', value: 'yearly' }
]

// ── Check if user has real installations ──
const hasInstallations = computed(() => installationStore.installations.length > 0)

// ── Computed KPIs (use real data when available, Metro Manila defaults otherwise) ──
const activeCount = computed(() =>
  hasInstallations.value
    ? installationStore.installations.filter(i => i.status === 'active').length
    : 1
)
const inactiveCount = computed(() =>
  hasInstallations.value
    ? installationStore.installations.filter(i => i.status === 'inactive').length
    : 0
)
const maintenanceCount = computed(() =>
  hasInstallations.value
    ? installationStore.installations.filter(i => i.status === 'maintenance').length
    : 0
)
const totalCapacity = computed(() =>
  hasInstallations.value
    ? installationStore.installations.reduce((sum, i) => sum + (i.capacity || 0), 0).toFixed(2)
    : METRO_MANILA_DEFAULTS.capacity.toFixed(2)
)

// ── Location & Electricity Provider ──
const locationLabel = computed(() =>
  hasInstallations.value
    ? (installationStore.installations[0]?.address || METRO_MANILA_DEFAULTS.location)
    : METRO_MANILA_DEFAULTS.location
)

const electricityProvider = computed(() => METRO_MANILA_DEFAULTS.provider)

// ── Local electricity rate (₱/kWh) ──
const localElectricityRate = computed(() => METRO_MANILA_DEFAULTS.electricityRate)

// ── Simulated daily energy based on capacity ──
const dailyEnergyKwh = computed(() => {
  const cap = parseFloat(totalCapacity.value) || METRO_MANILA_DEFAULTS.capacity
  return (cap * METRO_MANILA_DEFAULTS.peakSunHours).toFixed(1)
})
const monthlyEnergyKwh = computed(() => (parseFloat(dailyEnergyKwh.value) * 30).toFixed(0))

// Daily energy value in pesos
const dailyEnergyValue = computed(() =>
  parseFloat(dailyEnergyKwh.value) * localElectricityRate.value
)
const dailyEnergyValueDisplay = computed(() =>
  `Worth ${formatCurrencyLocal(dailyEnergyValue.value)}/day · ${formatCurrencyLocal(localElectricityRate.value)}/kWh`
)

// ── Local currency savings (₱) ──
const monthlySavingsLocal = computed(() =>
  parseFloat(monthlyEnergyKwh.value) * localElectricityRate.value
)
const yearlySavingsLocal = computed(() => monthlySavingsLocal.value * 12)

// ── Savings as percentage of typical household bill (₱3,500/mo average) ──
const savingsPercent = computed(() => {
  const typicalBill = 3500
  return Math.min(Math.round((monthlySavingsLocal.value / typicalBill) * 100), 100)
})

// ── CO₂ offset ──
const carbonOffsetMonthly = computed(() =>
  (parseFloat(monthlyEnergyKwh.value) * METRO_MANILA_DEFAULTS.co2PerKwh).toFixed(0)
)
const carbonOffsetYearly = computed(() =>
  ((parseFloat(monthlyEnergyKwh.value) * 12 * METRO_MANILA_DEFAULTS.co2PerKwh) / 1000).toFixed(1)
)

// ── Investment Recovery / Payback Period ──
const estimatedSystemCost = computed(() => {
  const cap = parseFloat(totalCapacity.value) || METRO_MANILA_DEFAULTS.capacity
  return getSystemCost(cap)
})

const paybackYears = computed(() => {
  if (yearlySavingsLocal.value <= 0) return '∞'
  const years = estimatedSystemCost.value / yearlySavingsLocal.value
  return years.toFixed(1)
})

const paybackProgress = computed(() => {
  const years = parseFloat(paybackYears.value) || 25
  return (years / 25) * 100
})

const twentyFiveYearProfit = computed(() => {
  const totalSavings = yearlySavingsLocal.value * 25
  return totalSavings - estimatedSystemCost.value
})

// ── Format as local PHP currency (without USD conversion) ──
function formatCurrencyLocal(amount) {
  const rounded = Math.round(amount)
  try {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(rounded)
  } catch {
    return `₱${rounded.toLocaleString()}`
  }
}

// ── Chart Data (simulated by range) ──
function generateChartData(range) {
  const cap = parseFloat(totalCapacity.value) || METRO_MANILA_DEFAULTS.capacity
  const random = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10
  if (range === '24h') {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = (7 + i * 1.5) | 0
      const val = hour >= 7 && hour <= 18 ? random(cap * 0.1, cap * 0.5) : 0
      return { label: `${hour}:00`, value: val }
    })
  } else if (range === '7d') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(d => ({ label: d, value: random(cap * 3, cap * 5.5) }))
  } else if (range === '30d') {
    return Array.from({ length: 15 }, (_, i) => ({
      label: `Day ${(i * 2) + 1}`,
      value: random(cap * 3, cap * 5.5)
    }))
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map(m => ({ label: m, value: random(cap * 80, cap * 160) }))
  }
}

const chartData = computed(() => {
  const data = generateChartData(selectedRange.value)
  const maxVal = Math.max(...data.map(d => d.value), 1)
  return data.map(d => ({ ...d, heightPercent: (d.value / maxVal) * 100 }))
})
const chartTotal = computed(() => chartData.value.reduce((s, d) => s + d.value, 0).toFixed(1))
const chartAvg = computed(() => (parseFloat(chartTotal.value) / chartData.value.length).toFixed(1))

// ── Pie chart style ──
const pieChartStyle = computed(() => {
  const total = installationStore.installations.length || 1
  const a = (activeCount.value / total) * 360
  const b = (inactiveCount.value / total) * 360
  return {
    background: `conic-gradient(#22c55e 0deg ${a}deg, #ef4444 ${a}deg ${a + b}deg, #eab308 ${a + b}deg 360deg)`
  }
})

// ── Weather (simulated) ──
const weatherData = computed(() => {
  const conditions = [
    { icon: '☀️', description: 'Sunny & Clear', temperature: 32, uvIndex: 8, wind: 12, humidity: 35, cloudCover: 10, solarImpact: 'High' },
    { icon: '☁️', description: 'Partly Cloudy', temperature: 28, uvIndex: 5, wind: 18, humidity: 55, cloudCover: 45, solarImpact: 'Moderate' },
    { icon: '🌤️', description: 'Mostly Sunny', temperature: 30, uvIndex: 7, wind: 10, humidity: 40, cloudCover: 20, solarImpact: 'High' },
  ]
  // Pick based on current hour for some variety
  return conditions[new Date().getHours() % conditions.length]
})

// ── System Alerts (data-driven) ──
const systemAlerts = computed(() => {
  const alerts = []
  const installs = installationStore.installations

  const inactive = installs.filter(i => i.status === 'inactive')
  if (inactive.length > 0) {
    alerts.push({
      severity: 'danger',
      icon: '🔴',
      title: `${inactive.length} System${inactive.length > 1 ? 's' : ''} Offline`,
      message: inactive.map(i => i.name).join(', ') + ' — check connection.',
      time: 'Now'
    })
  }

  const maint = installs.filter(i => i.status === 'maintenance')
  if (maint.length > 0) {
    alerts.push({
      severity: 'warning',
      icon: '🟡',
      title: 'Maintenance Scheduled',
      message: maint.map(i => i.name).join(', ') + ' — scheduled maintenance.',
      time: 'Today'
    })
  }

  if (parseFloat(totalCapacity.value) > 0 && activeCount.value === 0) {
    alerts.push({
      severity: 'danger',
      icon: '⚡',
      title: 'No Active Generation',
      message: 'None of your systems are currently generating power.',
      time: 'Now'
    })
  }

  if (weatherData.value.cloudCover > 40) {
    alerts.push({
      severity: 'info',
      icon: '☁️',
      title: 'Reduced Solar Output Expected',
      message: `Cloud cover at ${weatherData.value.cloudCover}% may reduce generation by ~${Math.round(weatherData.value.cloudCover * 0.6)}%.`,
      time: 'Today'
    })
  }

  return alerts
})

// Lifecycle — only fetch installations if user is logged in; otherwise show defaults
onMounted(async () => {
  if (userStore.isAuthenticated) {
    try {
      await installationStore.fetchInstallations()
    } catch (err) {
      // API may be unavailable — dashboard will show Metro Manila defaults
      console.warn('Dashboard: Could not fetch installations, showing defaults.', err?.message || err)
    }
  }
  // If not authenticated, dashboard renders with Metro Manila sample data
})
</script>

<style scoped>
/* Uses global design tokens from main.css — no local :root overrides */

.dashboard {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Sample Data Banner */
.sample-data-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #fef3c7 100%);
  border: 2px solid #fbbf24;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
}

.sample-banner-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sample-banner-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.sample-banner-content strong {
  font-size: 1rem;
  color: #92400e;
  display: block;
  margin-bottom: 0.25rem;
}

.sample-banner-content p {
  font-size: 0.875rem;
  color: #78716c;
  margin: 0;
}

.sample-banner-content .btn {
  margin-left: auto;
  white-space: nowrap;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--solar-gold) 0%, var(--solar-gold-dark) 100%);
  border-radius: 1rem;
  padding: 3rem;
  color: #1a1a2e;
  box-shadow: 0 10px 30px rgba(255, 184, 28, 0.25);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3rem;
  align-items: center;
}

.hero-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
  margin: 0;
}

.hero-location {
  font-size: 0.95rem;
  margin-top: 0.5rem;
  opacity: 0.85;
  font-weight: 500;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  text-align: center;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-stat-number {
  font-size: 2.5rem;
  font-weight: 700;
}

.hero-stat-label {
  font-size: 0.9rem;
  opacity: 0.85;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header > div {
  flex: 1;
}

.section-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
}

.section-header .text-gray-600 {
  color: var(--gray-600);
  margin: 0;
}

/* KPI Cards Section */
.kpi-section {
  margin-bottom: 3rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.kpi-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border-top: 4px solid var(--solar-gold);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255, 184, 28, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(20%, -20%);
}

.kpi-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-accent-blue {
  border-top-color: var(--sky-blue);
}

.card-accent-green {
  border-top-color: var(--success);
}

.card-accent-amber {
  border-top-color: var(--solar-gold);
}

.card-accent-purple {
  border-top-color: #a855f7;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.kpi-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  background: white;
  border: 1px solid var(--gray-200);
  color: var(--gray-700);
}

.icon-layout-grid {
  color: #2563eb;
}

.icon-zap {
  color: #f59e0b;
}

.icon-sun {
  color: #f59e0b;
}

.icon-chart {
  color: #8b5cf6;
}

.icon-wallet {
  color: #16a34a;
}

.icon-leaf {
  color: #059669;
}

.icon-sun-inline {
  color: inherit;
}

.kpi-trend {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
}

.trend-up {
  background-color: #dcfce7;
  color: #166534;
}

.trend-neutral {
  background-color: #f3f4f6;
  color: #4b5563;
}

.kpi-title {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.kpi-unit {
  font-size: 1rem;
  color: var(--gray-600);
  font-weight: 400;
}

.kpi-meta {
  font-size: 0.85rem;
  color: var(--gray-600);
  margin: 0;
}

/* Action  Icon Styles */
.action-icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%);
  color: #2563eb;
  margin-bottom: 1rem;
}

.action-icon-svg svg {
  color: inherit;
}

/* Weather Detail Icons */
.weather-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  color: var(--gray-600);
}

/* Section Title with Icon */
.section-title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  color: currentColor;
}

/* Economics Icon */
.econ-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  background: white;
  border: 1px solid var(--gray-200);
  color: #2563eb;
  margin-bottom: 1rem;
}

/* Installations Section */
.installations-section {
  margin-bottom: 3rem;
}

.table-wrapper {
  background: var(--bg-primary);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table thead {
  background: linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid var(--gray-200);
}

.modern-table th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modern-table tbody tr {
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: var(--bg-tertiary);
}

.modern-table td {
  padding: 1.25rem 1rem;
  color: var(--gray-700);
}

.installation-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.installation-name .icon {
  font-size: 1.5rem;
}

.name-content p {
  margin: 0;
}

.name-content .font-semibold {
  color: var(--gray-900);
}

.performance-bar {
  width: 100%;
  height: 6px;
  background-color: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.performance-bar .bar {
  height: 100%;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--gray-100);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  padding: 0;
}

.btn-icon:hover {
  background: var(--solar-gold);
  color: #1a1a2e;
}

.btn-icon.btn-danger:hover {
  background: var(--danger);
  color: white;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--solar-gold);
}

/* Loading & Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem 2rem;
  color: var(--gray-600);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--solar-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-state {
  text-align: center;
  color: var(--gray-600);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 1rem;
  background: #f3f4f6;
  color: #059669;
  font-size: 3rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* Quick Actions Section */
.quick-actions-section {
  margin-bottom: 3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 2px solid transparent;
}

.action-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 184, 28, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.action-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: var(--solar-gold);
}

.action-card:hover::before {
  top: -30%;
  right: -30%;
}

.action-icon {
  font-size: 3rem;
}

.action-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.action-card p {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.95rem;
}

.action-card .arrow {
  color: var(--solar-gold-dark);
  font-weight: 700;
  font-size: 1.25rem;
  margin-top: auto;
  transition: transform 0.3s ease;
}

.action-card:hover .arrow {
  transform: translateX(4px);
}

/* Charts Section */
.charts-section {
  margin-bottom: 3rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.chart-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--gray-900);
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, var(--solar-gold) 0%, var(--solar-gold-dark) 100%);
  border-radius: 0.5rem 0.5rem 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
  transform-origin: bottom;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  font-size: 0.85rem;
  color: var(--gray-600);
  font-weight: 500;
}

.pie-chart {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #22c55e 0deg,
    #22c55e 252deg,
    #ef4444 252deg,
    #ef4444 324deg,
    #eab308 324deg,
    #eab308 360deg
  );
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pie-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.pie-legend div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.active {
  background: #22c55e;
}

.dot.inactive {
  background: #ef4444;
}

.dot.maintenance {
  background: #eab308;
}

/* Time Range Tabs */
.time-range-tabs {
  display: flex;
  gap: 0.5rem;
  background: var(--gray-100);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.range-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
}

.range-tab:hover {
  color: var(--gray-900);
}

.range-tab.active {
  background: var(--bg-primary);
  color: var(--solar-gold-dark);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

/* Chart Summary */
.chart-summary {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--gray-600);
}

.chart-summary strong {
  color: var(--gray-900);
}

/* Insights Row (Weather & Savings) */
.insights-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2rem;
}

.insight-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.insight-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--gray-900);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.weather-icon {
  font-size: 3rem;
}

.weather-temp {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.weather-desc {
  font-size: 0.95rem;
  color: var(--gray-600);
  margin: 0.25rem 0 0 0;
}

.weather-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.weather-details > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--gray-50);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.weather-details span {
  color: var(--gray-600);
}

.weather-details strong {
  color: var(--gray-900);
}

.weather-impact {
  font-size: 0.925rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin: 0;
}

.impact-good {
  background: #dcfce7;
  color: #166534;
}

.impact-moderate {
  background: #fef3c7;
  color: #92400e;
}

.impact-low {
  background: #fee2e2;
  color: #7f1d1d;
}

/* Savings Grid */
.savings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.savings-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 0.75rem;
}

.savings-icon {
  font-size: 1.5rem;
}

.savings-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.savings-label {
  font-size: 0.8rem;
  color: var(--gray-600);
  margin: 0.125rem 0 0 0;
}

/* Alert Details */
.alert-body {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.alert-body strong {
  font-size: 0.9rem;
}

.alert-body span {
  font-size: 0.85rem;
  opacity: 0.85;
}

.alert-time {
  flex-shrink: 0;
  font-size: 0.8rem;
  opacity: 0.7;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.825rem;
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

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-maintenance {
  background-color: #fef3c7;
  color: #92400e;
}

.alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.alert-icon {
  flex-shrink: 0;
  font-weight: 600;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border-left: 4px solid #22c55e;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border-left: 4px solid #eab308;
}

.alert-danger {
  background: #fee2e2;
  color: #7f1d1d;
  border-left: 4px solid #ef4444;
}

.alert-info {
  background: #cffafe;
  color: #164e63;
  border-left: 4px solid #06b6d4;
}

/* Button Styles — uses global .btn classes from main.css */

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-text h1 {
    font-size: 1.875rem;
  }

  .hero-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .hero-stat-number {
    font-size: 1.75rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .modern-table {
    font-size: 0.875rem;
  }

  .modern-table th,
  .modern-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    gap: 0.25rem;
  }

  .btn-icon {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .insights-row {
    grid-template-columns: 1fr;
  }

  .time-range-tabs {
    flex-wrap: wrap;
  }

  .savings-grid {
    grid-template-columns: 1fr;
  }

  .weather-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: 0.75rem;
  }

  .hero-section {
    padding: 1.5rem;
  }

  .hero-text h1 {
    font-size: 1.5rem;
  }

  .hero-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }
}

.mb-8 {
  margin-bottom: 2rem;
}

.mt-4 {
  margin-top: 1rem;
}

.text-gray-600 {
  color: var(--gray-600);
}

/* ── Energy Economics Section ── */
.energy-economics-section {
  margin-bottom: 3rem;
}

.economics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.economics-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color-light);
  position: relative;
  overflow: hidden;
}

.economics-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.energy-cost-card::before {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.savings-highlight-card::before {
  background: linear-gradient(90deg, #22c55e, #10b981);
}

.payback-card::before {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.econ-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.economics-card h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.econ-primary-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.25rem 0;
}

.econ-unit {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--gray-600);
}

.econ-meta {
  font-size: 0.85rem;
  color: var(--gray-500);
  margin: 0 0 1.25rem 0;
}

.econ-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  border-top: 1px solid var(--border-color-light);
  font-size: 0.875rem;
}

.econ-detail-row span {
  color: var(--gray-600);
}

.econ-detail-row strong {
  color: var(--gray-900);
}

.payback-bar-wrapper {
  margin: 1.25rem 0;
}

.payback-bar {
  width: 100%;
  height: 10px;
  background: var(--gray-200);
  border-radius: 5px;
  overflow: hidden;
}

.payback-progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.payback-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: 0.375rem;
}

.text-green-600 {
  color: #16a34a;
}

/* ── Dark Theme Overrides ── */
:global(.dark-theme) .hero-section {
  background: linear-gradient(135deg, #2A1F00 0%, #1E293B 100%);
  color: #E2E8F0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

:global(.dark-theme) .hero-text h1 {
  color: #FFB81C;
}

:global(.dark-theme) .sample-data-banner {
  background: linear-gradient(135deg, #1E293B 0%, #2A1F00 100%);
  border-color: #FFCA4F;
}

:global(.dark-theme) .sample-banner-content strong {
  color: #FCD34D;
}

:global(.dark-theme) .sample-banner-content p {
  color: #94A3B8;
}

:global(.dark-theme) .kpi-card {
  background: #1E293B;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

:global(.dark-theme) .kpi-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

:global(.dark-theme) .kpi-value {
  color: #F1F5F9;
}

:global(.dark-theme) .kpi-title {
  color: #94A3B8;
}

:global(.dark-theme) .kpi-meta {
  color: #64748B;
}

:global(.dark-theme) .trend-up {
  background-color: #064E3B;
  color: #6EE7B7;
}

:global(.dark-theme) .trend-neutral {
  background-color: #334155;
  color: #94A3B8;
}

:global(.dark-theme) .section-header h2 {
  color: #E2E8F0;
}

:global(.dark-theme) .section-header .text-gray-600 {
  color: #94A3B8;
}

:global(.dark-theme) .table-wrapper {
  background: #1E293B;
}

:global(.dark-theme) .modern-table thead {
  background: linear-gradient(90deg, #1E293B 0%, #334155 100%);
  border-bottom-color: #475569;
}

:global(.dark-theme) .modern-table th {
  color: #94A3B8;
}

:global(.dark-theme) .modern-table td {
  color: #CBD5E1;
  border-color: #334155;
}

:global(.dark-theme) .name-content .font-semibold {
  color: #F1F5F9;
}

:global(.dark-theme) .action-card {
  background: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .action-card:hover {
  border-color: #FFCA4F;
}

:global(.dark-theme) .action-card h3 {
  color: #F1F5F9;
}

:global(.dark-theme) .action-card p {
  color: #94A3B8;
}

:global(.dark-theme) .chart-card {
  background: #1E293B;
}

:global(.dark-theme) .chart-card h3 {
  color: #F1F5F9;
}

:global(.dark-theme) .chart-labels {
  color: #94A3B8;
}

:global(.dark-theme) .chart-summary {
  border-top-color: #334155;
  color: #94A3B8;
}

:global(.dark-theme) .chart-summary strong {
  color: #F1F5F9;
}

:global(.dark-theme) .insight-card {
  background: #1E293B;
}

:global(.dark-theme) .insight-card h3 {
  color: #F1F5F9;
}

:global(.dark-theme) .weather-temp {
  color: #F1F5F9;
}

:global(.dark-theme) .weather-desc {
  color: #94A3B8;
}

:global(.dark-theme) .weather-details > div {
  background: #0F172A;
}

:global(.dark-theme) .weather-details span {
  color: #94A3B8;
}

:global(.dark-theme) .weather-details strong {
  color: #F1F5F9;
}

:global(.dark-theme) .impact-good {
  background: #064E3B;
  color: #6EE7B7;
}

:global(.dark-theme) .impact-moderate {
  background: #451A03;
  color: #FCD34D;
}

:global(.dark-theme) .impact-low {
  background: #450A0A;
  color: #FCA5A5;
}

:global(.dark-theme) .savings-item {
  background: #0F172A;
}

:global(.dark-theme) .savings-value {
  color: #F1F5F9;
}

:global(.dark-theme) .savings-label {
  color: #94A3B8;
}

:global(.dark-theme) .time-range-tabs {
  background: #0F172A;
}

:global(.dark-theme) .range-tab {
  color: #94A3B8;
}

:global(.dark-theme) .range-tab:hover {
  color: #F1F5F9;
}

:global(.dark-theme) .range-tab.active {
  background: #334155;
  color: #FFCA4F;
}

:global(.dark-theme) .pie-legend {
  color: #CBD5E1;
}

:global(.dark-theme) .status-active {
  background-color: #064E3B;
  color: #6EE7B7;
}

:global(.dark-theme) .status-inactive {
  background-color: #450A0A;
  color: #FCA5A5;
}

:global(.dark-theme) .status-pending,
:global(.dark-theme) .status-maintenance {
  background-color: #451A03;
  color: #FCD34D;
}

:global(.dark-theme) .alert-success {
  background: #064E3B;
  color: #6EE7B7;
  border-left-color: #34D399;
}

:global(.dark-theme) .alert-warning {
  background: #451A03;
  color: #FCD34D;
  border-left-color: #FBBF24;
}

:global(.dark-theme) .alert-danger {
  background: #450A0A;
  color: #FCA5A5;
  border-left-color: #F87171;
}

:global(.dark-theme) .alert-info {
  background: #0C4A6E;
  color: #7DD3FC;
  border-left-color: #38BDF8;
}

:global(.dark-theme) .empty-state h3 {
  color: #F1F5F9;
}

:global(.dark-theme) .empty-state p {
  color: #94A3B8;
}

:global(.dark-theme) .performance-bar {
  background-color: #334155;
}

:global(.dark-theme) .btn-icon {
  background: #334155;
  color: #CBD5E1;
}

:global(.dark-theme) .btn-icon:hover {
  background: #FFCA4F;
  color: #1E293B;
}

:global(.dark-theme) .economics-card {
  background: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .economics-card h3 {
  color: #94A3B8;
}

:global(.dark-theme) .econ-primary-value {
  color: #F1F5F9;
}

:global(.dark-theme) .econ-unit {
  color: #94A3B8;
}

:global(.dark-theme) .econ-meta {
  color: #64748B;
}

:global(.dark-theme) .econ-detail-row {
  border-top-color: #334155;
}

:global(.dark-theme) .econ-detail-row span {
  color: #94A3B8;
}

:global(.dark-theme) .econ-detail-row strong {
  color: #F1F5F9;
}

:global(.dark-theme) .payback-bar {
  background: #334155;
}

:global(.dark-theme) .payback-labels span {
  color: #64748B;
}

:global(.dark-theme) .text-green-600 {
  color: #34D399 !important;
}
</style>
