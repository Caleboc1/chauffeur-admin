import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatId } from '@/utils/formatters';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ActionMenu from '@/components/ui/ActionMenu';
import { UserPlus } from 'lucide-react';
import { adminApi, mapAdminUser } from '@/lib/adminApi';
import AddDriverModal from './AddDriverModal';
import styles from './DriversPage.module.css';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function loadDrivers() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUsers({ userType: 'driver', limit: 100 });
        if (!cancelled) setDrivers(data.map(mapAdminUser));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDrivers();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    {
      key: 'full_name',
      label: 'Driver',
      render: (val, row) => (
        <div className={styles.driverCell}>
          {row.selfie_url ? (
            <img src={row.selfie_url} alt="" className={styles.driverAvatar} />
          ) : (
            <div className={styles.driverAvatar}>{val.charAt(0)}</div>
          )}
          <div className={styles.driverInfo}>
            <span className={styles.driverName}>{val}</span>
            <span className={styles.driverId}>{formatId(row.id, 'driver')}</span>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (_, row) => row.vehicle ? (
        <div>
          <div className={styles.vehicleMake}>{row.vehicle.make || row.vehicle.model || 'Vehicle'}</div>
          <div className={styles.vehiclePlate}>{row.vehicle.plate_number || row.vehicle.plateNumber || '—'}</div>
        </div>
      ) : <span className={styles.noVehicle}>—</span>
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => val > 0 ? val.toFixed(1) : '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (val) => formatDate(val)
    },
    {
      key: 'actions',
      label: '',
      width: '3rem',
      render: (_, row) => (
        <ActionMenu actions={[
          { label: 'View Profile', onClick: () => navigate(`/drivers/${row.id}`) },
          { label: 'Suspend Driver', danger: true, onClick: () => { setSuspendTarget(row); setSuspendModalOpen(true); } },
          { label: 'View Trips', onClick: () => navigate(`/rides?driverId=${row.id}`) },
        ]} />
      )
    }
  ];

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === 'active').length,
    pending: drivers.filter(d => d.verification_status === 'pending').length,
    suspended: drivers.filter(d => d.status === 'suspended').length,
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Registered Drivers</h1>
          <p className={styles.subtitle}>Manage all registered drivers and their compliance status</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setAddModalOpen(true)}>
          Add Driver
        </Button>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <label>Total Registered</label>
          <h3>{stats.total}</h3>
        </div>
        <div className={styles.statCard}>
          <label>Active Fleet</label>
          <h3 className={styles.successText}>{stats.active}</h3>
        </div>
        <div className={styles.statCard}>
          <label>Pending Review</label>
          <h3 className={styles.warningText}>{stats.pending}</h3>
        </div>
        <div className={styles.statCard}>
          <label>Suspended</label>
          <h3 className={styles.dangerText}>{stats.suspended}</h3>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {error && <div className={styles.noVehicle}>{error}</div>}
        <DataTable
          columns={columns}
          data={drivers}
          loading={loading}
          searchPlaceholder="Search by name, phone or email..."
        />
      </div>

      {suspendModalOpen && (
        <div className={styles.modalOverlay} onClick={() => { setSuspendModalOpen(false); setSuspendReason(''); }}>
          <div className={styles.suspendModal} onClick={e => e.stopPropagation()}>
            <h3>Suspend Driver</h3>
            <p>
              Are you sure you want to suspend <strong>{suspendTarget?.full_name}</strong>?
              This will prevent them from accepting new rides.
            </p>
            <textarea
              placeholder="Reason for suspension (required)"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => { setSuspendModalOpen(false); setSuspendReason(''); }}
              >
                Cancel
              </button>
              <button
                className={styles.suspendConfirmBtn}
                disabled={!suspendReason.trim()}
                onClick={() => {
                  alert(`Suspension reason recorded: ${suspendReason.trim()}`);
                  setSuspendModalOpen(false);
                  setSuspendReason('');
                  setSuspendTarget(null);
                }}
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      <AddDriverModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
