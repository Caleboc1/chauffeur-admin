import { useState, useEffect } from 'react';
import { adminApi, mapAdminUser, mapVipRide, mapVipVehicleModel } from '@/lib/adminApi';

function isVipDriver(driver = {}) {
  const driverType = String(driver.driverType || driver.driver_type || '').toLowerCase();
  const verification = String(driver.userVerificationStatus || driver.verification_status || '').toLowerCase();

  return driverType === 'vip' || driver.vipCertified || driver.isVip || verification.includes('vip');
}

export function useVip() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vipDrivers, setVipDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadVipData() {
      setLoading(true);
      setError('');

      try {
        const [rideRows, settings, drivers] = await Promise.all([
          adminApi.listRides({ rideType: 'vip', limit: 100 }).catch(() => []),
          adminApi.getSystemSettings().catch(() => null),
          adminApi.listUsers({ userType: 'driver', limit: 100 }).catch(() => []),
        ]);

        if (!active) return;

        setBookings(rideRows.map(mapVipRide));
        setVehicles((settings?.vipVehicleModels || []).map(mapVipVehicleModel));
        setVipDrivers(drivers.map(mapAdminUser).filter(isVipDriver));
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Unable to load VIP data.');
        setBookings([]);
        setVehicles([]);
        setVipDrivers([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVipData();

    return () => {
      active = false;
    };
  }, []);

  return { bookings, vehicles, vipDrivers, loading, error };
}
