import { useState, useEffect } from 'react';
import { adminApi, mapSosAlert } from '@/lib/adminApi';

export function useSosBadge() {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadCount() {
      try {
        const alerts = (await adminApi.listSosAlerts({ limit: 100 })).map(mapSosAlert);
        if (!cancelled) {
          setActiveCount(alerts.filter(a => a.status === 'active').length);
        }
      } catch {
        if (!cancelled) setActiveCount(0);
      }
    }
    loadCount();
    return () => {
      cancelled = true;
    };
  }, []);

  return { activeCount };
}
