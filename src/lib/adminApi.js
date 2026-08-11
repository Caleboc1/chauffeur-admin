import { apiRequest, buildQuery, normalizeListResponse, unwrapApiData } from './api';

export const adminApi = {
  getDashboard: () => apiRequest('/api/v1/analytics_admin/dashboard').then(unwrapApiData),
  getEarningsAndCommission: () => apiRequest('/api/v1/analytics_admin/earnings_and_commission').then(unwrapApiData),
  getRevenueOverview: () => apiRequest('/api/v1/analytics_admin/revenue_overview').then(unwrapApiData),
  getPerformanceSummary: (params) => apiRequest(`/api/v1/analytics_admin/performance_summary${buildQuery(params)}`).then(unwrapApiData),
  getTotalEarningsOverPeriod: (params) => apiRequest(`/api/v1/analytics_admin/total_earnings_over_period${buildQuery(params)}`).then(unwrapApiData),

  listUsers: (params) => apiRequest(`/api/v1/user_admin${buildQuery(params)}`).then(normalizeListResponse),
  getUserProfile: (id) => apiRequest(`/api/v1/user_admin/${id}/profile`).then(unwrapApiData),
  getUserDriverEarnings: (id) => apiRequest(`/api/v1/user_admin/${id}/driver_earnings`).then(unwrapApiData),
  updateUser: (id, body) => apiRequest(`/api/v1/user_admin/${id}`, { method: 'PATCH', body }).then(unwrapApiData),
  toggleBlockUser: (id, body) => apiRequest(`/api/v1/user_admin/${id}/toggle_block`, { method: 'PATCH', body }).then(unwrapApiData),
  inviteAdmin: (body) => apiRequest('/api/v1/user_admin/invite_admin', { method: 'POST', body }).then(unwrapApiData),

  listRides: (params) => apiRequest(`/api/v1/rides_admin${buildQuery(params)}`).then(normalizeListResponse),
  getRide: (id) => apiRequest(`/api/v1/rides_admin/${id}`).then(unwrapApiData),
  approveRide: (id) => apiRequest(`/api/v1/rides_admin/${id}/approve`, { method: 'POST' }).then(unwrapApiData),
  rejectRide: (id, body) => apiRequest(`/api/v1/rides_admin/${id}/reject`, { method: 'POST', body }).then(unwrapApiData),

  listComplaints: (params) => apiRequest(`/api/v1/complaints_admin${buildQuery(params)}`).then(normalizeListResponse),
  processComplaint: (id, body) => apiRequest(`/api/v1/complaints_admin/${id}/process`, { method: 'PATCH', body }).then(unwrapApiData),

  listRatings: (params) => apiRequest(`/api/v1/ratings_admin${buildQuery(params)}`).then(normalizeListResponse),
  getRating: (id) => apiRequest(`/api/v1/ratings_admin/${id}`).then(unwrapApiData),
  updateRating: (id, body) => apiRequest(`/api/v1/ratings_admin/${id}`, { method: 'PATCH', body }).then(unwrapApiData),
  toggleRatingPublish: (id) => apiRequest(`/api/v1/ratings_admin/toggle_publish/${id}`, { method: 'PATCH' }).then(unwrapApiData),

  listTransactions: (params) => apiRequest(`/api/v1/transactions_admin${buildQuery(params)}`).then(normalizeListResponse),
  getTransaction: (id) => apiRequest(`/api/v1/transactions_admin/${id}`).then(unwrapApiData),
  listPayouts: (params) => apiRequest(`/api/v1/payouts_admin${buildQuery(params)}`).then(normalizeListResponse),
  processPayout: (id, body) => apiRequest(`/api/v1/payouts_admin/${id}/process`, { method: 'POST', body }).then(unwrapApiData),
  processManyPayouts: (body) => apiRequest('/api/v1/payouts_admin/process_many', { method: 'POST', body }).then(unwrapApiData),
  listBankAccounts: (params) => apiRequest(`/api/v1/bank_accounts_admin${buildQuery(params)}`).then(normalizeListResponse),
  getBankAccount: (id) => apiRequest(`/api/v1/bank_accounts_admin/${id}`).then(unwrapApiData),

  listSosAlerts: (params) => apiRequest(`/api/v1/sos_alerts_admin${buildQuery(params)}`).then(normalizeListResponse),
  getSosAlert: (id) => apiRequest(`/api/v1/sos_alerts_admin/${id}`).then(unwrapApiData),
  processSosAlert: (id, body) => apiRequest(`/api/v1/sos_alerts_admin/${id}/process`, { method: 'POST', body }).then(unwrapApiData),
  listLiveLocations: (params) => apiRequest(`/api/v1/live_location_admin${buildQuery(params)}`).then(normalizeListResponse),
  getLiveLocation: (id) => apiRequest(`/api/v1/live_location_admin/${id}`).then(unwrapApiData),
  getRecentLiveLocation: (id) => apiRequest(`/api/v1/live_location_admin/recent/${id}`).then(unwrapApiData),
  listOfficialEmergencyContacts: (params) => apiRequest(`/api/v1/official_emergency_contact_admin${buildQuery(params)}`).then(normalizeListResponse),
  createOfficialEmergencyContact: (body) => apiRequest('/api/v1/official_emergency_contact_admin', { method: 'POST', body }).then(unwrapApiData),
  getOfficialEmergencyContact: (id) => apiRequest(`/api/v1/official_emergency_contact_admin/${id}`).then(unwrapApiData),
  updateOfficialEmergencyContact: (id, body) => apiRequest(`/api/v1/official_emergency_contact_admin/${id}`, { method: 'PATCH', body }).then(unwrapApiData),
  deleteOfficialEmergencyContact: (id) => apiRequest(`/api/v1/official_emergency_contact_admin/${id}`, { method: 'DELETE' }).then(unwrapApiData),

  listNotifications: (params) => apiRequest(`/api/v1/notifications_admin${buildQuery(params)}`).then(normalizeListResponse),
  broadcastNotification: (body) => apiRequest('/api/v1/notifications_admin/broadcast', { method: 'POST', body }).then(unwrapApiData),
  listBroadcastHistory: (params) => apiRequest(`/api/v1/broadcast_history_admin${buildQuery(params)}`).then(normalizeListResponse),
  getBroadcastHistory: (id) => apiRequest(`/api/v1/broadcast_history_admin/${id}`).then(unwrapApiData),

  listChats: (params) => apiRequest(`/api/v1/chats_admin${buildQuery(params)}`).then(normalizeListResponse),
  getChat: (id) => apiRequest(`/api/v1/chats_admin/${id}`).then(unwrapApiData),

  listUserKyc: (params) => apiRequest(`/api/v1/user_kyc_admin${buildQuery(params)}`).then(normalizeListResponse),
  getUserKyc: (id) => apiRequest(`/api/v1/user_kyc_admin/${id}`).then(unwrapApiData),
  processUserKyc: (id, body) => apiRequest(`/api/v1/user_kyc_admin/${id}`, { method: 'PATCH', body }).then(unwrapApiData),

  listWallets: (params) => apiRequest(`/api/v1/wallet_admin${buildQuery(params)}`).then(normalizeListResponse),
  getWallet: (id) => apiRequest(`/api/v1/wallet_admin/${id}`).then(unwrapApiData),

  getSystemSettings: () => apiRequest('/api/v1/system_settings/full').then(unwrapApiData),
  updateSystemSettings: (body) => apiRequest('/api/v1/system_settings', { method: 'PATCH', body }).then(unwrapApiData),
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

export function mapVipRide(ride = {}) {
  const mapped = mapAdminRide(ride);
  const user = ride.user || ride.rider || ride.passenger || mapped.riders;
  const driver = ride.driver || mapped.drivers;
  const stops = Array.isArray(ride.stops) ? ride.stops : [];

  return {
    ...mapped,
    rider: user ? { ...user, full_name: fullName(user), phone: user.phoneNumber || user.phone, email: user.email } : null,
    driver: driver ? { ...driver, full_name: fullName(driver), rating: driver.averageRating || driver.rating } : null,
    driver_id: ride.driverId || driver?.id || ride.driver_id,
    pickup_address: ride.pickupLocationTitle || mapped.pickup_address,
    destination_address: ride.dropOffLocationTitle || mapped.dropoff_address,
    booking_type: ride.scheduledPickupDate ? 'scheduled' : 'instant',
    scheduled_at: ride.scheduledPickupDate || ride.scheduled_at,
    started_at: ride.pickupTime || ride.started_at || ride.createdAt,
    created_at: ride.createdAt || ride.created_at,
    status: ride.status || mapped.trip_status,
    fare: Number(ride.price || ride.fare || 0),
    vehicle: ride.vehicle || null,
    escortRequired: Number(ride.escortCount || 0) > 0,
    escortType: ride.escortCount ? `${ride.escortCount} escort${Number(ride.escortCount) === 1 ? '' : 's'}` : null,
    escortNotes: ride.vipVehicleModel ? `VIP vehicle: ${ride.vipVehicleModel}` : '',
    tripType: stops.length > 0 ? 'multi_stop' : 'city',
    priority: ride.status === 'requested' ? 'normal' : 'standard',
  };
}

export function mapVipVehicleModel(vehicle = {}, index = 0) {
  const model = vehicle.model || 'VIP Vehicle';

  return {
    ...vehicle,
    id: vehicle.id || vehicle.model || `vip-vehicle-${index}`,
    make: vehicle.make || '',
    model,
    plate_number: vehicle.plateNumber || vehicle.plate_number || 'Configured model',
    capacity: Number(vehicle.seats || vehicle.capacity || 0),
    status: vehicle.status || 'available',
    category: 'Luxury',
    year: vehicle.year || '—',
    colour: vehicle.colour || vehicle.color || '—',
    exterior_image_urls: vehicle.exteriorImageUrl ? [vehicle.exteriorImageUrl] : [],
    interior_image_urls: vehicle.interiorImageUrl ? [vehicle.interiorImageUrl] : [],
    pricePerDay: Number(vehicle.pricePerDay || 0),
  };
}

export function mapAdminRating(rating = {}) {
  const user = rating.user || rating.rider || rating.reviewer;
  const participant = rating.participant || rating.driver || rating.reviewee;

  return {
    ...rating,
    id: rating.id || rating._id,
    driver_id: rating.participantId || participant?.id || rating.driverId,
    rider_name: fullName(user),
    participant_name: fullName(participant),
    rating: Number(rating.rating || 0),
    comment: rating.comment || '',
    status: rating.isPublished ? 'approved' : rating.hasAdminReviewed ? 'rejected' : 'pending',
    created_at: rating.createdAt || rating.created_at,
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

export function mapAdminKyc(kyc = {}) {
  const user = kyc.user || kyc.driver || kyc.userId;
  const firstName = kyc.firstName || user?.firstName;
  const lastName = kyc.lastName || user?.lastName;
  const userName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const status = kyc.userVerificationStatus || user?.userVerificationStatus || kyc.status || 'in_review';

  return {
    ...kyc,
    id: kyc.id || kyc._id,
    userId: kyc.userId || user?.id,
    driverName: userName || fullName(user) || '—',
    driverId: kyc.userId || user?.id || '—',
    driverEmail: user?.email || kyc.email || '—',
    driverPhone: user?.phoneNumber || kyc.phoneNumber || '—',
    applicationDate: kyc.createdAt || kyc.created_at || user?.createdAt,
    updatedAt: kyc.updatedAt || kyc.updated_at,
    state: status,
    vehicleType: kyc.vehicleType || '—',
    vehicleBrand: kyc.vehicleBrand || '—',
    vehicleModel: kyc.vehicleModel || '—',
    vehiclePlateNumber: kyc.vehiclePlateNumber || '—',
    vehicleColour: kyc.vehicleColour || kyc.vehicleColor || '—',
    inspectionStatus: status === 'approved' ? 'passed' : status === 'rejected' ? 'failed' : 'pending',
    applicationStatus: status,
  };
}
