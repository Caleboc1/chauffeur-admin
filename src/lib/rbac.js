import { ADMIN_ROLES } from '@/utils/constants';

/**
 * Role-Permission mapping based on PRD Section 11 and AGENTS.md Section 4.
 */
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: ['*'], // Unrestricted
  
  [ADMIN_ROLES.OPS_ADMIN]: [
    'dashboard',
    'drivers',
    'applications',
    'inspections',
    'rides',
    'vehicles',
    'riders:read',
    'notifications',
    'vip',
    'discounts',
    'content',
    'sos'
  ],
  
  [ADMIN_ROLES.FINANCE_ADMIN]: [
    'dashboard',
    'earnings',
    'accounting',
    'discounts',
    'riders:wallet',
    'sos'
  ],
  
  [ADMIN_ROLES.SUPPORT_AGENT]: [
    'dashboard',
    'complaints',
    'riders:read',
    'rides:read',
    'sos'
  ],
  
  [ADMIN_ROLES.INSPECTION_OFFICER]: [
    'inspections',
    'sos'
  ]
};

/**
 * Checks if a given role has access to a module or specific permission.
 */
export function canAccess(role, permission) {
  if (!role) return false;
  
  const perms = ROLE_PERMISSIONS[role] || [];
  
  // Super admin bypass
  if (perms.includes('*')) return true;
  
  return perms.includes(permission);
}
