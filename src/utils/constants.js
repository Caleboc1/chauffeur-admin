export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPS_ADMIN: 'ops_admin',
  FINANCE_ADMIN: 'finance_admin',
  SUPPORT_AGENT: 'support_agent',
  INSPECTION_OFFICER: 'inspection_officer'
};

export const DRIVER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  UNDER_REVIEW: 'under_review'
};

export const APPLICATION_STATES = {
  NEW: 'new',
  UNDER_REVIEW: 'under_review',
  CORRECTION_REQUESTED: 'correction_requested',
  INSPECTION_SCHEDULED: 'inspection_scheduled',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const VEHICLE_COMPLIANCE_STATUSES = {
  APPROVED: 'approved',
  INSPECTION_DUE: 'inspection_due',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
  PENDING: 'pending' // Added 'pending' as noted in schema deviation
};

export const COMPLAINT_CATEGORIES = {
  RIDER_COMPLAINT: 'rider_complaint',
  DRIVER_COMPLAINT: 'driver_complaint',
  PAYMENT_ISSUE: 'payment_issue',
  SAFETY_REPORT: 'safety_report'
};

export const COMPLAINT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const COMPLAINT_STATES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
  CLOSED: 'closed'
};

export const RIDE_STATUSES = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const SERVICE_TIERS = {
  STANDARD: 'standard',
  EXECUTIVE: 'executive',
  PREMIUM: 'premium'
};

export const WALLET_TRANSACTION_TYPES = {
  TOP_UP: 'top_up',
  RIDE_PAYMENT: 'ride_payment',
  REFUND: 'refund',
  MANUAL_ADJUSTMENT: 'manual_adjustment'
};

export const VIP_BOOKING_TYPES = {
  INSTANT:    'instant',
  SCHEDULED:  'scheduled',
};

export const VIP_BOOKING_STATUSES = {
  PENDING:     'pending',
  CONFIRMED:   'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
};

export const VIP_DRIVER_ASSIGNMENT_STATUSES = {
  UNASSIGNED: 'unassigned',
  ASSIGNED:   'assigned',
  ACCEPTED:   'accepted',
  DECLINED:   'declined',
};

export const SOS_TYPES = {
  MESSAGE:         'message',
  VOICE_RECORDING: 'voice_recording',
};

export const SOS_STATUSES = {
  ACTIVE:      'active',
  RESPONDING:  'responding',
  RESOLVED:    'resolved',
  FALSE_ALARM: 'false_alarm',
};

export const SOS_TRIGGERED_BY = {
  RIDER:  'rider',
  DRIVER: 'driver',
};

export const CONTENT_TYPES = {
  FAQ:              'faq',
  PRIVACY_POLICY:   'privacy_policy',
  TERMS_OF_SERVICE: 'terms_of_service',
  COMPANY_POLICY:   'company_policy',
};

export const CONTENT_AUDIENCE = {
  DRIVER: 'driver',
  RIDER:  'rider',
  BOTH:   'both',
};

export const CONTENT_STATUSES = {
  DRAFT:     'draft',
  PUBLISHED: 'published',
  ARCHIVED:  'archived',
};

export const VIP_VEHICLE_STATUSES = {
  AVAILABLE:   'available',
  IN_USE:      'in_use',
  MAINTENANCE: 'maintenance',
  RETIRED:     'retired',
};
