/**
 * API Routes for Apolaki Solar Platform
 * Uses Netlify Neon database with @netlify/neon
 */

import axios from 'axios';
import express from 'express';
import { authenticateToken } from './auth/middleware.js';
import {
    assessments,
    contracts,
    finance,
    maintenanceLog,
    marketplace,
    monitoringData,
    performanceData,
    solarInstallations,
    users
} from './db.js';

const router = express.Router();

// ============================================
// USER ROUTES
// ============================================

/**
 * POST /api/users
 * Create a new user
 */
router.post('/users', async (req, res) => {
  try {
    const { email, passwordHash, firstName, lastName, role } = req.body;

    if (!email || !passwordHash) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await users.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users
 * Get all users
 */
router.get('/users', async (req, res) => {
  try {
    const allUsers = await users.getAll();
    res.json({
      success: true,
      count: allUsers.length,
      data: allUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await users.getById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { firstName, lastName, role, active } = req.body;
    const user = await users.update(req.params.id, {
      firstName,
      lastName,
      role,
      active
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// SOLAR INSTALLATION ROUTES
// ============================================

/**
 * POST /api/installations
 * Create a new solar installation
 */
router.post('/installations', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      capacity,
      panelCount,
      inverterType
    } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Installation name is required'
      });
    }

    const installation = await solarInstallations.create({
      userId: req.user.id,
      name,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      capacity,
      panelCount,
      inverterType
    });

    res.status(201).json({
      success: true,
      message: 'Installation created successfully',
      data: installation
    });
  } catch (error) {
    console.error('Error creating installation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/installations
 * Get all installations (for authenticated user or all)
 */
router.get('/installations', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    let installations;
    // Admin/superadmin can see all; regular users see their own
    if ((req.user.role === 'admin' || req.user.role === 'superadmin') && !userId) {
      installations = await solarInstallations.getAll();
    } else {
      installations = await solarInstallations.getByUserId(userId || req.user.id);
    }
    res.json({
      success: true,
      count: installations.length,
      data: installations
    });
  } catch (error) {
    console.error('Error fetching installations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/installations/:id
 * Get installation by ID
 */
router.get('/installations/:id', async (req, res) => {
  try {
    const installation = await solarInstallations.getById(req.params.id);

    if (!installation) {
      return res.status(404).json({
        success: false,
        error: 'Installation not found'
      });
    }

    res.json({
      success: true,
      data: installation
    });
  } catch (error) {
    console.error('Error fetching installation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:userId/installations
 * Get all installations for a user
 */
router.get('/users/:userId/installations', async (req, res) => {
  try {
    const installations = await solarInstallations.getByUserId(req.params.userId);

    res.json({
      success: true,
      count: installations.length,
      data: installations
    });
  } catch (error) {
    console.error('Error fetching installations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/installations/:id
 * Update installation
 */
router.put('/installations/:id', async (req, res) => {
  try {
    const { name, status, capacity, panelCount } = req.body;
    const installation = await solarInstallations.update(req.params.id, {
      name,
      status,
      capacity,
      panelCount
    });

    if (!installation) {
      return res.status(404).json({
        success: false,
        error: 'Installation not found'
      });
    }

    res.json({
      success: true,
      message: 'Installation updated successfully',
      data: installation
    });
  } catch (error) {
    console.error('Error updating installation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/installations/:id
 * Delete installation
 */
router.delete('/installations/:id', async (req, res) => {
  try {
    const result = await solarInstallations.delete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Installation not found'
      });
    }

    res.json({
      success: true,
      message: 'Installation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting installation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// MONITORING DATA ROUTES
// ============================================

/**
 * POST /api/installations/:installationId/monitoring
 * Record monitoring data
 */
router.post('/installations/:installationId/monitoring', async (req, res) => {
  try {
    const {
      powerOutput,
      voltageAc,
      currentAc,
      frequency,
      temperature,
      efficiency,
      status,
      errorCode
    } = req.body;

    const data = await monitoringData.create({
      installationId: req.params.installationId,
      powerOutput,
      voltageAc,
      currentAc,
      frequency,
      temperature,
      efficiency,
      status,
      errorCode
    });

    res.status(201).json({
      success: true,
      message: 'Monitoring data recorded',
      data
    });
  } catch (error) {
    console.error('Error recording monitoring data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/installations/:installationId/monitoring
 * Get latest monitoring data
 */
router.get('/installations/:installationId/monitoring', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const data = await monitoringData.getLatest(req.params.installationId, limit);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// PERFORMANCE DATA ROUTES
// ============================================

/**
 * POST /api/installations/:installationId/performance
 * Record performance data
 */
router.post('/installations/:installationId/performance', async (req, res) => {
  try {
    const {
      date,
      energyGenerated,
      peakPower,
      avgEfficiency,
      downtimeMinutes
    } = req.body;

    const data = await performanceData.create({
      installationId: req.params.installationId,
      date,
      energyGenerated,
      peakPower,
      avgEfficiency,
      downtimeMinutes
    });

    res.status(201).json({
      success: true,
      message: 'Performance data recorded',
      data
    });
  } catch (error) {
    console.error('Error recording performance data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/installations/:installationId/performance
 * Get performance data for installation
 */
router.get('/installations/:installationId/performance', async (req, res) => {
  try {
    const limit = req.query.limit || 30;
    const data = await performanceData.getByInstallation(
      req.params.installationId,
      limit
    );

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// MAINTENANCE LOG ROUTES
// ============================================

/**
 * POST /api/installations/:installationId/maintenance
 * Create maintenance log entry
 */
router.post('/installations/:installationId/maintenance', async (req, res) => {
  try {
    const {
      maintenanceType,
      description,
      performedDate,
      cost,
      technician,
      notes
    } = req.body;

    const record = await maintenanceLog.create({
      installationId: req.params.installationId,
      maintenanceType,
      description,
      performedDate,
      cost,
      technician,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record created',
      data: record
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/installations/:installationId/maintenance
 * Get maintenance logs
 */
router.get('/installations/:installationId/maintenance', async (req, res) => {
  try {
    const logs = await maintenanceLog.getByInstallation(req.params.installationId);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// CONTRACT ROUTES  
// ============================================

/**
 * GET /api/contracts
 * Get contracts for the authenticated user (or all for admin)
 */
router.get('/contracts', authenticateToken, async (req, res) => {
  try {
    let userContracts;
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      userContracts = await contracts.getAll();
    } else {
      userContracts = await contracts.getByUserId(req.user.id);
    }

    res.json({
      success: true,
      count: userContracts.length,
      data: userContracts
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/contracts/:id
 * Get contract by ID
 */
router.get('/contracts/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await contracts.getById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Only allow owner or admin to view
    if (contract.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contracts
 * Create a contract
 */
router.post('/contracts', authenticateToken, async (req, res) => {
  try {
    const {
      contractType,
      title,
      provider,
      startDate,
      endDate,
      termMonths,
      amount,
      currency,
      metadata
    } = req.body;

    const contract = await contracts.create({
      userId: req.user.id,
      contractType,
      title,
      provider,
      startDate,
      endDate,
      termMonths,
      amount,
      currency,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: contract
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/contracts/:id
 * Update contract status
 */
router.put('/contracts/:id', authenticateToken, async (req, res) => {
  try {
    const { status, endDate, metadata } = req.body;
    const contract = await contracts.update(req.params.id, {
      status,
      endDate,
      metadata
    });

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    res.json({
      success: true,
      message: 'Contract updated successfully',
      data: contract
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/contracts/:id/sign
 * Sign a contract
 */
router.post('/contracts/:id/sign', authenticateToken, async (req, res) => {
  try {
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ success: false, error: 'Signature is required' });
    }

    const contract = await contracts.sign(req.params.id, {
      signedBy: req.user.id,
      signedByEmail: req.user.email,
      signature,
      timestamp: new Date().toISOString()
    });

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    res.json({
      success: true,
      message: 'Contract signed successfully',
      data: contract
    });
  } catch (error) {
    console.error('Error signing contract:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/users/:userId/contracts
 * Get user contracts
 */
router.get('/users/:userId/contracts', authenticateToken, async (req, res) => {
  try {
    const userContracts = await contracts.getByUserId(req.params.userId);

    res.json({
      success: true,
      count: userContracts.length,
      data: userContracts
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// SOLAR API ROUTES (Google Solar API + Fallbacks)
// ============================================

/**
 * POST /api/solar/lookup
 * Look up solar potential using Google Solar API (primary),
 * with cascading address resolution: address → zip code → city.
 * Falls back to NREL PVWatts or built-in estimates if Google is unavailable.
 */
router.post('/solar/lookup', authenticateToken, async (req, res) => {
  try {
    const { address, city, state, zipCode } = req.body;

    if (!address && !zipCode && !city) {
      return res.status(400).json({
        success: false,
        error: 'At least one of address, zipCode, or city is required'
      });
    }

    // Build location query: prefer full address > zip code > city
    const locationQuery = address
      ? `${address}, ${city || ''} ${state || ''} ${zipCode || ''}`.trim()
      : zipCode
        ? `${zipCode}, ${state || ''}`.trim()
        : `${city}, ${state || ''}`.trim();

    const googleApiKey = process.env.GOOGLE_SOLAR_API_KEY || process.env.GOOGLE_API_KEY;
    const nrelApiKey = process.env.NREL_API_KEY;

    let solarData = null;
    let provider = 'estimate';

    // ── Provider 1: Google Solar API ─────────────────────────────
    if (googleApiKey) {
      try {
        // Step 1: Geocode the address
        const geocodeRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: { address: locationQuery, key: googleApiKey },
          timeout: 8000
        });

        if (geocodeRes.data.results && geocodeRes.data.results.length > 0) {
          const location = geocodeRes.data.results[0].geometry.location;
          const formattedAddress = geocodeRes.data.results[0].formatted_address;

          // Step 2: Call Google Solar API - Building Insights
          const solarRes = await axios.get(
            'https://solar.googleapis.com/v1/buildingInsights:findClosest', {
              params: {
                'location.latitude': location.lat,
                'location.longitude': location.lng,
                requiredQuality: 'MEDIUM',
                key: googleApiKey
              },
              timeout: 10000
            }
          );

          const insights = solarRes.data;
          const bestConfig = insights.solarPotential?.solarPanelConfigs?.slice(-1)[0];
          const maxPanels = insights.solarPotential?.maxArrayPanelsCount || 0;
          const maxArea = insights.solarPotential?.maxArrayAreaMeters2 || 0;
          const annualSunshine = insights.solarPotential?.maxSunshineHoursPerYear || 0;
          const carbonOffset = insights.solarPotential?.carbonOffsetFactorKgPerMwh || 0;

          solarData = {
            provider: 'google_solar',
            formattedAddress,
            latitude: location.lat,
            longitude: location.lng,
            maxPanelCount: maxPanels,
            maxArrayAreaSqFt: parseFloat((maxArea * 10.764).toFixed(0)),
            maxSunshineHoursPerYear: parseFloat(annualSunshine.toFixed(0)),
            panelCapacityWatts: insights.solarPotential?.panelCapacityWatts || 400,
            panelHeightMeters: insights.solarPotential?.panelHeightMeters || 1.65,
            panelWidthMeters: insights.solarPotential?.panelWidthMeters || 0.99,
            roofSegments: (insights.solarPotential?.roofSegmentStats || []).map(seg => ({
              pitchDegrees: parseFloat((seg.pitchDegrees || 0).toFixed(1)),
              azimuthDegrees: parseFloat((seg.azimuthDegrees || 0).toFixed(1)),
              areaSqFt: parseFloat(((seg.stats?.areaMeters2 || 0) * 10.764).toFixed(0)),
              sunshineHours: parseFloat((seg.stats?.sunshineQuantiles?.[5] || 0).toFixed(0))
            })),
            bestConfig: bestConfig ? {
              panelsCount: bestConfig.panelsCount,
              yearlyEnergyDcKwh: parseFloat((bestConfig.yearlyEnergyDcKwh || 0).toFixed(0)),
              capacityKw: parseFloat(((bestConfig.panelsCount * (insights.solarPotential?.panelCapacityWatts || 400)) / 1000).toFixed(2))
            } : null,
            carbonOffsetFactorKgPerMwh: carbonOffset,
            imageryDate: insights.imageryDate || null,
            imageryQuality: insights.imageryQuality || null
          };
          provider = 'google_solar';
        }
      } catch (googleErr) {
        console.warn('Google Solar API error (falling back):', googleErr.response?.data?.error?.message || googleErr.message);
      }
    }

    // ── Provider 2: NREL PVWatts API (free, no credit card) ─────
    if (!solarData && nrelApiKey) {
      try {
        // Geocode first if we don't have coords
        let lat, lng;
        if (googleApiKey) {
          const geocodeRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: { address: locationQuery, key: googleApiKey },
            timeout: 8000
          });
          if (geocodeRes.data.results?.[0]) {
            lat = geocodeRes.data.results[0].geometry.location.lat;
            lng = geocodeRes.data.results[0].geometry.location.lng;
          }
        }

        // Fallback: use Nominatim (OpenStreetMap) free geocoder if no Google key
        if (!lat || !lng) {
          try {
            const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
              params: { q: locationQuery, format: 'json', limit: 1 },
              headers: { 'User-Agent': 'ApolakiSolarPlatform/1.0' },
              timeout: 8000
            });
            if (nominatimRes.data?.[0]) {
              lat = parseFloat(nominatimRes.data[0].lat);
              lng = parseFloat(nominatimRes.data[0].lon);
            }
          } catch (nomErr) {
            console.warn('Nominatim geocoding failed for NREL:', nomErr.message);
          }
        }

        const pvWattsParams = {
          api_key: nrelApiKey,
          system_capacity: 5, // 5kW reference
          module_type: 1,     // premium
          losses: 14,
          array_type: 1,      // fixed roof mount
          tilt: 20,
          azimuth: 180
        };

        if (lat && lng) {
          pvWattsParams.lat = lat;
          pvWattsParams.lon = lng;
        } else {
          pvWattsParams.address = locationQuery;
        }

        const pvRes = await axios.get('https://developer.nrel.gov/api/pvwatts/v8.json', {
          params: pvWattsParams,
          timeout: 10000
        });

        const pvData = pvRes.data.outputs;
        if (pvData) {
          const monthKeys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
          solarData = {
            provider: 'nrel_pvwatts',
            formattedAddress: pvRes.data.station_info?.city
              ? `${pvRes.data.station_info.city}, ${pvRes.data.station_info.state}`
              : locationQuery,
            latitude: pvRes.data.station_info?.lat || lat,
            longitude: pvRes.data.station_info?.lon || lng,
            maxSunshineHoursPerYear: parseFloat(((pvData.solrad_annual || 0) * 365).toFixed(0)),
            estimatedPeakSunHoursPerDay: parseFloat((pvData.solrad_annual || 0).toFixed(2)),
            referenceSystemKw: 5,
            annualProductionKwh: parseFloat((pvData.ac_annual || 0).toFixed(0)),
            monthlyProductionKwh: (pvData.ac_monthly || []).map(v => parseFloat((v || 0).toFixed(0))),
            capacityFactor: parseFloat((pvData.capacity_factor || 0).toFixed(1)),
            solarRadiationAnnual: parseFloat((pvData.solrad_annual || 0).toFixed(2)),
            solarRadiationMonthly: (pvData.solrad_monthly || []).map(v => parseFloat((v || 0).toFixed(2))),
            monthLabels: monthKeys,
            note: `Data from NREL PVWatts v8. Station: ${pvRes.data.station_info?.city || 'N/A'}, ${pvRes.data.station_info?.state || 'N/A'} (${pvRes.data.station_info?.distance ? pvRes.data.station_info.distance + ' km away' : 'nearest TMY station'}).`
          };
          provider = 'nrel_pvwatts';
        }
      } catch (nrelErr) {
        console.warn('NREL PVWatts API error (falling back):', nrelErr.message);
      }
    }

    // ── Provider 3: NASA POWER API (free, no API key needed) ────
    if (!solarData) {
      try {
        // Geocode via a free service or use coordinates from state lookup
        let lat, lng;

        // Try Google geocoding if key available
        if (googleApiKey) {
          try {
            const geocodeRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
              params: { address: locationQuery, key: googleApiKey },
              timeout: 8000
            });
            if (geocodeRes.data.results?.[0]) {
              lat = geocodeRes.data.results[0].geometry.location.lat;
              lng = geocodeRes.data.results[0].geometry.location.lng;
            }
          } catch (geoErr) {
            console.warn('Geocoding failed for NASA provider:', geoErr.message);
          }
        }

        // Fallback: use Nominatim (OpenStreetMap) free geocoder if no Google key
        if (!lat || !lng) {
          try {
            const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
              params: {
                q: locationQuery,
                format: 'json',
                limit: 1
              },
              headers: { 'User-Agent': 'ApolakiSolarPlatform/1.0' },
              timeout: 8000
            });
            if (nominatimRes.data?.[0]) {
              lat = parseFloat(nominatimRes.data[0].lat);
              lng = parseFloat(nominatimRes.data[0].lon);
            }
          } catch (nomErr) {
            console.warn('Nominatim geocoding failed:', nomErr.message);
          }
        }

        if (lat && lng) {
          // NASA POWER Climatology API — All Sky Surface Shortwave Downward Irradiance
          // Free, no API key required: https://power.larc.nasa.gov/docs/
          const nasaRes = await axios.get(
            'https://power.larc.nasa.gov/api/temporal/climatology/point', {
              params: {
                parameters: 'ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,T2M',
                community: 'RE',
                longitude: lng.toFixed(4),
                latitude: lat.toFixed(4),
                format: 'JSON'
              },
              timeout: 15000
            }
          );

          const nasaParams = nasaRes.data?.properties?.parameter;
          if (nasaParams) {
            const irradiance = nasaParams.ALLSKY_SFC_SW_DWN || {};
            const clearSky = nasaParams.CLRSKY_SFC_SW_DWN || {};
            const temp = nasaParams.T2M || {};

            const annualIrradiance = irradiance.ANN || 0;
            const annualClearSky = clearSky.ANN || 0;
            const annualTemp = temp.ANN || 0;

            // Monthly data extraction
            const monthKeys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthlyIrradiance = monthKeys.map(m => parseFloat((irradiance[m] || 0).toFixed(2)));
            const monthlyClearSky = monthKeys.map(m => parseFloat((clearSky[m] || 0).toFixed(2)));
            const monthlyTemp = monthKeys.map(m => parseFloat((temp[m] || 0).toFixed(1)));

            // Calculate solar production estimates
            // Using: Production = Irradiance (kWh/m²/day) * 365 * SystemSize(kW) * PerformanceRatio
            const peakSunHoursPerDay = annualIrradiance; // kWh/m²/day = peak sun hours
            const annualSunshineHours = parseFloat((peakSunHoursPerDay * 365).toFixed(0));
            const referenceSystemKw = 5;
            const performanceRatio = 0.80; // accounts for inverter, wiring, temperature losses
            const annualProductionKwh = parseFloat((peakSunHoursPerDay * 365 * referenceSystemKw * performanceRatio).toFixed(0));
            const capacityFactor = parseFloat(((annualProductionKwh / (referenceSystemKw * 8760)) * 100).toFixed(1));

            // Monthly production estimate (for a 5kW system)
            const monthlyProductionKwh = monthlyIrradiance.map((irr, i) => {
              const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i];
              return parseFloat((irr * daysInMonth * referenceSystemKw * performanceRatio).toFixed(0));
            });

            // Temperature derating: panels lose ~0.4% efficiency per °C above 25°C
            const tempDeratingFactor = annualTemp > 25
              ? parseFloat((1 - (annualTemp - 25) * 0.004).toFixed(3))
              : 1.0;

            solarData = {
              provider: 'nasa_power',
              formattedAddress: locationQuery,
              latitude: lat,
              longitude: lng,
              maxSunshineHoursPerYear: annualSunshineHours,
              estimatedPeakSunHoursPerDay: parseFloat(peakSunHoursPerDay.toFixed(2)),
              referenceSystemKw,
              annualProductionKwh,
              monthlyProductionKwh,
              capacityFactor,
              solarRadiationAnnual: parseFloat(annualIrradiance.toFixed(2)),
              solarRadiationMonthly: monthlyIrradiance,
              clearSkyRadiationAnnual: parseFloat(annualClearSky.toFixed(2)),
              clearSkyRadiationMonthly: monthlyClearSky,
              avgTemperatureC: parseFloat(annualTemp.toFixed(1)),
              monthlyTemperatureC: monthlyTemp,
              tempDeratingFactor,
              tempAdjustedProductionKwh: parseFloat((annualProductionKwh * tempDeratingFactor).toFixed(0)),
              monthLabels: monthKeys,
              note: 'Data from NASA POWER (Prediction of Worldwide Energy Resources). Irradiance values are long-term climatological averages (22+ years of satellite data).'
            };
            provider = 'nasa_power';
          }
        }
      } catch (nasaErr) {
        console.warn('NASA POWER API error (falling back to built-in):', nasaErr.message);
      }
    }

    // ── Provider 4: Built-in estimate (no API key needed) ───────
    if (!solarData) {
      // Regional averages for major countries/US states (peak sun hours per year)
      const sunHoursByRegion = {
        // US States
        'AZ': 2400, 'NM': 2350, 'NV': 2300, 'CA': 2200, 'TX': 2100, 'FL': 2000,
        'CO': 2050, 'UT': 2100, 'HI': 2100, 'OR': 1600, 'WA': 1500, 'NY': 1700,
        'MA': 1650, 'PA': 1700, 'OH': 1600, 'IL': 1700, 'MI': 1550, 'MN': 1650,
        'GA': 1950, 'NC': 1850, 'SC': 1900, 'VA': 1800, 'MD': 1750, 'NJ': 1700,
        'CT': 1650, 'AL': 1950, 'LA': 1900, 'MS': 1950, 'TN': 1800, 'KY': 1700,
        'IN': 1650, 'WI': 1600, 'IA': 1700, 'MO': 1750, 'AR': 1850, 'OK': 2000,
        'KS': 1950, 'NE': 1850, 'SD': 1850, 'ND': 1750, 'MT': 1750, 'WY': 1900,
        'ID': 1800, 'AK': 1200, 'VT': 1550, 'NH': 1600, 'ME': 1550, 'RI': 1650,
        'DE': 1750, 'WV': 1650, 'DC': 1750,
        // Philippines (primary target market)
        'PH': 1900, 'PHILIPPINES': 1900, 'MANILA': 1850, 'CEBU': 1950, 'DAVAO': 1900,
        // Other countries
        'AU': 2100, 'IN': 1900, 'JP': 1500, 'DE': 1100, 'UK': 1000, 'FR': 1400,
        'IT': 1700, 'ES': 1900, 'BR': 1800, 'MX': 2000, 'SA': 2400, 'AE': 2300
      };
      const defaultSunHours = 1800;
      const stateUpper = (state || '').toUpperCase().trim();
      const sunHours = sunHoursByRegion[stateUpper] || defaultSunHours;

      solarData = {
        provider: 'built_in_estimate',
        formattedAddress: locationQuery,
        latitude: null,
        longitude: null,
        maxSunshineHoursPerYear: sunHours,
        estimatedPeakSunHoursPerDay: parseFloat((sunHours / 365).toFixed(1)),
        note: 'Estimate based on US regional averages. For precise data, configure GOOGLE_SOLAR_API_KEY or NREL_API_KEY.'
      };
      provider = 'built_in_estimate';
    }

    res.json({
      success: true,
      provider,
      data: solarData,
      availableProviders: {
        google_solar: !!googleApiKey,
        nrel_pvwatts: !!nrelApiKey,
        nasa_power: true,
        built_in_estimate: true
      }
    });
  } catch (error) {
    console.error('Solar lookup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ASSESSMENT ROUTES
// ============================================

/**
 * GET /api/assessments
 * Get assessments for authenticated user
 */
router.get('/assessments', authenticateToken, async (req, res) => {
  try {
    const userAssessments = await assessments.getByUserId(req.user.id);
    res.json({
      success: true,
      count: userAssessments.length,
      data: userAssessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/assessments/calculate
 * Calculate solar assessment with ROI
 */
router.post('/assessments/calculate', authenticateToken, async (req, res) => {
  try {
    const {
      address,
      city,
      state,
      zipCode,
      roofCondition,
      roofArea,
      annualUsage,
      sunExposure,
      obstructionLevel,
      financingOption
    } = req.body;

    if (!roofArea || !annualUsage) {
      return res.status(400).json({ success: false, error: 'Roof area and annual usage are required' });
    }

    // ── Optionally fetch NASA irradiance for this location ────
    let nasaIrradiance = null;
    let nasaTemp = null;
    try {
      // Try to geocode the location for NASA data
      let lat, lng;
      const locationQuery = address
        ? `${address}, ${city || ''} ${state || ''} ${zipCode || ''}`.trim()
        : zipCode
          ? `${zipCode}, ${state || ''}`.trim()
          : `${city}, ${state || ''}`.trim();

      // Use Nominatim (free) for geocoding
      const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: locationQuery, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'ApolakiSolarPlatform/1.0' },
        timeout: 5000
      });
      if (nominatimRes.data?.[0]) {
        lat = parseFloat(nominatimRes.data[0].lat);
        lng = parseFloat(nominatimRes.data[0].lon);
      }

      if (lat && lng) {
        const nasaRes = await axios.get(
          'https://power.larc.nasa.gov/api/temporal/climatology/point', {
            params: {
              parameters: 'ALLSKY_SFC_SW_DWN,T2M',
              community: 'RE',
              longitude: lng.toFixed(4),
              latitude: lat.toFixed(4),
              format: 'JSON'
            },
            timeout: 10000
          }
        );
        const params = nasaRes.data?.properties?.parameter;
        if (params) {
          nasaIrradiance = params.ALLSKY_SFC_SW_DWN?.ANN || null; // kWh/m²/day
          nasaTemp = params.T2M?.ANN || null; // °C
        }
      }
    } catch (nasaCalcErr) {
      console.warn('NASA data unavailable for assessment calc, using defaults:', nasaCalcErr.message);
    }

    // ── Solar Calculation Engine ──────────────────────────────
    const sunMultiplier = { high: 1.0, medium: 0.8, low: 0.6 }[sunExposure] || 0.8;
    const obstructionMultiplier = { none: 1.0, minimal: 0.9, moderate: 0.75 }[obstructionLevel] || 0.9;
    const roofMultiplier = { excellent: 1.0, good: 0.95, fair: 0.85, poor: 0.7 }[roofCondition] || 0.9;

    // Temperature derating: panels lose ~0.4% per °C above 25°C (STC)
    const tempDeratingFactor = nasaTemp && nasaTemp > 25
      ? Math.max(0.8, 1 - (nasaTemp - 25) * 0.004)
      : 1.0;

    // Available roof for panels (rough: 70% usable, 17.5 sqft per panel, 400W each)
    const usableRoof = roofArea * 0.7 * obstructionMultiplier;
    const panelCount = Math.floor(usableRoof / 17.5);
    const recommendedCapacity = parseFloat((panelCount * 0.4).toFixed(2)); // kW

    // Use NASA irradiance (kWh/m²/day) if available, else estimate from sun exposure
    // Annual production = capacity * peak_sun_hours_per_day * 365 * performance_ratio
    let annualProduction;
    if (nasaIrradiance) {
      // NASA-backed accurate calculation
      const peakSunHours = nasaIrradiance; // kWh/m²/day ≈ peak sun hours
      const performanceRatio = 0.80 * sunMultiplier * roofMultiplier * tempDeratingFactor;
      annualProduction = recommendedCapacity * peakSunHours * 365 * performanceRatio;
    } else {
      // Fallback estimate
      annualProduction = recommendedCapacity * 1400 * sunMultiplier * roofMultiplier;
    }

    const costPerWatt = 2.75;
    const estimatedCost = parseFloat((recommendedCapacity * 1000 * costPerWatt).toFixed(2));
    const federalTaxCredit = parseFloat((estimatedCost * 0.30).toFixed(2)); // 30% ITC
    const stateTaxCredit = parseFloat((estimatedCost * 0.05).toFixed(2));
    const netCost = estimatedCost - federalTaxCredit - stateTaxCredit;

    const utilityRate = 0.14; // $/kWh average
    const annualSavings = parseFloat((annualProduction * utilityRate).toFixed(2));
    const paybackYears = parseFloat((netCost / annualSavings).toFixed(1));
    const twentyYearSavings = parseFloat((annualSavings * 20 - netCost).toFixed(2));
    const roi = parseFloat(((twentyYearSavings / netCost) * 100).toFixed(1));

    const carbonOffsetTons = parseFloat((annualProduction * 0.000417 * 20).toFixed(1)); // EPA factor

    const savingsEstimate = {
      annualProduction: parseFloat(annualProduction.toFixed(0)),
      annualSavings,
      paybackYears,
      twentyYearSavings,
      roi,
      federalTaxCredit,
      stateTaxCredit,
      netCost: parseFloat(netCost.toFixed(2)),
      carbonOffsetTons,
      panelCount,
      financingOption: financingOption || 'cash',
      dataSource: nasaIrradiance ? 'nasa_power' : 'estimate',
      nasaIrradianceKwhM2Day: nasaIrradiance || null,
      avgTemperatureC: nasaTemp || null,
      tempDeratingFactor: parseFloat(tempDeratingFactor.toFixed(3)),
      recommendedCapacity
    };

    // Financing details
    if (financingOption === 'loan') {
      const loanAmount = netCost;
      const interestRate = 0.065;
      const termMonths = 120;
      const monthlyRate = interestRate / 12;
      const monthlyPayment = parseFloat(
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)).toFixed(2)
      );
      savingsEstimate.financing = { loanAmount: parseFloat(loanAmount.toFixed(2)), monthlyPayment, interestRate: interestRate * 100, termMonths };
    } else if (financingOption === 'lease') {
      savingsEstimate.financing = { monthlyLease: parseFloat((estimatedCost / 240).toFixed(2)), termMonths: 240 };
    }

    // Save to database
    const assessment = await assessments.create({
      userId: req.user.id,
      address: address || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      roofCondition: roofCondition || 'good',
      roofArea,
      annualUsage,
      sunExposure: sunExposure || 'medium',
      obstructionLevel: obstructionLevel || 'minimal',
      recommendedCapacity,
      estimatedCost,
      savingsEstimate
    });

    res.status(201).json({
      success: true,
      data: {
        ...assessment,
        calculation: savingsEstimate
      }
    });
  } catch (error) {
    console.error('Error calculating assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/assessments
 * Create an assessment (legacy)
 */
router.post('/assessments', authenticateToken, async (req, res) => {
  try {
    const {
      address,
      city,
      state,
      zipCode,
      roofCondition,
      roofArea,
      annualUsage,
      sunExposure,
      obstructionLevel,
      recommendedCapacity,
      estimatedCost,
      savingsEstimate
    } = req.body;

    const assessment = await assessments.create({
      userId: req.user.id,
      address,
      city,
      state,
      zipCode,
      roofCondition,
      roofArea,
      annualUsage,
      sunExposure,
      obstructionLevel,
      recommendedCapacity,
      estimatedCost,
      savingsEstimate
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/assessments/:id
 * Get assessment by ID
 */
router.get('/assessments/:id', async (req, res) => {
  try {
    const assessment = await assessments.getById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:userId/assessments
 * Get user assessments
 */
router.get('/users/:userId/assessments', async (req, res) => {
  try {
    const userAssessments = await assessments.getByUserId(req.params.userId);

    res.json({
      success: true,
      count: userAssessments.length,
      data: userAssessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// MARKETPLACE ROUTES
// ============================================

/**
 * GET /api/marketplace/products
 * Get all marketplace products (with optional search)
 */
router.get('/marketplace/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    let products;
    if (search) {
      products = await marketplace.search(search, category);
    } else {
      products = await marketplace.getAll();
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketplace/products/:id
 * Get product by ID
 */
router.get('/marketplace/products/:id', async (req, res) => {
  try {
    const product = await marketplace.getById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketplace/products/category/:category
 * Get products by category
 */
router.get('/marketplace/products/category/:category', async (req, res) => {
  try {
    const products = await marketplace.getByCategory(req.params.category);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketplace/products/:id/reviews
 * Get reviews for a product
 */
router.get('/marketplace/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await marketplace.getReviews(req.params.id);
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/marketplace/products/:id/reviews
 * Create a review for a product
 */
router.post('/marketplace/products/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const review = await marketplace.createReview({
      productId: req.params.id,
      userId: req.user.id,
      rating,
      title,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/marketplace/wishlist
 * Get user's wishlist
 */
router.get('/marketplace/wishlist', authenticateToken, async (req, res) => {
  try {
    const items = await marketplace.getWishlist(req.user.id);
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/marketplace/wishlist/:productId
 * Add product to wishlist
 */
router.post('/marketplace/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const item = await marketplace.addToWishlist(req.user.id, req.params.productId);
    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: item
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/marketplace/wishlist/:productId
 * Remove product from wishlist
 */
router.delete('/marketplace/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    await marketplace.removeFromWishlist(req.user.id, req.params.productId);
    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FINANCE ROUTES
// ============================================

/**
 * POST /api/finance/transactions
 * Create financial transaction (authenticated)
 */
router.post('/finance/transactions', authenticateToken, async (req, res) => {
  try {
    const {
      transactionId,
      amount,
      currency,
      type,
      category,
      transactionDate,
      description,
      metadata
    } = req.body;

    const transaction = await finance.create({
      userId: req.user.id,
      transactionId: transactionId || `txn-${Date.now()}`,
      amount,
      currency,
      type,
      category,
      transactionDate: transactionDate || new Date().toISOString(),
      description,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finance/transactions
 * Get authenticated user's transactions
 */
router.get('/finance/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await finance.getByUserId(req.user.id);
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/finance/summary
 * Get authenticated user's finance summary
 */
router.get('/finance/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await finance.getSummary(req.user.id);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/users/:userId/finance/transactions
 * Get user transactions (legacy, keep for backward compat)
 */
router.get('/users/:userId/finance/transactions', async (req, res) => {
  try {
    const transactions = await finance.getByUserId(req.params.userId);

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 */
router.get('/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await users.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profilePictureUrl: user.profile_picture_url,
        role: user.role,
        active: user.active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/users/profile
 * Update authenticated user's profile
 */
router.put('/users/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await users.update(req.user.id, { firstName, lastName });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'apolaki-netlify-db-service',
    timestamp: new Date().toISOString()
  });
});

export default router;
