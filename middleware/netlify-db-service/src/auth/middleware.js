/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

import { users } from '../db.js';
import { extractTokenFromHeader, verifyToken } from './jwt.js';

/**
 * Middleware to verify JWT token
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyToken(token);
    const user = await users.getById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        error: 'User account is inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Attach user to request
    req.user = user;
    req.decoded = decoded;

    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: error.message,
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Middleware to check user role
 */
export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        actual: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to verify ownership
 */
export function verifyOwnership(resourceField = 'id') {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceField];
      const userId = req.user.id;

      // For users, verify they're accessing their own profile
      if (resourceField === 'userId' || req.path.includes('/users/')) {
        if (resourceId !== userId && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'Forbidden: Cannot access other user\'s data',
            code: 'FORBIDDEN_ACCESS'
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ownership verification failed',
        message: error.message
      });
    }
  };
}

/**
 * Middleware for error handling
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}

/**
 * Middleware for request validation
 */
export function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }
  };
}

export default {
  authenticateToken,
  authorizeRole,
  verifyOwnership,
  errorHandler,
  validateRequest
};
