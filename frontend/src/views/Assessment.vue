<template>
  <div class="assessment">
    <h1>Solar Assessment</h1>

    <div class="card form-card">
      <div class="card-header">
        <h2>Get Your Free Solar Assessment</h2>
        <p class="card-subtitle">Enter your property details to get a personalized solar analysis powered by Google Solar API</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2">
          <div>
            <label for="address">Property Address</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label for="city">City</label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              placeholder="San Francisco"
            />
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div>
            <label for="state">State</label>
            <input
              id="state"
              v-model="form.state"
              type="text"
              placeholder="CA"
            />
          </div>

          <div>
            <label for="zipCode">Zip Code</label>
            <input
              id="zipCode"
              v-model="form.zip_code"
              type="text"
              placeholder="94102"
            />
          </div>
        </div>

        <!-- Solar API Lookup Button -->
        <div class="solar-lookup-section">
          <button type="button" @click="handleSolarLookup" :disabled="solarLookupLoading" class="btn btn-solar-lookup">
            {{ solarLookupLoading ? '🔍 Looking up solar data...' : '☀️ Lookup Solar Potential' }}
          </button>
          <span class="lookup-hint">Uses address → zip code → city (cascading)</span>
        </div>

        <!-- Solar API Results Panel -->
        <div v-if="solarApiData" class="solar-api-panel">
          <div class="solar-api-header">
            <h3>☀️ Solar Potential Data</h3>
            <span class="provider-badge" :class="'provider-' + solarApiData.provider">
              {{ providerLabel(solarApiData.provider) }}
            </span>
          </div>

          <div class="solar-api-grid">
            <div class="solar-api-item" v-if="solarApiData.data.formattedAddress">
              <span class="solar-label">📍 Location</span>
              <span class="solar-value">{{ solarApiData.data.formattedAddress }}</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.maxSunshineHoursPerYear">
              <span class="solar-label">🌤️ Annual Sunshine</span>
              <span class="solar-value">{{ Number(solarApiData.data.maxSunshineHoursPerYear).toLocaleString() }} hrs/yr</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.maxPanelCount">
              <span class="solar-label">🔲 Max Panels</span>
              <span class="solar-value">{{ solarApiData.data.maxPanelCount }} panels</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.maxArrayAreaSqFt">
              <span class="solar-label">📐 Roof Area</span>
              <span class="solar-value">{{ Number(solarApiData.data.maxArrayAreaSqFt).toLocaleString() }} sq ft</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.bestConfig">
              <span class="solar-label">⚡ Best Config</span>
              <span class="solar-value">{{ solarApiData.data.bestConfig.capacityKw }} kW ({{ solarApiData.data.bestConfig.panelsCount }} panels)</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.bestConfig">
              <span class="solar-label">🔋 Est. Annual Production</span>
              <span class="solar-value">{{ Number(solarApiData.data.bestConfig.yearlyEnergyDcKwh).toLocaleString() }} kWh</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.annualProductionKwh">
              <span class="solar-label">🔋 Annual Production (5kW ref)</span>
              <span class="solar-value">{{ Number(solarApiData.data.annualProductionKwh).toLocaleString() }} kWh</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.capacityFactor">
              <span class="solar-label">📊 Capacity Factor</span>
              <span class="solar-value">{{ solarApiData.data.capacityFactor }}%</span>
            </div>
            <div class="solar-api-item" v-if="solarApiData.data.estimatedPeakSunHoursPerDay">
              <span class="solar-label">🌞 Peak Sun Hours/Day</span>
              <span class="solar-value">{{ solarApiData.data.estimatedPeakSunHoursPerDay }} hrs</span>
            </div>
          </div>

          <!-- Roof Segments (Google Solar only) -->
          <div v-if="solarApiData.data.roofSegments && solarApiData.data.roofSegments.length > 0" class="roof-segments">
            <h4>Roof Segments</h4>
            <div class="segments-grid">
              <div v-for="(seg, i) in solarApiData.data.roofSegments" :key="i" class="segment-card">
                <span class="segment-label">Segment {{ i + 1 }}</span>
                <span>{{ seg.areaSqFt }} sq ft · {{ seg.pitchDegrees }}° pitch · {{ seg.sunshineHours }} hrs sun</span>
              </div>
            </div>
          </div>

          <!-- Available Providers Info -->
          <div class="providers-info">
            <span class="providers-label">Available providers:</span>
            <span :class="solarApiData.availableProviders.google_solar ? 'prov-active' : 'prov-inactive'">Google Solar</span>
            <span :class="solarApiData.availableProviders.nrel_pvwatts ? 'prov-active' : 'prov-inactive'">NREL PVWatts</span>
            <span :class="solarApiData.availableProviders.nasa_power ? 'prov-active' : 'prov-inactive'">NASA POWER</span>
            <span class="prov-active">Built-in Estimate</span>
          </div>

          <!-- Monthly Solar Chart (NASA / NREL data) -->
          <div v-if="solarApiData.data.monthlyProductionKwh || solarApiData.data.solarRadiationMonthly" class="monthly-chart-section">
            <h4>📊 Monthly Solar Data</h4>
            <div class="chart-container">
              <div class="bar-chart">
                <div
                  v-for="(val, i) in (solarApiData.data.monthlyProductionKwh || solarApiData.data.solarRadiationMonthly)"
                  :key="i"
                  class="bar-wrapper"
                >
                  <div class="bar-value">{{ Math.round(val) }}</div>
                  <div
                    class="bar"
                    :style="{ height: getBarHeight(val, solarApiData.data.monthlyProductionKwh || solarApiData.data.solarRadiationMonthly) + '%' }"
                    :title="`${(solarApiData.data.monthLabels || monthLabels)[i]}: ${Math.round(val)} ${solarApiData.data.monthlyProductionKwh ? 'kWh' : 'kWh/m²/day'}`"
                  ></div>
                  <div class="bar-label">{{ (solarApiData.data.monthLabels || monthLabels)[i] }}</div>
                </div>
              </div>
              <p class="chart-caption">{{ solarApiData.data.monthlyProductionKwh ? 'Monthly Production (kWh, 5kW reference system)' : 'Monthly Solar Radiation (kWh/m²/day)' }}</p>
            </div>
          </div>

          <!-- Temperature Data (NASA) -->
          <div v-if="solarApiData.data.monthlyTemperatureC" class="temp-section">
            <h4>🌡️ Average Temperature</h4>
            <div class="temp-grid">
              <div v-for="(t, i) in solarApiData.data.monthlyTemperatureC" :key="'t'+i" class="temp-item">
                <span class="temp-label">{{ (solarApiData.data.monthLabels || monthLabels)[i] }}</span>
                <span class="temp-value" :class="t > 30 ? 'temp-hot' : t < 10 ? 'temp-cold' : 'temp-mild'">{{ t }}°C</span>
              </div>
            </div>
            <div v-if="solarApiData.data.tempDeratingFactor && solarApiData.data.tempDeratingFactor < 1" class="temp-derate-note">
              ⚠️ Temperature derating: {{ ((1 - solarApiData.data.tempDeratingFactor) * 100).toFixed(1) }}% efficiency loss due to avg temp {{ solarApiData.data.avgTemperatureC }}°C (panels rated at 25°C STC).
              Adjusted annual production: <strong>{{ Number(solarApiData.data.tempAdjustedProductionKwh).toLocaleString() }} kWh</strong>
            </div>
          </div>

          <p v-if="solarApiData.data.note" class="solar-note">ℹ️ {{ solarApiData.data.note }}</p>
        </div>

        <div v-if="solarLookupError" class="alert alert-error">{{ solarLookupError }}</div>

        <hr class="form-divider" />

        <h3 class="form-section-title">Property & Usage Details</h3>

        <div class="grid grid-cols-2">
          <div>
            <label for="roofArea">Roof Area (sq ft)</label>
            <input
              id="roofArea"
              v-model.number="form.roof_area"
              type="number"
              step="10"
              placeholder="2000"
              required
            />
          </div>

          <div>
            <label for="annualUsage">Annual Energy Usage (kWh)</label>
            <input
              id="annualUsage"
              v-model.number="form.annual_usage"
              type="number"
              step="100"
              placeholder="8000"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div>
            <label for="roofCondition">Roof Condition</label>
            <select id="roofCondition" v-model="form.roof_condition" required>
              <option value="">Select roof condition</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label for="sunExposure">Sun Exposure</label>
            <select id="sunExposure" v-model="form.sun_exposure" required>
              <option value="">Select sun exposure</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label for="obstruction">Obstruction Level</label>
          <select id="obstruction" v-model="form.obstruction_level" required>
            <option value="">Select obstruction level</option>
            <option value="none">None</option>
            <option value="minimal">Minimal</option>
            <option value="moderate">Moderate</option>
          </select>
        </div>

        <div>
          <label for="financing">Financing Option</label>
          <select id="financing" v-model="financingOption">
            <option value="cash">Cash Purchase</option>
            <option value="loan">Solar Loan</option>
            <option value="lease">Solar Lease</option>
          </select>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Analyzing...' : 'Get Assessment' }}
        </button>
      </form>
    </div>

    <!-- Assessment Results -->
    <div v-if="results" class="card results-card">
      <div class="card-header">
        <h2>Assessment Results</h2>
        <span v-if="results.dataSource" class="data-source-badge">{{ results.dataSource }}</span>
      </div>

      <div v-if="results.nasaIrradiance" class="nasa-insight">
        <span>🛰️ NASA satellite irradiance: <strong>{{ results.nasaIrradiance }} kWh/m²/day</strong></span>
        <span v-if="results.avgTemp"> · Avg temp: <strong>{{ results.avgTemp }}°C</strong></span>
        <span v-if="results.tempDeratingFactor < 1"> · Temp efficiency: <strong>{{ (results.tempDeratingFactor * 100).toFixed(1) }}%</strong></span>
      </div>

      <div class="results-grid">
        <div class="result-item">
          <h3>Recommended System</h3>
          <div class="result-value">{{ results.capacity }} kW</div>
          <p class="result-description">{{ results.panelCount }} panels</p>
        </div>

        <div class="result-item">
          <h3>Estimated Cost</h3>
          <div class="result-value">{{ results.cost }}</div>
          <p class="result-description">Net after incentives: {{ results.netCost }}</p>
        </div>

        <div class="result-item">
          <h3>Annual Savings</h3>
          <div class="result-value">{{ results.savings }}</div>
          <p class="result-description">{{ results.annualProduction }} kWh/year</p>
        </div>

        <div class="result-item">
          <h3>Payback Period</h3>
          <div class="result-value">{{ results.payback }} years</div>
          <p class="result-description">ROI: {{ results.roi }}%</p>
        </div>

        <div class="result-item">
          <h3>20-Year Savings</h3>
          <div class="result-value">{{ results.twentyYearSavings }}</div>
          <p class="result-description">Net lifetime benefit</p>
        </div>

        <div class="result-item">
          <h3>Carbon Offset</h3>
          <div class="result-value">{{ results.carbonOffset }} tons</div>
          <p class="result-description">CO₂ avoided over 20 years</p>
        </div>

        <div class="result-item">
          <h3>Federal Tax Credit (30%)</h3>
          <div class="result-value">{{ results.federalTaxCredit }}</div>
          <p class="result-description">Investment Tax Credit</p>
        </div>

        <div class="result-item">
          <h3>State Tax Credit</h3>
          <div class="result-value">{{ results.stateTaxCredit }}</div>
          <p class="result-description">Additional state incentive</p>
        </div>
      </div>

      <div v-if="results.financing" class="results-summary financing-details" style="margin-bottom: 1rem;">
        <h3>💳 Financing Details</h3>
        <div v-if="results.financing.monthlyPayment" class="financing-grid">
          <p><strong>Loan Amount:</strong> {{ formatCurrency(results.financing.loanAmount || 0) }}</p>
          <p><strong>Interest Rate:</strong> {{ results.financing.interestRate }}%</p>
          <p><strong>Term:</strong> {{ results.financing.termMonths }} months</p>
          <p class="financing-highlight"><strong>Monthly Payment: {{ formatCurrency(results.financing.monthlyPayment || 0) }}</strong></p>
        </div>
        <div v-else-if="results.financing.monthlyLease" class="financing-grid">
          <p><strong>Lease Term:</strong> {{ results.financing.termMonths }} months</p>
          <p class="financing-highlight"><strong>Monthly Lease: {{ formatCurrency(results.financing.monthlyLease || 0) }}</strong></p>
        </div>
        <div v-else>
          <p><strong>Cash Purchase</strong> — No monthly payments. Full savings from day one.</p>
        </div>
      </div>

      <div class="results-summary">
        <h3>📋 Summary</h3>
        <p>{{ results.summary }}</p>
      </div>

      <button @click="results = null" class="btn btn-outline mt-4">
        Create Another Assessment
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { lookupSolarPotential } from '../services/solarApi'
import { useAssessmentStore } from '../stores/assessmentStore'
import { formatCurrency } from '../utils/currency'

const assessmentStore = useAssessmentStore()
const loading = ref(false)
const results = ref(null)
const error = ref(null)
const financingOption = ref('cash')
const previousAssessments = ref([])

// Solar API lookup state
const solarLookupLoading = ref(false)
const solarApiData = ref(null)
const solarLookupError = ref(null)

const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const form = reactive({
  address: '',
  city: 'Manila',
  state: 'Metro Manila',
  zip_code: '1000',
  roof_area: 2000,
  annual_usage: 8000,
  roof_condition: '',
  sun_exposure: '',
  obstruction_level: ''
})

const providerLabel = (provider) => {
  const labels = {
    google_solar: '🌍 Google Solar API',
    nrel_pvwatts: '🏛️ NREL PVWatts',
    nasa_power: '🛰️ NASA POWER',
    built_in_estimate: '📊 Built-in Estimate'
  }
  return labels[provider] || provider
}

/**
 * Calculate bar height percentage for the mini chart
 */
const getBarHeight = (val, arr) => {
  const max = Math.max(...arr)
  if (max === 0) return 0
  return Math.max(8, (val / max) * 100)
}

const handleSolarLookup = async () => {
  solarLookupLoading.value = true
  solarLookupError.value = null
  solarApiData.value = null
  try {
    const result = await lookupSolarPotential({
      address: form.address,
      city: form.city,
      state: form.state,
      zipCode: form.zip_code
    })
    solarApiData.value = result

    // Auto-populate form fields from API data
    if (result?.data) {
      const d = result.data
      // Set sun exposure based on irradiance
      if (d.solarRadiationAnnual || d.estimatedPeakSunHoursPerDay) {
        const psh = d.estimatedPeakSunHoursPerDay || d.solarRadiationAnnual || 0
        if (psh >= 5.0) form.sun_exposure = 'high'
        else if (psh >= 3.5) form.sun_exposure = 'medium'
        else form.sun_exposure = 'low'
      }
      // Set roof area from Google Solar data
      if (d.maxArrayAreaSqFt) {
        form.roof_area = d.maxArrayAreaSqFt
      }
    }
  } catch (err) {
    solarLookupError.value = err.response?.data?.error || 'Solar lookup failed. Please try again.'
  } finally {
    solarLookupLoading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await assessmentStore.calculateAssessment({
      address: form.address,
      city: form.city,
      state: form.state,
      zipCode: form.zip_code,
      roofCondition: form.roof_condition,
      roofArea: form.roof_area,
      annualUsage: form.annual_usage,
      sunExposure: form.sun_exposure,
      obstructionLevel: form.obstruction_level,
      financingOption: financingOption.value
    })

    const calc = response.calculation || response.savings_estimate || {}
    const dataSourceLabel = calc.dataSource === 'nasa_power' ? '🛰️ NASA POWER satellite data' : '📊 Regional estimates'
    results.value = {
      capacity: response.recommended_capacity || calc.recommendedCapacity || 0,
      cost: formatCurrency(response.estimated_cost || 0),
      netCost: formatCurrency(calc.netCost || 0),
      savings: formatCurrency(calc.annualSavings || 0),
      payback: calc.paybackYears || 0,
      twentyYearSavings: formatCurrency(calc.twentyYearSavings || 0),
      roi: calc.roi || 0,
      federalTaxCredit: formatCurrency(calc.federalTaxCredit || 0),
      stateTaxCredit: formatCurrency(calc.stateTaxCredit || 0),
      annualProduction: Number(calc.annualProduction || 0).toLocaleString(),
      panelCount: calc.panelCount || 0,
      carbonOffset: calc.carbonOffsetTons || 0,
      financing: calc.financing || null,
      dataSource: dataSourceLabel,
      nasaIrradiance: calc.nasaIrradianceKwhM2Day || null,
      avgTemp: calc.avgTemperatureC || null,
      tempDeratingFactor: calc.tempDeratingFactor || 1,
      summary: `Based on your property${calc.dataSource === 'nasa_power' ? ' (powered by NASA satellite irradiance data)' : ''}, a ${response.recommended_capacity || calc.recommendedCapacity || 0} kW solar system with ${calc.panelCount || 0} panels is recommended. Estimated annual production: ${Number(calc.annualProduction || 0).toLocaleString()} kWh. After incentives, net cost: ${formatCurrency(calc.netCost || 0)} with a payback period of ${calc.paybackYears || 0} years. 20-year savings: ${formatCurrency(calc.twentyYearSavings || 0)}. Carbon offset: ${calc.carbonOffsetTons || 0} tons CO₂.${calc.nasaIrradianceKwhM2Day ? ` Solar irradiance: ${calc.nasaIrradianceKwhM2Day} kWh/m²/day.` : ''}`
    }
  } catch (err) {
    error.value = err.response?.data?.error || assessmentStore.error || 'Assessment calculation failed'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await assessmentStore.fetchAssessments()
  previousAssessments.value = assessmentStore.assessments
})
</script>

<style scoped>
.assessment {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.assessment h1 {
  color: var(--text-main);
  margin-bottom: 1.5rem;
}

.form-card,
.results-card {
  max-width: 800px;
}

.grid-cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.grid-cols-2 > div {
  margin-bottom: 0;
}

.grid-cols-2 input,
.grid-cols-2 select {
  margin-bottom: 0;
}

.w-full {
  width: 100%;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.result-item {
  text-align: center;
  padding: 1.5rem;
  background-color: var(--gray-50);
  border-radius: 0.5rem;
}

.result-item h3 {
  margin-top: 0;
  color: var(--gray-700);
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0.5rem 0;
}

.result-description {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
}

.results-summary {
  background-color: #eff6ff;
  border-left: 4px solid var(--primary-color);
  padding: 1.5rem;
  border-radius: 0.375rem;
}

.results-summary h3 {
  margin-top: 0;
}

.financing-details {
  background-color: #fefce8;
  border-left-color: #f59e0b;
}

.financing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.financing-highlight {
  grid-column: 1 / -1;
  font-size: 1.125rem;
  color: var(--solar-gold-dark);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(245, 158, 11, 0.3);
}

.mt-4 {
  margin-top: 1rem;
}

/* Solar Lookup Section */
.solar-lookup-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.btn-solar-lookup {
  background: linear-gradient(135deg, #FFB81C 0%, #F5A700 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-solar-lookup:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 184, 28, 0.3);
}

.btn-solar-lookup:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.lookup-hint {
  font-size: 0.8rem;
  color: var(--gray-600, #6b7280);
  font-style: italic;
}

/* Solar API Results Panel */
.solar-api-panel {
  background: linear-gradient(135deg, #fefce8 0%, #fffbeb 100%);
  border: 1px solid #fcd34d;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.solar-api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.solar-api-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #92400e;
}

.provider-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.provider-google_solar {
  background: #dbeafe;
  color: #1e40af;
}

.provider-nrel_pvwatts {
  background: #dcfce7;
  color: #166534;
}

.provider-built_in_estimate {
  background: #f3f4f6;
  color: #374151;
}

.solar-api-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.solar-api-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
}

.solar-label {
  font-size: 0.8rem;
  color: #92400e;
  font-weight: 600;
}

.solar-value {
  font-size: 1rem;
  font-weight: 700;
  color: #78350f;
}

/* Roof Segments */
.roof-segments h4 {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: #92400e;
}

.segments-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.segment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.375rem;
  font-size: 0.85rem;
}

.segment-label {
  font-weight: 600;
  color: #92400e;
}

/* Providers Info */
.providers-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  font-size: 0.8rem;
}

.providers-label {
  color: #92400e;
  font-weight: 600;
}

.prov-active {
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  background: #dcfce7;
  color: #166534;
  font-weight: 500;
}

.prov-inactive {
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  background: #f3f4f6;
  color: #9ca3af;
  font-weight: 500;
  text-decoration: line-through;
}

.solar-note {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  color: #92400e;
  font-style: italic;
}

/* Monthly Chart */
.monthly-chart-section {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(251, 191, 36, 0.3);
}

.monthly-chart-section h4 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: #92400e;
}

.chart-container {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.5rem;
  padding: 1rem;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 140px;
  gap: 4px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
}

.bar {
  width: 100%;
  max-width: 36px;
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  border-radius: 3px 3px 0 0;
  min-height: 4px;
  transition: height 0.4s ease;
}

.bar-value {
  font-size: 0.6rem;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 2px;
}

.bar-label {
  font-size: 0.6rem;
  color: #78350f;
  margin-top: 4px;
  font-weight: 500;
}

.chart-caption {
  text-align: center;
  font-size: 0.75rem;
  color: #92400e;
  margin: 0.5rem 0 0;
  font-style: italic;
}

/* Temperature section */
.temp-section {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(251, 191, 36, 0.3);
}

.temp-section h4 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: #92400e;
}

.temp-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.temp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.35rem 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.375rem;
  min-width: 48px;
}

.temp-label {
  font-size: 0.6rem;
  color: #92400e;
  font-weight: 600;
}

.temp-value {
  font-size: 0.8rem;
  font-weight: 700;
}

.temp-hot { color: #dc2626; }
.temp-mild { color: #059669; }
.temp-cold { color: #2563eb; }

.temp-derate-note {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fef3c7;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  color: #92400e;
}

/* NASA Insight in Results */
.nasa-insight {
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #1e40af;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.data-source-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #dbeafe;
  color: #1e40af;
}

/* Provider badge for NASA */
.provider-nasa_power {
  background: #e0f2fe;
  color: #0369a1;
}

/* Form Divider */
.form-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}

.form-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem;
}

/* Alerts */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
  font-size: 0.9rem;
}

.alert-error {
  background: #fee2e2;
  color: #7f1d1d;
  border-left: 4px solid #ef4444;
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .solar-api-grid {
    grid-template-columns: 1fr;
  }

  .solar-lookup-section {
    flex-direction: column;
    align-items: stretch;
  }
}

/* ── Dark Theme Overrides ── */
:global(.dark-theme) .assessment h1 {
  color: #F1F5F9;
}

:global(.dark-theme) .form-card,
:global(.dark-theme) .results-card {
  background-color: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .result-item {
  background-color: #0F172A;
}

:global(.dark-theme) .result-item h3 {
  color: #CBD5E1;
}

:global(.dark-theme) .result-value {
  color: #FFCA4F;
}

:global(.dark-theme) .result-description {
  color: #94A3B8;
}

:global(.dark-theme) .results-summary {
  background-color: #0C2D4F;
  border-left-color: #FFCA4F;
}

:global(.dark-theme) .results-summary h3 {
  color: #E2E8F0;
}

:global(.dark-theme) .results-summary p {
  color: #CBD5E1;
}

:global(.dark-theme) .financing-details {
  background-color: #2A1F00;
  border-left-color: #FFCA4F;
}

:global(.dark-theme) .financing-highlight {
  color: #FCD34D;
  border-top-color: rgba(255, 202, 79, 0.3);
}

:global(.dark-theme) .solar-api-panel {
  background: linear-gradient(135deg, #2A1F00 0%, #1E293B 100%);
  border-color: #FFCA4F;
}

:global(.dark-theme) .solar-api-header h3,
:global(.dark-theme) .solar-label,
:global(.dark-theme) .solar-note,
:global(.dark-theme) .bar-value,
:global(.dark-theme) .bar-label,
:global(.dark-theme) .chart-caption,
:global(.dark-theme) .temp-label,
:global(.dark-theme) .temp-derate-note,
:global(.dark-theme) .roof-segments h4,
:global(.dark-theme) .monthly-chart-section h4,
:global(.dark-theme) .temp-section h4,
:global(.dark-theme) .providers-label,
:global(.dark-theme) .segment-label {
  color: #FCD34D;
}

:global(.dark-theme) .solar-value {
  color: #FFECA1;
}

:global(.dark-theme) .solar-api-item,
:global(.dark-theme) .segment-card,
:global(.dark-theme) .chart-container,
:global(.dark-theme) .temp-item {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark-theme) .provider-google_solar {
  background: #1E3A5F;
  color: #93C5FD;
}

:global(.dark-theme) .provider-nrel_pvwatts {
  background: #064E3B;
  color: #6EE7B7;
}

:global(.dark-theme) .provider-nasa_power {
  background: #0C4A6E;
  color: #7DD3FC;
}

:global(.dark-theme) .provider-built_in_estimate {
  background: #334155;
  color: #CBD5E1;
}

:global(.dark-theme) .prov-active {
  background: #064E3B;
  color: #6EE7B7;
}

:global(.dark-theme) .prov-inactive {
  background: #334155;
  color: #64748B;
}

:global(.dark-theme) .nasa-insight {
  background: linear-gradient(135deg, #0C2D4F 0%, #1E293B 100%);
  border-color: #3B9AFF;
  color: #93C5FD;
}

:global(.dark-theme) .data-source-badge {
  background: #0C2D4F;
  color: #93C5FD;
}

:global(.dark-theme) .temp-derate-note {
  background: #2A1F00;
}

:global(.dark-theme) .form-divider {
  border-color: #334155;
}

:global(.dark-theme) .form-section-title {
  color: #CBD5E1;
}

:global(.dark-theme) .alert-error {
  background: #450A0A;
  border-left-color: #F87171;
  color: #FCA5A5;
}
</style>
