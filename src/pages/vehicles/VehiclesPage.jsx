import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Car, ShieldCheck, AlertTriangle, User } from 'lucide-react';
import styles from './VehiclesPage.module.css';

import { MOCK_VEHICLES } from '@/utils/mockData';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Demo mode: use mock data
    setLoading(false);
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
        <DataTable 
          columns={columns} 
          data={vehicles} 
          loading={loading}
          onRowClick={(row) => console.log('Navigate to vehicle/driver detail:', row.driver_id)}
          searchPlaceholder="Search plate numbers or models..."
        />
      </div>
    </div>
  );
}
