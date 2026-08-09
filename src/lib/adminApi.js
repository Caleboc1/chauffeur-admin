import { apiRequest, buildQuery, normalizeListResponse, unwrapApiData } from './api';

export const adminApi = {
  getDashboard: () => apiRequest('/api/v1/analytics_admin/dashboard').then(unwrapApiData),
  getEarningsAndCommission: () => apiRequest('/api/v1/analytics_admin/earnings_and_commission').then(unwrapApiData),
  getRevenueOverview: () => apiRequest('/api/v1/analytics_admin/revenue_overview').then(unwrapApiData),

  listUsers: (params) => apiRequest(`/api/v1/user_admin${buildQuery(params)}`).then(normalizeListResponse),
  getUserProfile: (id) => apiRequest(`/api/v1/user_admin/${id}/profile`).then(unwrapApiData),
  getUserDriverEarnings: (id) => apiRequest(`/api/v1/user_admin/${id}/driver_earnings`).then(unwrapApiData),
  updateUser: (id, body) => apiRequest(`/api/v1/user_admin/${id}`, { method: 'PATCH', body }).then(unwrapApiData),
  toggleBlockUser: (id, body) => apiRequest(`/api/v1/user_admin/${id}/toggle_block`, { method: 'PATCH', body }).then(unwrapApiData),

  listRides: (params) => apiRequest(`/api/v1/rides_admin${buildQuery(params)}`).then(normalizeListResponse),
  getRide: (id) => apiRequest(`/api/v1/rides_admin/${id}`).then(unwrapApiData),
  approveRide: (id) => apiRequest(`/api/v1/rides_admin/${id}/approve`, { method: 'POST' }).then(unwrapApiData),
  rejectRide: (id, body) => apiRequest(`/api/v1/rides_admin/${id}/reject`, { method: 'POST', body }).then(unwrapApiData),

  listComplaints: (params) => apiRequest(`/api/v1/complaints_admin${buildQuery(params)}`).then(normalizeListResponse),
  processComplaint: (id, body) => apiRequest(`/api/v1/complaints_admin/${id}/process`, { method: 'PATCH', body }).then(unwrapApiData),

  listTransactions: (params) => apiRequest(`/api/v1/transactions_admin${buildQuery(params)}`).then(normalizeListResponse),
  getTransaction: (id) => apiRequest(`/api/v1/transactions_admin/${id}`).then(unwrapApiData),
  listPayouts: (params) => apiRequest(`/api/v1/payouts_admin${buildQuery(params)}`).then(normalizeListResponse),
  processPayout: (id, body) => apiRequest(`/api/v1/payouts_admin/${id}/process`, { method: 'POST', body }).then(unwrapApiData),
  processManyPayouts: (body) => apiRequest('/api/v1/payouts_admin/process_many', { method: 'POST', body }).then(unwrapApiData),

  listSosAlerts: (params) => apiRequest(`/api/v1/sos_alerts_admin${buildQuery(params)}`).then(normalizeListResponse),
  getSosAlert: (id) => apiRequest(`/api/v1/sos_alerts_admin/${id}`).then(unwrapApiData),
  processSosAlert: (id, body) => apiRequest(`/api/v1/sos_alerts_admin/${id}/process`, { method: 'POST', body }).then(unwrapApiData),

  listNotifications: (params) => apiRequest(`/api/v1/notifications_admin${buildQuery(params)}`).then(normalizeListResponse),
  broadcastNotification: (body) => apiRequest('/api/v1/notifications_admin/broadcast', { method: 'POST', body }).then(unwrapApiData),
};

export function fullName(user = {}) {
  const joined = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ').trim();
  return joined || user.fullName || user.full_name || user.userName || user.email || '—';
}

export function mapAdminUser(user = {}) {
  return {
    ...user,
    id: user.id || user._id,
    full_name: fullName(user),
    phone: user.phoneNumber || user.phone || '—',
    email: user.email || '—',
    selfie_url: user.pictureUrl || user.selfie_url || '',
    status: user.status || (user.isBlocked ? 'suspended' : 'active'),
    verification_status: user.userVerificationStatus || user.verification_status || '—',
    rating: Number(user.averageRating || user.rating || 0),
    wallet_balance: Number(user.walletBalance || user.wallet_balance || user.wallet?.balance || 0),
    created_at: user.createdAt || user.created_at,
  };
}

export function mapAdminRide(ride = {}) {
  return {
    ...ride,
    id: ride.id || ride._id,
    created_at: ride.createdAt || ride.created_at,
    riders: ride.riders || ride.user || (ride.userId ? { full_name: ride.userId } : null),
    drivers: ride.drivers || ride.driver || null,
    pickup_address: ride.pickupLocationTitle || ride.pickup_address || '—',
    dropoff_address: ride.dropOffLocationTitle || ride.dropoff_address || '—',
    service_tier: ride.rideType || ride.service_tier || 'standard',
    trip_status: ride.status || ride.trip_status || 'requested',
    fare: Number(ride.price || ride.fare || 0),
  };
}

export function mapAdminComplaint(complaint = {}) {
  const user = complaint.user || complaint.complainant || complaint.rider || complaint.driver;
  const userType = complaint.userType || complaint.complainantType || complaint.complainant_type || user?.userType || 'user';
  return {
    ...complaint,
    id: complaint.id || complaint._id,
    complainant_type: userType === 'driver' ? 'driver' : 'rider',
    riders: userType === 'driver' ? null : { full_name: fullName(user) },
    drivers: userType === 'driver' ? { full_name: fullName(user) } : null,
    category: complaint.category || complaint.title || complaint.type || 'general',
    severity: complaint.severity || complaint.priority || 'open',
    state: complaint.status || complaint.state || 'open',
    description: complaint.description || complaint.message || complaint.body || '—',
    created_at: complaint.createdAt || complaint.created_at,
  };
}

export function mapAdminTransaction(tx = {}) {
  const user = tx.user || tx.rider || tx.driver;
  return {
    ...tx,
    id: tx.id || tx._id,
    created_at: tx.createdAt || tx.created_at,
    rider: user ? { full_name: fullName(user) } : null,
    type: tx.type || tx.transactionType || tx.status || 'transaction',
    amount: Number(tx.amount || 0),
    reason: tx.referenceCode || tx.reference || tx.narration || tx.description || tx.id || '—',
  };
}

export function mapSosAlert(alert = {}) {
  const user = alert.user || alert.rider || alert.driver;
  const location = alert.location || alert.currentLocation || {};
  return {
    ...alert,
    id: alert.id || alert._id,
    user: user ? { ...user, full_name: fullName(user) } : null,
    user_name: fullName(user),
    user_phone: user?.phoneNumber || user?.phone || '—',
    status: alert.status || 'active',
    sos_type: alert.sos_type || alert.type || alert.alertType || 'sos',
    triggered_by: user?.userType || alert.triggeredBy || 'user',
    triggered_at: alert.createdAt || alert.created_at,
    location_address: alert.locationAddress || alert.locationTitle || location.address || 'Unknown',
    created_at: alert.createdAt || alert.created_at,
    location,
  };
}

export function mapNotification(notification = {}) {
  return {
    ...notification,
    id: notification.id || notification._id,
    sent_at: notification.createdAt || notification.sentAt || notification.sent_at,
    channel: notification.channel || notification.type || 'push',
    audience: notification.audience || notification.recipientType || notification.target || '—',
    subject: notification.title || notification.subject || '—',
    status: notification.status || 'sent',
    description: notification.description || notification.body || '',
  };
}
