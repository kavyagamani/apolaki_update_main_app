/**
 * Google IAM Integration
 * Handles Google Cloud IAM operations for authorization and access control
 */

import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

const googleAuth = new GoogleAuth({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Get Google Cloud project ID
 */
async function getProjectId() {
  return process.env.GOOGLE_PROJECT_ID || await googleAuth.getProjectId();
}

/**
 * Verify Google OAuth token
 * @param {string} token - Google OAuth token
 * @returns {Promise<Object>} Token info
 */
export async function verifyGoogleToken(token) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to verify Google token: ${error.message}`);
  }
}

/**
 * Get Google user info
 * @param {string} token - Google OAuth token
 * @returns {Promise<Object>} User info
 */
export async function getGoogleUserInfo(token) {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get Google user info: ${error.message}`);
  }
}

/**
 * Grant IAM role to user
 * @param {string} projectId - Google Cloud project ID
 * @param {string} userId - User ID
 * @param {string} role - IAM role (e.g., 'roles/viewer', 'roles/editor')
 * @returns {Promise<void>}
 */
export async function grantIAMRole(projectId, userId, role) {
  try {
    const client = await googleAuth.getClient();
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`;

    const getResponse = await client.request({ url });
    const policy = getResponse.data;

    const binding = {
      role,
      members: [`user:${userId}@gmail.com`]
    };

    const existingBinding = policy.bindings.find(b => b.role === role);
    if (existingBinding) {
      if (!existingBinding.members.includes(`user:${userId}@gmail.com`)) {
        existingBinding.members.push(`user:${userId}@gmail.com`);
      }
    } else {
      policy.bindings.push(binding);
    }

    await client.request({
      url: `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`,
      method: 'POST',
      data: { policy }
    });

    console.log(`Granted ${role} to user ${userId}`);
  } catch (error) {
    throw new Error(`Failed to grant IAM role: ${error.message}`);
  }
}

/**
 * Revoke IAM role from user
 * @param {string} projectId - Google Cloud project ID
 * @param {string} userId - User ID
 * @param {string} role - IAM role
 * @returns {Promise<void>}
 */
export async function revokeIAMRole(projectId, userId, role) {
  try {
    const client = await googleAuth.getClient();
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`;

    const getResponse = await client.request({ url });
    const policy = getResponse.data;

    const binding = policy.bindings.find(b => b.role === role);
    if (binding) {
      binding.members = binding.members.filter(m => m !== `user:${userId}@gmail.com`);
      if (binding.members.length === 0) {
        policy.bindings = policy.bindings.filter(b => b.role !== role);
      }
    }

    await client.request({
      url: `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`,
      method: 'POST',
      data: { policy }
    });

    console.log(`Revoked ${role} from user ${userId}`);
  } catch (error) {
    throw new Error(`Failed to revoke IAM role: ${error.message}`);
  }
}

/**
 * Check user permissions
 * @param {string} projectId - Google Cloud project ID
 * @param {string} userId - User ID
 * @param {Array<string>} permissions - Permissions to check
 * @returns {Promise<Array<boolean>>} Permission check results
 */
export async function checkUserPermissions(projectId, userId, permissions) {
  try {
    const client = await googleAuth.getClient();
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:testIamPermissions`;

    const response = await client.request({
      url,
      method: 'POST',
      data: { permissions }
    });

    return permissions.map(perm => response.data.permissions?.includes(perm) || false);
  } catch (error) {
    throw new Error(`Failed to check permissions: ${error.message}`);
  }
}

export default {
  verifyGoogleToken,
  getGoogleUserInfo,
  grantIAMRole,
  revokeIAMRole,
  checkUserPermissions,
  getProjectId
};
