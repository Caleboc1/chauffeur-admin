import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTime } from '@/utils/formatters';
import { vipInspections } from './vipAdminData';
import styles from './VipModulePages.module.css';

export default function VipInspectionQueuePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>VIP Inspection Queue</h1>
          <p className={styles.subtitle}>Manage vehicle inspections for VIP applicants</p>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <Metric label="Total" value={vipInspections.length} />
        <Metric label="Pending" value={vipInspections.filter((item) => item.status === 'pending').length} />
        <Metric label="Scheduled" value={vipInspections.filter((item) => item.status === 'scheduled').length} />
        <Metric label="Completed" value={vipInspections.filter((item) => item.status === 'completed').length} />
      </div>

      <section className={styles.panel}>
        <DataTable
          columns={[
            { key: 'driverName', label: 'Driver Name' },
            { key: 'vehicle', label: 'Vehicle' },
            { key: 'inspectionDate', label: 'Inspection Date', render: (value) => formatDateTime(value) },
            { key: 'officer', label: 'Inspection Officer' },
            { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
            { key: 'result', label: 'Result', render: (value) => value ? <StatusBadge status={value} /> : <span className={styles.muted}>-</span> },
          ]}
          data={vipInspections}
          searchPlaceholder="Search by driver or vehicle..."
          filterOptions={[{ value: 'all', label: 'All Inspections' }]}
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
