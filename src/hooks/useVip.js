import { useState, useEffect } from 'react';
import { MOCK_VIP_BOOKINGS, MOCK_VIP_VEHICLES, MOCK_DRIVERS } from '@/lib/mockData';

export function useVip() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vipDrivers, setVipDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBookings(MOCK_VIP_BOOKINGS);
    setVehicles(MOCK_VIP_VEHICLES);
    setVipDrivers(MOCK_DRIVERS.map(d => ({ ...d, vip_certified: true })));
    setLoading(false);
  }, []);

  return { bookings, vehicles, vipDrivers, loading };
}
