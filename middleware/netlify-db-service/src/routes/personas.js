/**
 * Persona-Based Routes
 * Role-specific endpoints for each platform persona:
 *   - User (customer/prosumer)
 *   - Dealer (installer/reseller)
 *   - Operations (field ops/maintenance)
 *   - Admin (organization admin)
 *   - Super Admin (break-glass emergency)
 */

import expressModule from 'express';
import { authenticateToken, authorizeRole } from '../auth/middleware.js';
import { auditLogs, breakGlassSessions, ensureInitialized, maintenanceLog, solarInstallations, users } from '../db.js';

// Handle CJS/ESM interop for bundled environments (Netlify esbuild)
const express = expressModule.default || expressModule;

const router = express.Router();

// ─── Constants ──────────────────────────────────────────────────────────
const VALID_ROLES = ['customer', 'dealer', 'operations', 'admin', 'superadmin', 'installer'];
const BREAK_GLASS_DURATION_MINUTES = 60;

// ─── Helper ─────────────────────────────────────────────────────────────
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
}

// ============================================================================
// ROLE INFO (public, requires auth)
// ============================================================================

/**
 * GET /api/personas/me
 * Returns the current user's persona / role info
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const role = user.role || 'customer';

    const permissions = getPermissionsForRole(role);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role,
        permissions,
        fullName: [user.first_name, user.last_name].filter(Boolean).join(' '),
      },
    });
  } catch (error) {
    console.error('Error getting persona info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/personas/roles
 * Returns list of valid roles (admin+ only)
 */
router.get('/roles', authenticateToken, authorizeRole('admin', 'superadmin'), (req, res) => {
  res.json({
    success: true,
    data: VALID_ROLES.map(r => ({
      role: r,
      permissions: getPermissionsForRole(r),
    })),
  });
});

// ============================================================================
// DEALER ROUTES
// ============================================================================

/**
 * GET /api/personas/dealer/installations
 * Dealer sees all installations they commissioned
 */
router.get('/dealer/installations', authenticateToken, authorizeRole('dealer', 'installer', 'admin', 'superadmin'), async (req, res) => {
  try {
    const installations = await solarInstallations.getByUserId(req.user.id);
    res.json({ success: true, count: installations.length, data: installations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/personas/dealer/commission
 * Dealer commissions a new installation (creates installation + logs audit)
 */
router.post('/dealer/commission', authenticateToken, authorizeRole('dealer', 'installer', 'admin', 'superadmin'), async (req, res) => {
  try {
    const { ownerId, name, address, city, state, zipCode, latitude, longitude, capacity, panelCount, inverterType } = req.body;

    if (!ownerId || !name) {
      return res.status(400).json({ success: false, error: 'ownerId and name are required' });
    }

    const installation = await solarInstallations.create({
      userId: ownerId,
      name,
      address: address || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      latitude: latitude || 0,
      longitude: longitude || 0,
      capacity: capacity || 0,
      panelCount: panelCount || 0,
      inverterType: inverterType || '',
    });

    await auditLogs.create({
      userId: req.user.id,
      action: 'DEALER_COMMISSION',
      resourceType: 'installation',
      resourceId: installation.id,
      changes: { ownerId, dealerId: req.user.id },
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'Installation commissioned successfully',
      data: installation,
    });
  } catch (error) {
    console.error('Commission error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// OPERATIONS ROUTES
// ============================================================================

/**
 * GET /api/personas/operations/alerts
 * Operations sees recent maintenance items (simulated alerts)
 */
router.get('/operations/alerts', authenticateToken, authorizeRole('operations', 'admin', 'superadmin'), async (req, res) => {
  try {
    // Return all pending/scheduled maintenance as "alerts"
    const sqlInstance = ensureInitialized();
    // We don't have a direct getAll on maintenanceLog, so query via sql tagged template
    // Use the getByInstallation with a broad query - but let's just get all pending
    const alerts = await sqlInstance`
      SELECT m.*, si.name as installation_name
      FROM maintenance_log m
      JOIN solar_installations si ON m.installation_id = si.id
      WHERE m.status IN ('scheduled', 'in_progress')
      ORDER BY m.performed_date ASC
    `;

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('Operations alerts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/personas/operations/resolve/:maintenanceId
 * Operations resolves a maintenance/alert item
 */
router.put('/operations/resolve/:maintenanceId', authenticateToken, authorizeRole('operations', 'admin', 'superadmin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const updated = await maintenanceLog.update(req.params.maintenanceId, {
      status: 'completed',
      completedDate: new Date().toISOString(),
      notes: notes || 'Resolved by operations',
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Maintenance record not found' });
    }

    await auditLogs.create({
      userId: req.user.id,
      action: 'OPERATIONS_RESOLVE',
      resourceType: 'maintenance',
      resourceId: req.params.maintenanceId,
      changes: { status: 'completed', notes },
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({ success: true, message: 'Maintenance item resolved', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * GET /api/personas/admin/users
 * Admin lists all users with role info
 */
router.get('/admin/users', authenticateToken, authorizeRole('admin', 'superadmin'), async (req, res) => {
  try {
    const allUsers = await users.getAll();
    res.json({
      success: true,
      count: allUsers.length,
      data: allUsers.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        fullName: [u.first_name, u.last_name].filter(Boolean).join(' '),
        active: u.active,
        createdAt: u.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/personas/admin/users/:userId/role
 * Admin assigns a role to a user
 */
router.put('/admin/users/:userId/role', authenticateToken, authorizeRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}` });
    }

    // Only superadmin can assign superadmin role
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Only superadmin can assign superadmin role' });
    }

    const sqlInstance = ensureInitialized();
    const result = await sqlInstance`
      UPDATE users SET role = ${role}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.params.userId}
      RETURNING id, email, role
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await auditLogs.create({
      userId: req.user.id,
      action: 'ADMIN_ROLE_CHANGE',
      resourceType: 'user',
      resourceId: req.params.userId,
      changes: { newRole: role },
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({ success: true, message: 'User role updated', data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/personas/admin/audit-logs
 * Admin views audit logs
 */
router.get('/admin/audit-logs', authenticateToken, authorizeRole('admin', 'superadmin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200;
    const logs = await auditLogs.getAll(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SUPER ADMIN (BREAK-GLASS) ROUTES
// ============================================================================

/**
 * POST /api/personas/superadmin/break-glass
 * Super admin initiates a break-glass emergency session
 * Requires: justification
 */
router.post('/superadmin/break-glass', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const { justification } = req.body;
    if (!justification || justification.length < 10) {
      return res.status(400).json({ success: false, error: 'Justification is required (min 10 characters)' });
    }

    // Check for already active session
    const active = await breakGlassSessions.getActiveByUserId(req.user.id);
    if (active) {
      return res.status(409).json({
        success: false,
        error: 'An active break-glass session already exists',
        data: { sessionId: active.id, expiresAt: active.expires_at },
      });
    }

    const expiresAt = new Date(Date.now() + BREAK_GLASS_DURATION_MINUTES * 60 * 1000);

    const session = await breakGlassSessions.create({
      userId: req.user.id,
      justification,
      expiresAt: expiresAt.toISOString(),
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
    });

    await auditLogs.create({
      userId: req.user.id,
      action: 'BREAK_GLASS_ACTIVATED',
      resourceType: 'break_glass_session',
      resourceId: session.id,
      changes: { justification },
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'Break-glass session activated',
      data: {
        sessionId: session.id,
        expiresAt: session.expires_at,
        durationMinutes: BREAK_GLASS_DURATION_MINUTES,
      },
    });
  } catch (error) {
    console.error('Break-glass error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/personas/superadmin/break-glass/:sessionId/action
 * Record an action taken during a break-glass session
 */
router.post('/superadmin/break-glass/:sessionId/action', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const { action, details } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, error: 'action is required' });
    }

    const record = {
      action,
      details: details || '',
      timestamp: new Date().toISOString(),
      performedBy: req.user.id,
    };

    const updated = await breakGlassSessions.recordAction(req.params.sessionId, record);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Active session not found' });
    }

    await auditLogs.create({
      userId: req.user.id,
      action: 'BREAK_GLASS_ACTION',
      resourceType: 'break_glass_session',
      resourceId: req.params.sessionId,
      changes: record,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({ success: true, message: 'Action recorded', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/personas/superadmin/break-glass/:sessionId/end
 * End a break-glass session
 */
router.post('/superadmin/break-glass/:sessionId/end', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const ended = await breakGlassSessions.end(req.params.sessionId);
    if (!ended) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    await auditLogs.create({
      userId: req.user.id,
      action: 'BREAK_GLASS_ENDED',
      resourceType: 'break_glass_session',
      resourceId: req.params.sessionId,
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({ success: true, message: 'Break-glass session ended', data: ended });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/personas/superadmin/break-glass
 * List all break-glass sessions (audit trail)
 */
router.get('/superadmin/break-glass', authenticateToken, authorizeRole('superadmin', 'admin'), async (req, res) => {
  try {
    const sessions = await breakGlassSessions.getAll();
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PERMISSION HELPER
// ============================================================================

function getPermissionsForRole(role) {
  const permissions = {
    customer: [
      'view:dashboard',
      'view:installations',
      'view:monitoring',
      'view:marketplace',
      'create:assessment',
      'view:contracts',
      'view:finance',
      'trade:energy',
    ],
    dealer: [
      'view:dashboard',
      'view:installations',
      'create:installation',
      'commission:installation',
      'view:contracts',
      'create:contract',
      'view:quotes',
      'create:quote',
    ],
    installer: [ // legacy alias for dealer
      'view:dashboard',
      'view:installations',
      'create:installation',
      'commission:installation',
      'view:contracts',
      'create:contract',
    ],
    operations: [
      'view:dashboard',
      'view:installations',
      'view:monitoring',
      'view:alerts',
      'resolve:alerts',
      'create:maintenance',
      'update:maintenance',
      'dispatch:crew',
    ],
    admin: [
      'view:dashboard',
      'view:installations',
      'view:monitoring',
      'view:marketplace',
      'manage:users',
      'assign:roles',
      'view:audit-logs',
      'view:billing',
      'manage:org-settings',
    ],
    superadmin: [
      'all', // superadmin has all permissions
      'break-glass:activate',
      'break-glass:action',
      'break-glass:end',
      'manage:superadmins',
    ],
  };

  return permissions[role] || permissions.customer;
}

export default router;
