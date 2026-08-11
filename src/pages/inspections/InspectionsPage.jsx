import { useState, useEffect } from 'react';
import { formatDateTime } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { adminApi, mapAdminKyc } from '@/lib/adminApi';
import { Plus } from 'lucide-react';
import styles from './InspectionsPage.module.css';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchInspections() {
      setLoading(true);
      setError('');
      try {
        const rows = await adminApi.listUserKyc({ limit: 100 });
        const mapped = rows.map(mapAdminKyc).map((item) => ({
          ...item,
          drivers: { full_name: item.driverName },
          vehicles: { plate_number: item.vehiclePlateNumber },
          scheduled_at: item.updatedAt || item.applicationDate,
          location: [item.city, item.state, item.country].filter(Boolean).join(', ') || '—',
          result: item.inspectionStatus,
        }));
        if (!cancelled) setInspections(mapped);
      } catch (err) {
        if (!cancelled) {
          setInspections([]);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchInspections();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    { 
      key: 'drivers', 
      label: 'Driver',
      render: (v) => v?.full_name || '—'
    },
    { 
      key: 'vehicles', 
      label: 'Vehicle',
      render: (v) => v?.plate_number || '—'
    },
    { 
      key: 'scheduled_at', 
      label: 'Scheduled For',
      render: (v) => formatDateTime(v)
    },
    { 
      key: 'location', 
      label: 'Location'
    },
    { 
      key: 'result', 
      label: 'Result',
      render: (v) => <StatusBadge status={v} />
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Physical Inspections</h1>
          <p className={styles.subtitle}>Schedule and record verification results for drivers and vehicles</p>
        </div>
        <Button variant="primary" icon={Plus}>
          Schedule New
        </Button>
      </header>

      <div className={styles.tableWrapper}>
        {error && <div>{error}</div>}
        <DataTable 
          columns={columns} 
          data={inspections} 
          loading={loading}
          onRowClick={() => {}}
          searchPlaceholder="Search by driver or location..."
        />
      </div>
    </div>
  );
}
