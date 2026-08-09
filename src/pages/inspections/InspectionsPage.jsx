import { useState, useEffect } from 'react';
import { MOCK_INSPECTIONS, MOCK_DRIVERS, MOCK_VEHICLES } from '@/utils/mockData';
import { formatDateTime } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import styles from './InspectionsPage.module.css';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const enriched = (MOCK_INSPECTIONS || []).map(ins => ({
      ...ins,
      drivers: ins.drivers || MOCK_DRIVERS.find(d => d.id === ins.driver_id),
      vehicles: ins.vehicles || (() => {
        const v = MOCK_VEHICLES.find(v => v.driver_id === ins.driver_id);
        return v ? { plate_number: v.plate_number } : null;
      })(),
    }));
    setInspections(enriched);
    setLoading(false);
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
        <DataTable 
          columns={columns} 
          data={inspections} 
          loading={loading}
          onRowClick={(row) => console.log('Open inspection detail/result modal:', row.id)}
          searchPlaceholder="Search by driver or location..."
        />
      </div>
    </div>
  );
}
