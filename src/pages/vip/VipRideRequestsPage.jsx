import { useMemo, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useVip } from '@/hooks/useVip';
import styles from './VipModulePages.module.css';

export default function VipRideRequestsPage() {
  const { bookings: vipRideRequests, loading } = useVip();
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => ({
    total: vipRideRequests.length,
    requested: vipRideRequests.filter((item) => item.status === 'requested').length,
    progress: vipRideRequests.filter((item) => item.status === 'progress').length,
    completed: vipRideRequests.filter((item) => item.status === 'completed').length,
    escort: vipRideRequests.filter((item) => item.escortRequired).length,
  }), [vipRideRequests]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>VIP Ride Requests</h1>
          <p className={styles.subtitle}>Manage and assign VIP ride requests</p>
        </div>
      </header>

      <div className={`${styles.metricsGrid} ${styles.metricsGridFive}`}>
        <Metric label="Total Requests" value={stats.total} />
        <Metric label="Requested" value={stats.requested} />
        <Metric label="In Progress" value={stats.progress} />
        <Metric label="Completed Today" value={stats.completed} />
        <Metric label="Escort Required" value={stats.escort} />
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>All Ride Requests</h2>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'rider', label: 'Rider', render: (_, row) => row.rider?.full_name || '-' },
            { key: 'pickup_address', label: 'Pickup', render: (value) => truncate(value) },
            { key: 'destination_address', label: 'Destination', render: (value) => truncate(value) },
            { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
            { key: 'driver', label: 'Driver', render: (_, row) => row.driver?.full_name || <span className={styles.muted}>Unassigned</span> },
            { key: 'escortRequired', label: 'Escort', render: (value) => value ? 'Yes' : 'No' },
            { key: 'fare', label: 'Fare', render: (value) => value ? <span className={styles.fare}>{formatCurrency(value)}</span> : '-' },
            { key: 'created_at', label: 'Date', render: (value) => formatDate(value) },
            { key: 'actions', label: '', render: (_, row) => <button className={styles.linkButton} onClick={() => setSelected(row)}>View</button> },
          ]}
          data={vipRideRequests}
          loading={loading}
          emptyMessage="No VIP ride requests found."
          searchPlaceholder="Search by rider, driver, address..."
          filterOptions={[{ value: 'all', label: 'All Statuses' }]}
          filterValue="all"
          onFilterChange={() => {}}
        />
      </section>

      {selected && (
        <RideDrawer
          ride={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function RideDrawer({ ride, onClose }) {
  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Ride Request Details</h2>
          <button className={styles.iconButton} onClick={onClose}>x</button>
        </div>

        <DetailCard title="Rider Information" rows={[
          ['Name', ride.rider?.full_name],
          ['Phone', ride.rider?.phone],
          ['Email', ride.rider?.email],
          ['Rating', ride.driver?.rating || '3.1'],
        ]} />
        <DetailCard title="Trip Details" rows={[
          ['Pickup', ride.pickup_address],
          ['Destination', ride.destination_address],
          ['Booking Type', ride.booking_type],
          ['Trip Type', ride.tripType],
          ['Special Requests', ride.special_requests || '-'],
        ]} />
        <div className={styles.detailCard}>
          <h3 className={styles.detailTitle}>Driver Matching</h3>
          <StatusBadge status={ride.driver_id ? 'assigned' : 'requested'} label={ride.driver_id ? 'Assigned' : 'Automatic matching'} />
        </div>
        {ride.escortRequired && (
          <DetailCard title="Escort Information" rows={[
            ['Escort Type', ride.escortType],
            ['Rider Notes', ride.escortNotes],
          ]} />
        )}
        <DetailCard title="Monitoring" rows={[
          ['Status', ride.status],
          ['Priority', ride.priority],
        ]} />
      </aside>
    </>
  );
}

function DetailCard({ title, rows }) {
  return (
    <div className={styles.detailCard}>
      <h3 className={styles.detailTitle}>{title}</h3>
      {rows.map(([label, value]) => (
        <div className={styles.detailRow} key={label}>
          <span>{label}</span>
          <strong>{value || '-'}</strong>
        </div>
      ))}
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

function truncate(value = '') {
  return value.length > 34 ? `${value.slice(0, 34)}...` : value;
}
