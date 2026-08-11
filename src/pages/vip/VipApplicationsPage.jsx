import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/formatters';
import { vipApplications } from './vipAdminData';
import styles from './VipModulePages.module.css';

export default function VipApplicationsPage() {
  const stats = {
    total: vipApplications.length,
    pending: vipApplications.filter((item) => item.applicationStatus.includes('pending') || item.applicationStatus.includes('awaiting')).length,
    approved: vipApplications.filter((item) => item.applicationStatus === 'approved').length,
    rejected: vipApplications.filter((item) => item.applicationStatus === 'rejected').length,
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>VIP Applications</h1>
          <p className={styles.subtitle}>Review and process VIP driver applications</p>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <Metric label="Total Applications" value={stats.total} />
        <Metric label="Pending Review" value={stats.pending} />
        <Metric label="Approved" value={stats.approved} />
        <Metric label="Rejected" value={stats.rejected} />
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>All Applications</h2>
        </div>
        <DataTable
          columns={[
            { key: 'driverName', label: 'Driver Name' },
            { key: 'driverId', label: 'Driver ID' },
            { key: 'applicationDate', label: 'Application Date', render: (value) => formatDate(value) },
            { key: 'vehicleType', label: 'Vehicle Type' },
            { key: 'inspectionStatus', label: 'Inspection Status', render: (value) => <StatusBadge status={value} /> },
            { key: 'applicationStatus', label: 'Application Status', render: (value) => <StatusBadge status={value} /> },
          ]}
          data={vipApplications}
          searchPlaceholder="Search by driver name, ID, vehicle..."
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
