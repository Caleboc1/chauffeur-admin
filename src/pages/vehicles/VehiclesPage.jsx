import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { adminApi, mapAdminKyc } from '@/lib/adminApi';
import { Car, ShieldCheck, AlertTriangle, User } from 'lucide-react';
import styles from './VehiclesPage.module.css';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchVehicles() {
      setLoading(true);
      setError('');
      try {
        const rows = await adminApi.listUserKyc({ limit: 100 });
        const mapped = rows
          .map(mapAdminKyc)
          .filter((item) => item.vehiclePlateNumber && item.vehiclePlateNumber !== '—')
          .map((item) => ({
            id: item.id,
            make: item.vehicleBrand,
            model: item.vehicleModel,
            year: item.vehicleYear || '—',
            colour: item.vehicleColour,
            plate_number: item.vehiclePlateNumber,
            drivers: { full_name: item.driverName },
            compliance_status: item.state === 'approved' ? 'approved' : item.state === 'rejected' ? 'suspended' : 'inspection_due',
            created_at: item.applicationDate,
          }));
        if (!cancelled) setVehicles(mapped);
      } catch (err) {
        if (!cancelled) {
          setVehicles([]);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    { 
      key: 'make', 
      label: 'Vehicle',
      render: (val, row) => (
        <div className={styles.vehicleCell}>
          <Car size={20} className={styles.carIcon} />
          <div className={styles.info}>
            <span className={styles.model}>{val} {row.model}</span>
            <span className={styles.plate}>{row.plate_number}</span>
          </div>
        </div>
      )
    },
    { key: 'year', label: 'Year' },
    { key: 'colour', label: 'Color' },
    { 
      key: 'drivers', 
      label: 'Driver',
      render: (v) => (
        <div className={styles.driverCell}>
          <User size={14} />
          <span>{v?.full_name || 'Unassigned'}</span>
        </div>
      )
    },
    { 
      key: 'compliance_status', 
      label: 'Compliance',
      render: (v) => <StatusBadge status={v} />
    },
    { 
      key: 'created_at', 
      label: 'Added',
      render: (v) => formatDate(v)
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Vehicle Fleet</h1>
          <p className={styles.subtitle}>Manage vehicle registrations, compliance status, and re-inspection cycles</p>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <ShieldCheck size={24} className={styles.successIcon} />
          <div>
            <h3>{vehicles.filter(v => v.compliance_status === 'approved').length}</h3>
            <label>Compliant</label>
          </div>
        </div>
        <div className={styles.statBox}>
          <AlertTriangle size={24} className={styles.warningIcon} />
          <div>
            <h3>{vehicles.filter(v => v.compliance_status === 'inspection_due').length}</h3>
            <label>Inspection Due</label>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {error && <div>{error}</div>}
        <DataTable 
          columns={columns} 
          data={vehicles} 
          loading={loading}
          onRowClick={() => {}}
          searchPlaceholder="Search plate numbers or models..."
        />
      </div>
    </div>
  );
}
