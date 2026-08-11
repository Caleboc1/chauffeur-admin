import { MOCK_DRIVERS, MOCK_INSPECTIONS, MOCK_VIP_BOOKINGS, MOCK_VIP_VEHICLES } from '@/lib/mockData';

export const vipApplications = [
  {
    id: 'vip-app-001',
    driverName: 'Emeka Obi',
    driverId: 'DR-00001',
    applicationDate: '2024-05-01T09:00:00Z',
    vehicleType: 'Toyota Camry',
    inspectionStatus: 'passed',
    applicationStatus: 'awaiting_decision',
  },
  {
    id: 'vip-app-002',
    driverName: 'Abiodun Salami',
    driverId: 'DR-00002',
    applicationDate: '2024-05-05T10:00:00Z',
    vehicleType: 'Honda Accord',
    inspectionStatus: 'pending',
    applicationStatus: 'inspection_required',
  },
  {
    id: 'vip-app-003',
    driverName: 'Segun Adebayo',
    driverId: 'DR-00006',
    applicationDate: '2024-05-08T08:30:00Z',
    vehicleType: 'BMW 5 Series',
    inspectionStatus: 'scheduled',
    applicationStatus: 'inspection_scheduled',
  },
  {
    id: 'vip-app-004',
    driverName: 'Chidi Nnamdi',
    driverId: 'DR-00005',
    applicationDate: '2024-05-10T12:00:00Z',
    vehicleType: 'Lexus ES 350',
    inspectionStatus: 'pending',
    applicationStatus: 'pending_review',
  },
  {
    id: 'vip-app-005',
    driverName: 'Kehinde Lawal',
    driverId: 'DR-00004',
    applicationDate: '2024-04-20T12:00:00Z',
    vehicleType: 'Mercedes-Benz E-Class',
    inspectionStatus: 'failed',
    applicationStatus: 'rejected',
  },
];

export const vipInspections = [
  {
    id: 'vip-ins-001',
    driverName: 'Segun Adebayo',
    vehicle: 'BMW 5 Series (LND 560 MN)',
    inspectionDate: '2024-05-22T11:00:00Z',
    officer: 'Ngozi Nwosu',
    status: 'pending',
    result: null,
  },
  {
    id: 'vip-ins-002',
    driverName: 'Abiodun Salami',
    vehicle: 'Honda Accord (LND 887 KJ)',
    inspectionDate: '2024-05-23T15:00:00Z',
    officer: 'Ngozi Nwosu',
    status: 'scheduled',
    result: null,
  },
  {
    id: 'vip-ins-003',
    driverName: 'Emeka Obi',
    vehicle: 'Toyota Camry (LND 421 GH)',
    inspectionDate: '2024-05-20T11:00:00Z',
    officer: 'Ngozi Nwosu',
    status: 'completed',
    result: 'passed',
  },
  ...MOCK_INSPECTIONS.slice(0, 3).map((item) => ({
    id: `vip-${item.id}`,
    driverName: item.driver?.full_name || item.drivers?.full_name || 'VIP Driver',
    vehicle: `${item.vehicle?.make || 'Vehicle'} ${item.vehicle?.model || ''} (${item.vehicle?.plate_number || 'Plate pending'})`,
    inspectionDate: item.scheduled_at,
    officer: item.assigned_inspector?.full_name || 'Inspection Officer',
    status: item.completed_at ? 'completed' : 'pending',
    result: item.result,
  })),
];

export const vipDowngradeRequests = [
  {
    id: 'vip-down-001',
    driverName: 'Adebayo Ogunlesi',
    driverId: 'DR-00008',
    email: 'adebayo.o@gmail.com',
    phone: '+234 807 654 3210',
    requestDate: '2024-05-19T09:00:00Z',
    reason: 'Unable to maintain VIP service standards due to personal health reasons. Requesting to return to regular driver status.',
    status: 'pending',
    vipTrips: 8,
    rating: 4.3,
    activeVipRides: 0,
    upcomingVipBookings: 1,
  },
  {
    id: 'vip-down-002',
    driverName: 'Adebayo Ogunlesi',
    driverId: 'DR-00008',
    email: 'adebayo.o@gmail.com',
    phone: '+234 807 654 3210',
    requestDate: '2024-05-19T09:30:00Z',
    reason: 'Unable to maintain VIP service standards due to personal health reasons.',
    status: 'pending',
    vipTrips: 8,
    rating: 4.3,
    activeVipRides: 0,
    upcomingVipBookings: 1,
  },
  {
    id: 'vip-down-003',
    driverName: 'Adebayo Ogunlesi',
    driverId: 'DR-00008',
    email: 'adebayo.o@gmail.com',
    phone: '+234 807 654 3210',
    requestDate: '2024-05-19T10:00:00Z',
    reason: 'Unable to maintain VIP service standards due to personal health reasons.',
    status: 'rejected',
    vipTrips: 8,
    rating: 4.3,
    activeVipRides: 0,
    upcomingVipBookings: 1,
  },
];

export const vipRideRequests = MOCK_VIP_BOOKINGS.map((booking, index) => ({
  ...booking,
  id: booking.id.replace('vip-', 'DR-0000'),
  priority: index === 1 ? 'critical' : 'normal',
  escortRequired: index === 0,
  escortType: index === 0 ? 'Medical Escort' : null,
  escortNotes: index === 0 ? 'Patient will be accompanied by two medical staff.' : '',
  tripType: index === 0 ? 'inter_state' : 'city',
  status: index === 0 ? 'confirmed' : booking.status,
}));

export const vipStates = [
  { id: 'lagos', name: 'Lagos', code: 'LA', region: 'South West', status: 'active', coverage: 95, drivers: 4, routes: 8 },
  { id: 'abuja', name: 'Abuja (FCT)', code: 'FC', region: 'North Central', status: 'active', coverage: 88, drivers: 3, routes: 6 },
  { id: 'rivers', name: 'Rivers', code: 'RI', region: 'South South', status: 'active', coverage: 72, drivers: 2, routes: 4 },
  { id: 'oyo', name: 'Oyo', code: 'OY', region: 'South West', status: 'active', coverage: 55, drivers: 1, routes: 3 },
  { id: 'enugu', name: 'Enugu', code: 'EN', region: 'South East', status: 'inactive', coverage: 0, drivers: 0, routes: 0 },
  { id: 'kano', name: 'Kano', code: 'KN', region: 'North West', status: 'inactive', coverage: 0, drivers: 0, routes: 0 },
  { id: 'delta', name: 'Delta', code: 'DE', region: 'South South', status: 'active', coverage: 35, drivers: 1, routes: 2 },
];

export const vipDrivers = MOCK_DRIVERS.map((driver, index) => ({
  ...driver,
  vipCertified: true,
  vipTrips: 12 + index,
}));

export const vipVehicles = MOCK_VIP_VEHICLES;
