import { useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { vipDowngradeRequests } from './vipAdminData';
import styles from './VipModulePages.module.css';

export default function VipDowngradeRequestsPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>VIP Downgrade Requests</h1>
          <p className={styles.subtitle}>Manage requests from VIP drivers wishing to return to Regular Driver status</p>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <Metric label="Total Requests" value={vipDowngradeRequests.length} />
        <Metric label="Pending" value={vipDowngradeRequests.filter((item) => item.status === 'pending').length} />
        <Metric label="Approved" value={vipDowngradeRequests.filter((item) => item.status === 'approved').length} />
        <Metric label="Rejected" value={vipDowngradeRequests.filter((item) => item.status === 'rejected').length} />
      </div>

      <section className={styles.panel}>
        <DataTable
          columns={[
            { key: 'driverName', label: 'Driver Name', render: (_, row) => <div>{row.driverName}<br /><span className={styles.muted}>{row.driverId}</span></div> },
            { key: 'requestDate', label: 'Request Date', render: (value) => formatDate(value) },
            { key: 'reason', label: 'Reason', render: (value) => value.length > 62 ? `${value.slice(0, 62)}...` : value },
            { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
            { key: 'actions', label: '', render: (_, row) => <button className={styles.linkButton} onClick={() => setSelected(row)}>View</button> },
          ]}
          data={vipDowngradeRequests}
          searchPlaceholder="Search by driver or vehicle..."
          filterOptions={[{ value: 'all', label: 'All Inspections' }]}
          filterValue="all"
          onFilterChange={() => {}}
        />
      </section>

      {selected && <DowngradeModal request={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DowngradeModal({ request, onClose }) {
  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Downgrade Request Details</h2>
          <button className={styles.iconButton} onClick={onClose}>x</button>
        </div>
        <div className={styles.modalBody}>
          <section>
            <h3 className={styles.detailTitle}>Driver Information</h3>
            <p><strong>Name:</strong> {request.driverName}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Phone:</strong> {request.phone}</p>
          </section>
          <section>
            <h3 className={styles.detailTitle}>Reason For Downgrade</h3>
            <p>{request.reason}</p>
          </section>
          <section>
            <h3 className={styles.detailTitle}>Current VIP Performance</h3>
            <p>VIP Trips: <strong>{request.vipTrips}</strong> &nbsp; Rating: <strong>{request.rating}</strong> &nbsp; Status: <StatusBadge status="pending" label="Pending Downgrade" /></p>
            <p className={styles.muted}>Active VIP Rides: {request.activeVipRides}</p>
            <p className={styles.muted}>Upcoming VIP Bookings: {request.upcomingVipBookings}</p>
          </section>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary">Approve Downgrade</Button>
          <Button variant="danger">Reject Request</Button>
        </div>
      </div>
    </>
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
