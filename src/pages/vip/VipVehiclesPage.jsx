import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { useVip } from '@/hooks/useVip';
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
        <Metric label="Total Vehicles" value={vehicles.length} />
        <Metric label="Available" value={vehicles.filter((item) => item.status === 'available').length} />
        <Metric label="In Use" value={vehicles.filter((item) => item.status === 'in_use').length} />
        <Metric label="In Maintenance" value={vehicles.filter((item) => item.status === 'maintenance').length} />
        <Metric label="Operational" value={vehicles.filter((item) => item.status !== 'maintenance').length} />
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

function Metric({ label, value }) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
  );
}
