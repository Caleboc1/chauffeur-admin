import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { useVip } from '@/hooks/useVip';
import Skeleton from '@/components/ui/Skeleton';
import styles from './VipModulePages.module.css';

export default function VipVehiclesPage() {
  const navigate = useNavigate();
  const { vehicles, loading } = useVip();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>VIP Vehicle Management</h1>
          <p className={styles.subtitle}>Manage the VIP fleet - add, edit, and track vehicle status</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/vip/fleet/new')}>Add Vehicle</Button>
      </header>

      <div className={`${styles.metricsGrid} ${styles.metricsGridFive}`}>
        <Metric loading={loading} label="Total Vehicles" value={vehicles.length} />
        <Metric loading={loading} label="Available" value={vehicles.filter((item) => item.status === 'available').length} />
        <Metric loading={loading} label="In Use" value={vehicles.filter((item) => item.status === 'in_use').length} />
        <Metric loading={loading} label="In Maintenance" value={vehicles.filter((item) => item.status === 'maintenance').length} />
        <Metric loading={loading} label="Operational" value={vehicles.filter((item) => item.status !== 'maintenance').length} />
      </div>

      <section className={styles.panel}>
        <DataTable
          columns={[
            { key: 'model', label: 'Vehicle', render: (_, row) => <div>{row.make} {row.model}<br /><span className={styles.muted}>{row.plate_number}</span></div> },
            { key: 'category', label: 'Category', render: () => <div className={styles.chips}><span className={styles.chip}>Luxury</span></div> },
            { key: 'capacity', label: 'Capacity', render: (value) => `${value} seats` },
            { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
            { key: 'assignedDriver', label: 'Assigned Driver', render: () => <span className={styles.muted}>Unassigned</span> },
            { key: 'actions', label: '', render: (_, row) => <button className={styles.linkButton} onClick={() => navigate(`/vip/fleet/${row.id}`)}>View</button> },
          ]}
          data={vehicles}
          loading={loading}
          emptyMessage="No VIP vehicle models configured."
          searchPlaceholder="Search"
          filterOptions={[{ value: 'all', label: 'All Statuses' }]}
          filterValue="all"
          onFilterChange={() => {}}
        />
      </section>
    </div>
  );
}

function Metric({ label, value, loading = false }) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{loading ? <Skeleton width="30px" height="20px" /> : value}</span>
    </div>
  );
}
