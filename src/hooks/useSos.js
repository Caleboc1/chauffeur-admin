import { useState, useEffect } from 'react';
import { adminApi, mapSosAlert } from '@/lib/adminApi';

export function useSos() {
  const [alerts, setAlerts] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadAlerts() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listSosAlerts({ limit: 100 });
        if (!cancelled) {
          setAlerts(data.map(mapSosAlert));
          setActions([]);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAlerts();
    return () => {
      cancelled = true;
    };
  }, []);

  return { alerts, actions, loading, error };
}
