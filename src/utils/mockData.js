export const MOCK_DRIVERS = [
  {
    id: 'd1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-0101',
    status: 'active',
    verification_status: 'approved',
    rating: 4.8,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    date_of_birth: '1990-05-15',
    government_id_number: 'ID-8822-11',
    selfie_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    face_match_score: 98,
    face_match_status: 'pass'
  },
  {
    id: 'd2',
    full_name: 'Sarah Smith',
    email: 'sarah.s@example.com',
    phone: '+1 555-0102',
    status: 'active',
    verification_status: 'approved',
    rating: 4.9,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd3',
    full_name: 'Mike Johnson',
    email: 'mike.j@example.com',
    phone: '+1 555-0103',
    status: 'inactive',
    verification_status: 'pending',
    rating: 0.0,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd4',
    full_name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    phone: '+1 555-0104',
    status: 'suspended',
    verification_status: 'rejected',
    rating: 3.2,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_RIDERS = [
  {
    id: 'r1',
    full_name: 'Alice Brown',
    email: 'alice.b@example.com',
    phone: '+1 555-0201',
    status: 'active',
    wallet_balance: 150.50,
    rating: 5.0,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r2',
    full_name: 'Bob Wilson',
    email: 'bob.w@example.com',
    phone: '+1 555-0202',
    status: 'active',
    wallet_balance: 25.00,
    rating: 4.7,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_RIDES = [
  {
    id: 'ride1',
    rider_id: 'r1',
    driver_id: 'd1',
    trip_status: 'completed',
    service_tier: 'premium',
    pickup_address: '123 Luxury Ave, Downtown',
    dropoff_address: '456 Business Blvd, Uptown',
    fare: 45.00,
    distance_km: 8.5,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'Alice Brown' },
    drivers: { full_name: 'John Doe' }
  },
  {
    id: 'ride2',
    rider_id: 'r2',
    driver_id: 'd2',
    trip_status: 'in_progress',
    service_tier: 'standard',
    pickup_address: '789 Central St',
    dropoff_address: '101 Airport Rd',
    fare: 32.20,
    distance_km: 12.0,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    riders: { full_name: 'Bob Wilson' },
    drivers: { full_name: 'Sarah Smith' }
  },
  {
    id: 'ride3',
    rider_id: 'r1',
    driver_id: null,
    trip_status: 'requested',
    service_tier: 'executive',
    pickup_address: 'Grand Hotel',
    dropoff_address: 'Opera House',
    fare: 18.50,
    distance_km: 3.2,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    riders: { full_name: 'Alice Brown' },
    drivers: null
  },
  {
    id: 'ride4',
    rider_id: 'r2',
    driver_id: 'd1',
    trip_status: 'completed',
    service_tier: 'standard',
    pickup_address: '22 Marina Blvd',
    dropoff_address: '8 Victoria Island Rd',
    fare: 27.80,
    distance_km: 6.1,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'Bob Wilson' },
    drivers: { full_name: 'John Doe' }
  },
  {
    id: 'ride5',
    rider_id: 'r1',
    driver_id: 'd2',
    trip_status: 'cancelled',
    service_tier: 'premium',
    pickup_address: 'Hilton Lagos',
    dropoff_address: 'Lekki Phase 1',
    fare: null,
    distance_km: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'Alice Brown' },
    drivers: { full_name: 'Sarah Smith' }
  }
];


export const MOCK_COMPLAINTS = [
  {
    id: 'c1',
    complainant_type: 'rider',
    category: 'payment_issue',
    severity: 'medium',
    state: 'open',
    description: 'Double charged for the last trip to the airport.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'Alice Brown' },
    drivers: { full_name: 'John Doe' }
  },
  {
    id: 'c2',
    complainant_type: 'driver',
    category: 'rider_complaint',
    severity: 'low',
    state: 'resolved',
    description: 'Rider left trash in the back seat.',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'Bob Wilson' },
    drivers: { full_name: 'Sarah Smith' }
  },
  {
    id: 'c3',
    complainant_type: 'rider',
    category: 'safety_report',
    severity: 'critical',
    state: 'open',
    description: 'Driver was speeding and driving recklessly through traffic.',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'Chioma Okafor' },
    drivers: { full_name: 'Emeka Obi' }
  },
  {
    id: 'c4',
    complainant_type: 'driver',
    category: 'payment_issue',
    severity: 'high',
    state: 'in_progress',
    description: 'Rider did not show up but trip was marked as completed.',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'David Oyelowo' },
    drivers: { full_name: 'Abiodun Salami' }
  },
  {
    id: 'c5',
    complainant_type: 'rider',
    category: 'driver_complaint',
    severity: 'medium',
    state: 'escalated',
    description: 'Driver took a longer route and refused to acknowledge.',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    riders: { full_name: 'Fatima Bello' },
    drivers: { full_name: 'Chidi Nnamdi' }
  }
];

export const MOCK_VEHICLES = [
  {
    id: 'v1',
    driver_id: 'd1',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2023,
    colour: 'Obsidian Black',
    plate_number: 'CH-777-VIP',
    compliance_status: 'approved',
    created_at: new Date().toISOString(),
    drivers: { full_name: 'John Doe' }
  },
  {
    id: 'v2',
    driver_id: 'd2',
    make: 'Tesla',
    model: 'Model S',
    year: 2024,
    colour: 'Pearl White',
    plate_number: 'EV-999-GO',
    compliance_status: 'inspection_due',
    created_at: new Date().toISOString(),
    drivers: { full_name: 'Sarah Smith' }
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    id: 'a1',
    actor_role: 'super_admin',
    action: 'driver.approve',
    entity_type: 'driver',
    ip_address: '192.168.1.1',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    admins: { name: 'Super Admin' }
  },
  {
    id: 'a2',
    actor_role: 'ops_admin',
    action: 'ride.cancel',
    entity_type: 'ride',
    ip_address: '192.168.1.5',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    admins: { name: 'Operations Lead' }
  }
];

export const MOCK_APPLICATIONS = [
  {
    id: 'app1',
    driver_id: 'd1',
    state: 'new',
    submitted_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    drivers: MOCK_DRIVERS[0]
  },
  {
    id: 'app2',
    driver_id: 'd2',
    state: 'under_review',
    submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    drivers: MOCK_DRIVERS[1]
  }
];

export const MOCK_DOCUMENTS = [
  { id: 'doc1', driver_id: 'd1', document_type: 'drivers_licence', storage_url: '#', status: 'approved' },
  { id: 'doc2', driver_id: 'd1', document_type: 'vehicle_insurance', storage_url: '#', status: 'approved' },
  { id: 'doc3', driver_id: 'd1', document_type: 'government_id', storage_url: '#', status: 'approved' },
  { id: 'doc4', driver_id: 'd2', document_type: 'drivers_licence', storage_url: '#', status: 'approved' },
  { id: 'doc5', driver_id: 'd2', document_type: 'vehicle_insurance', storage_url: '#', status: 'approved' },
  { id: 'doc6', driver_id: 'd2', document_type: 'government_id', storage_url: '#', status: 'approved' },
  { id: 'doc7', driver_id: 'd2', document_type: 'vehicle_registration', storage_url: '#', status: 'approved' },
];

export const MOCK_REVIEWS = [
  {
    id: 'rev-001',
    driver_id: 'd1',
    rider_name: 'Alice Brown',
    rider_avatar: null,
    rating: 5,
    comment: 'Excellent driver! Very professional and courteous. The car was spotless and he took the most efficient route. Would highly recommend.',
    status: 'approved',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: 'adm-001',
    reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-002',
    driver_id: 'd1',
    rider_name: 'Bob Wilson',
    rider_avatar: null,
    rating: 4,
    comment: 'Good ride overall. Driver was on time and friendly. Car could have been a bit cleaner inside.',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: null,
    reviewed_at: null,
  },
  {
    id: 'rev-003',
    driver_id: 'd1',
    rider_name: 'Charlie Davis',
    rider_avatar: null,
    rating: 5,
    comment: 'Best chauffeur experience I have had. He opened doors, offered water, and drove smoothly. 10/10.',
    status: 'pending',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: null,
    reviewed_at: null,
  },
  {
    id: 'rev-004',
    driver_id: 'd1',
    rider_name: 'Diana Okonkwo',
    rider_avatar: null,
    rating: 3,
    comment: 'Driver was polite but arrived 10 minutes late and took a longer route than necessary.',
    status: 'rejected',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: 'adm-001',
    reviewed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-005',
    driver_id: 'd1',
    rider_name: 'Emeka Nwosu',
    rider_avatar: null,
    rating: 5,
    comment: 'Top-notch service. The vehicle was immaculate and the driver was very knowledgeable about the city.',
    status: 'approved',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: 'adm-002',
    reviewed_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-006',
    driver_id: 'd2',
    rider_name: 'Alice Brown',
    rider_avatar: null,
    rating: 4,
    comment: 'Sarah was a great driver. Very smooth ride and good conversation. Would ride with her again.',
    status: 'approved',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: 'adm-001',
    reviewed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-007',
    driver_id: 'd2',
    rider_name: 'Blessing Adeyemi',
    rider_avatar: null,
    rating: 5,
    comment: 'Absolutely wonderful experience. The car smelled amazing and she was very professional.',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: null,
    reviewed_at: null,
  },
];

export const MOCK_INSPECTIONS = [
  { 
    id: 'ins1', 
    driver_id: 'd1', 
    scheduled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Main Inspection Center, Plot 45',
    vehicle_condition: 'pass',
    document_verification: 'pass',
    identity_match: 'pass',
    inspector_notes: 'All documents verified. Vehicle in excellent condition. Identity confirmed.',
    result: 'pass',
    completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
  },
  { 
    id: 'ins2', 
    driver_id: 'd2', 
    scheduled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Main Inspection Center, Plot 45',
    vehicle_condition: 'pass',
    document_verification: 'pass',
    identity_match: 'pass',
    inspector_notes: 'Vehicle meets all requirements. Documentation complete.',
    result: 'pass',
    completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
  },
];
