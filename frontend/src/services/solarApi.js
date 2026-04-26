/**
 * Solar API Service
 * Calls the backend /api/solar/lookup which integrates:
 *   1. Google Solar API (primary, requires GOOGLE_SOLAR_API_KEY)
 *   2. NREL PVWatts API (fallback, requires NREL_API_KEY)
 *   3. NASA POWER API (free, no key needed — satellite irradiance data)
 *   4. Built-in regional estimates (no key needed)
 *
 * If the backend is unreachable, falls back to direct NASA POWER + built-in estimates.
 * Cascading location: address → zip code → city
 */

import axios from 'axios'
import api from './api'

/**
 * Look up solar potential for a location via backend (cascading providers).
 * Falls back to client-side NASA POWER if backend is unavailable.
 * @param {{ address?: string, city?: string, state?: string, zipCode?: string }} location
 * @returns {Promise<{ provider: string, data: object, availableProviders: object }>}
 */
export async function lookupSolarPotential(location) {
  try {
    const response = await api.post('/solar/lookup', location)
    return response.data
  } catch (err) {
    console.warn('Backend solar API unavailable, falling back to client-side NASA POWER:', err.message)
    return await clientSideSolarLookup(location)
  }
}

/**
 * Client-side fallback: geocode the address, then fetch NASA POWER data,
 * and build NREL-equivalent results.
 */
async function clientSideSolarLookup(location) {
  // Build geocode query
  const queryParts = [location.address, location.city, location.state, location.zipCode].filter(Boolean)
  let query = queryParts.join(', ')
  // Default to Philippines if empty
  if (!query) query = 'Manila, Philippines'

  // 1. Geocode
  let lat, lng, displayName
  try {
    const geo = await geocodeAddress(query)
    if (geo) {
      lat = geo.lat
      lng = geo.lng
      displayName = geo.displayName
    }
  } catch (e) {
    console.warn('Geocoding failed:', e.message)
  }

  // Default to Manila, Philippines if geocoding fails
  if (!lat || !lng) {
    lat = 14.5995
    lng = 120.9842
    displayName = 'Manila, Philippines (default)'
  }

  // 2. Fetch NASA POWER data
  let nasaData
  try {
    nasaData = await fetchNasaPowerData(lat, lng)
  } catch (e) {
    console.warn('NASA POWER API failed:', e.message)
    // Use Philippine average
    nasaData = getPhilippinesDefaultData(lat, lng)
  }

  // 3. Calculate NREL-equivalent estimates
  const systemCapacityKw = 5 // reference system
  const peakSunHours = nasaData.peakSunHoursPerDay || 4.5
  const annualProduction = Math.round(systemCapacityKw * peakSunHours * 365 * 0.80) // 80% performance ratio
  const monthlyProduction = nasaData.monthlyIrradiance
    ? nasaData.monthlyIrradiance.map(irr => Math.round(systemCapacityKw * irr * 30 * 0.80))
    : null

  // Temperature derating
  const avgTemp = nasaData.annualTempC || 27
  const tempDeratingFactor = avgTemp > 25 ? 1 - (avgTemp - 25) * 0.004 : 1
  const tempAdjustedProduction = Math.round(annualProduction * tempDeratingFactor)

  const capacityFactor = ((annualProduction / (systemCapacityKw * 8760)) * 100).toFixed(1)

  return {
    provider: 'nasa_power',
    data: {
      formattedAddress: displayName,
      latitude: lat,
      longitude: lng,
      solarRadiationAnnual: nasaData.annualIrradianceKwhM2Day,
      solarRadiationMonthly: nasaData.monthlyIrradiance,
      monthlyProductionKwh: monthlyProduction,
      annualProductionKwh: tempAdjustedProduction,
      capacityFactor,
      estimatedPeakSunHoursPerDay: peakSunHours,
      monthlyTemperatureC: nasaData.monthlyTemp,
      avgTemperatureC: avgTemp,
      tempDeratingFactor,
      tempAdjustedProductionKwh: tempAdjustedProduction,
      monthLabels: nasaData.monthLabels || ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
      note: 'Data sourced directly from NASA POWER satellite climatology (client-side fallback). For more accurate results, configure the backend API.'
    },
    availableProviders: {
      google_solar: false,
      nrel_pvwatts: false,
      nasa_power: true,
      built_in_estimate: true
    }
  }
}

/**
 * Default solar data for the Philippines when NASA POWER is unreachable.
 */
function getPhilippinesDefaultData(lat, lng) {
  return {
    latitude: lat || 14.5995,
    longitude: lng || 120.9842,
    annualIrradianceKwhM2Day: 4.8,
    annualClearSkyKwhM2Day: 6.2,
    annualTempC: 27.5,
    monthlyIrradiance: [4.2, 4.8, 5.5, 5.8, 5.2, 4.6, 4.3, 4.1, 4.5, 4.7, 4.5, 4.1],
    monthlyClearSky: [5.8, 6.2, 6.8, 7.0, 6.5, 6.0, 5.6, 5.4, 5.9, 6.1, 5.9, 5.5],
    monthlyTemp: [26.1, 26.5, 27.8, 29.2, 29.5, 28.8, 28.0, 27.8, 27.5, 27.2, 27.0, 26.3],
    monthlyTempMax: [30.2, 31.0, 32.5, 34.0, 34.2, 33.0, 31.8, 31.5, 31.2, 31.0, 30.8, 30.0],
    monthlyTempMin: [22.0, 22.0, 23.0, 24.5, 25.0, 24.8, 24.2, 24.0, 23.8, 23.5, 23.2, 22.5],
    monthlyWindSpeed: [2.8, 2.5, 2.2, 1.8, 1.5, 2.0, 2.5, 2.8, 2.2, 2.0, 2.5, 3.0],
    monthLabels: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    peakSunHoursPerDay: 4.8,
    annualSunshineHours: 1752,
  }
}

/**
 * Direct NASA POWER API call from the frontend.
 * Free, no API key needed. Returns climatological solar irradiance & temperature.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} NASA POWER data with monthly/annual irradiance
 */
export async function fetchNasaPowerData(lat, lng) {
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/climatology/point', {
      params: {
        parameters: 'ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,T2M,T2M_MAX,T2M_MIN,WS2M',
        community: 'RE',
        longitude: lng.toFixed(4),
        latitude: lat.toFixed(4),
        format: 'JSON'
      },
      timeout: 15000
    }
  )

  const params = res.data?.properties?.parameter
  if (!params) throw new Error('No data returned from NASA POWER')

  const monthKeys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const irradiance = params.ALLSKY_SFC_SW_DWN || {}
  const clearSky = params.CLRSKY_SFC_SW_DWN || {}
  const temp = params.T2M || {}
  const tempMax = params.T2M_MAX || {}
  const tempMin = params.T2M_MIN || {}
  const windSpeed = params.WS2M || {}

  return {
    latitude: lat,
    longitude: lng,
    annualIrradianceKwhM2Day: irradiance.ANN || 0,
    annualClearSkyKwhM2Day: clearSky.ANN || 0,
    annualTempC: temp.ANN || 0,
    monthlyIrradiance: monthKeys.map(m => parseFloat((irradiance[m] || 0).toFixed(2))),
    monthlyClearSky: monthKeys.map(m => parseFloat((clearSky[m] || 0).toFixed(2))),
    monthlyTemp: monthKeys.map(m => parseFloat((temp[m] || 0).toFixed(1))),
    monthlyTempMax: monthKeys.map(m => parseFloat((tempMax[m] || 0).toFixed(1))),
    monthlyTempMin: monthKeys.map(m => parseFloat((tempMin[m] || 0).toFixed(1))),
    monthlyWindSpeed: monthKeys.map(m => parseFloat((windSpeed[m] || 0).toFixed(1))),
    monthLabels: monthKeys,
    peakSunHoursPerDay: parseFloat((irradiance.ANN || 0).toFixed(2)),
    annualSunshineHours: parseFloat(((irradiance.ANN || 0) * 365).toFixed(0))
  }
}

/**
 * Geocode an address using Nominatim (OpenStreetMap) — free, no key.
 * @param {string} query - Address, city, or zip to geocode
 * @returns {Promise<{ lat: number, lng: number, displayName: string } | null>}
 */
export async function geocodeAddress(query) {
  if (!query || query.trim().length < 2) return null
  const res = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: query, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'ApolakiSolarPlatform/1.0' },
    timeout: 8000
  })
  if (res.data?.[0]) {
    return {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon),
      displayName: res.data[0].display_name
    }
  }
  return null
}

export default { lookupSolarPotential, fetchNasaPowerData, geocodeAddress }
