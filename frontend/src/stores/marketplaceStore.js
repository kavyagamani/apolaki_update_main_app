import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

/**
 * Fallback seed data so the marketplace always has products to browse,
 * even when the backend API is unavailable.
 */
const SEED_PRODUCTS = [
  {
    id: 'seed-panel-jinko', name: 'JinkoSolar Tiger Neo 580W', category: 'panels',
    description: 'N-type monocrystalline module with 22.27% max efficiency. 30-year warranty.',
    price: 245, inventory: 500, rating: 4.8, review_count: 124,
    manufacturer: 'JinkoSolar',
    specs: { wattage: '580W', efficiency: '22.27%', warranty: '30 years', weight: '28.9 kg' }
  },
  {
    id: 'seed-panel-longi', name: 'LONGi Hi-MO 6 545W', category: 'panels',
    description: 'HPBC cell technology, anti-reflective glass. Excellent low-light performance.',
    price: 215, inventory: 350, rating: 4.7, review_count: 89,
    manufacturer: 'LONGi',
    specs: { wattage: '545W', efficiency: '21.3%', warranty: '25 years', weight: '27.5 kg' }
  },
  {
    id: 'seed-panel-trina', name: 'Trina Solar Vertex S+ 450W', category: 'panels',
    description: '210mm cells with multi-busbar technology. Ideal for residential rooftops.',
    price: 190, inventory: 800, rating: 4.6, review_count: 67,
    manufacturer: 'Trina Solar',
    specs: { wattage: '450W', efficiency: '21.1%', warranty: '25 years' }
  },
  {
    id: 'seed-inverter-sma', name: 'SMA Sunny Tripower 10.0', category: 'inverters',
    description: '10 kW three-phase string inverter with Smart Connected auto-diagnostics.',
    price: 2150, inventory: 120, rating: 4.9, review_count: 56,
    manufacturer: 'SMA',
    specs: { power: '10 kW', phases: '3', efficiency: '98.4%', mppt_trackers: '2' }
  },
  {
    id: 'seed-inverter-huawei', name: 'Huawei SUN2000-5KTL-M1', category: 'inverters',
    description: '5 kW single-phase inverter with AI-powered MPPT. Battery-ready.',
    price: 1350, inventory: 200, rating: 4.7, review_count: 78,
    manufacturer: 'Huawei',
    specs: { power: '5 kW', phases: '1', efficiency: '98.6%' }
  },
  {
    id: 'seed-inverter-enphase', name: 'Enphase IQ8M Microinverter', category: 'inverters',
    description: '330 VA microinverter with grid-forming capability. 25-year warranty.',
    price: 189, inventory: 1000, rating: 4.8, review_count: 203,
    manufacturer: 'Enphase',
    specs: { power: '330 VA', type: 'Microinverter', efficiency: '97.5%', warranty: '25 years' }
  },
  {
    id: 'seed-battery-tesla', name: 'Tesla Powerwall 3', category: 'batteries',
    description: '13.5 kWh lithium-ion battery with integrated inverter. Whole-home backup.',
    price: 8500, inventory: 45, rating: 4.8, review_count: 312,
    manufacturer: 'Tesla',
    specs: { capacity: '13.5 kWh', power: '11.5 kW', efficiency: '90%', warranty: '10 years' }
  },
  {
    id: 'seed-battery-byd', name: 'BYD Battery-Box HVM 11.0', category: 'batteries',
    description: '11.04 kWh modular lithium-iron-phosphate battery. Cobalt-free.',
    price: 6200, inventory: 80, rating: 4.6, review_count: 95,
    manufacturer: 'BYD',
    specs: { capacity: '11.04 kWh', power: '5 kW', efficiency: '95.3%', modules: '4' }
  },
  {
    id: 'seed-charger-wallbox', name: 'Wallbox Pulsar Plus 48A', category: 'ev-chargers',
    description: '11.5 kW Level 2 EV charger with WiFi and solar charging integration.',
    price: 649, inventory: 150, rating: 4.5, review_count: 167,
    manufacturer: 'Wallbox',
    specs: { power: '11.5 kW', amperage: '48A', connector: 'J1772', smart: 'Yes' }
  },
  {
    id: 'seed-monitor-sense', name: 'Sense Energy Monitor', category: 'monitoring',
    description: 'Real-time home energy monitor with solar production tracking. ML-based device detection.',
    price: 299, inventory: 200, rating: 4.3, review_count: 245,
    manufacturer: 'Sense',
    specs: { phases: '2', solar_support: 'Yes', app: 'iOS/Android' }
  },
  {
    id: 'seed-kit-home', name: 'Apolaki Home Solar Kit 5kW', category: 'kits',
    description: 'Complete residential kit: 12× Trina 450W panels, Huawei 5kW inverter, mounting, cabling.',
    price: 5999, inventory: 60, rating: 4.9, review_count: 48,
    manufacturer: 'Apolaki Solar',
    specs: { capacity: '5.4 kW', panels: '12', inverter: 'Huawei 5kW', includes: 'Mounting + Cables' }
  },
  {
    id: 'seed-kit-commercial', name: 'Apolaki Commercial Solar Kit 25kW', category: 'kits',
    description: 'Commercial-grade kit: 44× JinkoSolar 580W panels, SMA 25kW inverter, racking, monitoring.',
    price: 24500, inventory: 20, rating: 4.8, review_count: 22,
    manufacturer: 'Apolaki Solar',
    specs: { capacity: '25.52 kW', panels: '44', inverter: 'SMA Tripower 25kW', monitoring: 'Included' }
  },
]

export const useMarketplaceStore = defineStore('marketplace', () => {
  const products = ref([])
  const currentProduct = ref(null)
  const reviews = ref([])
  const wishlist = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchProducts = async (category = null, search = null) => {
    loading.value = true
    error.value = null
    try {
      let url = '/marketplace/products'
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category && category !== 'all') {
        if (!search) {
          url = `/marketplace/products/category/${category}`
        } else {
          params.set('category', category)
        }
      }
      const queryString = params.toString()
      const response = await api.get(queryString ? `${url}?${queryString}` : url)
      products.value = response.data.data || []
      // If API returned empty, use seed data as fallback
      if (products.value.length === 0) {
        products.value = filterSeedProducts(category, search)
      }
    } catch (err) {
      // API unreachable → use seed data so the marketplace always works
      console.warn('Marketplace API unavailable, using seed data:', err.message)
      products.value = filterSeedProducts(category, search)
      error.value = null // clear error — seed data is available
    } finally {
      loading.value = false
    }
  }

  /**
   * Filter seed products by category and/or search text.
   */
  function filterSeedProducts(category, search) {
    let filtered = [...SEED_PRODUCTS]
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.manufacturer || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    }
    return filtered
  }

  const fetchProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/marketplace/products/${id}`)
      currentProduct.value = response.data.data || response.data
      return currentProduct.value
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch product'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchReviews = async (productId) => {
    try {
      const response = await api.get(`/marketplace/products/${productId}/reviews`)
      reviews.value = response.data.data || []
      return reviews.value
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch reviews'
      return []
    }
  }

  const createReview = async (productId, { rating, title, comment }) => {
    try {
      const response = await api.post(`/marketplace/products/${productId}/reviews`, { rating, title, comment })
      const review = response.data.data || response.data
      reviews.value.unshift(review)
      return review
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create review'
      throw err
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/marketplace/wishlist')
      wishlist.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch wishlist'
    }
  }

  const addToWishlist = async (productId) => {
    try {
      await api.post(`/marketplace/wishlist/${productId}`)
      // Refresh wishlist
      await fetchWishlist()
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to add to wishlist'
      throw err
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/marketplace/wishlist/${productId}`)
      wishlist.value = wishlist.value.filter(i => i.id !== productId)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to remove from wishlist'
      throw err
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.value.some(item => item.id === productId)
  }

  return {
    products,
    currentProduct,
    reviews,
    wishlist,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    fetchReviews,
    createReview,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  }
})
