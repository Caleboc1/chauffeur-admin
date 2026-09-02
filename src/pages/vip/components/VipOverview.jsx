import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVip } from '@/hooks/useVip';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import { MoreVertical, UserPlus, Map, Eye } from 'lucide-react';
import styles from './VipOverview.module.css';

export default function VipOverview() {
  const { bookings, vehicles, vipDrivers, loading } = useVip();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  if (loading) return <div>Loading...</div>;

  const activeBookings = bookings.filter(b => b.status === 'progress');
  const pendingAssignments = bookings.filter(b => b.status === 'pending' && !b.driver_id);
  const availableDrivers = vipDrivers.filter(d => d.status === 'active' && !activeBookings.some(b => b.driver_id === d.id));
  const availableVehicles = vehicles.filter(v => v.status === 'available');

  const combined = [...pendingAssignments, ...bookings.filter(b => b.status !== 'pending' || b.driver_id)];

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  const handleMenuClick = (e, item) => {
    e.stopPropagation();
    if (openMenu === item.id) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, left: Math.max(8, rect.left + rect.width - 160) });
    setOpenMenu(item.id);
  };

  const getDropdownAction = (row) => {
    if (row.status === 'pending' && !row.driver_id) return { icon: UserPlus, label: 'Assign Driver' };
    if (row.status === 'progress') return { icon: Map, label: 'View Live Map' };
    return { icon: Eye, label: 'View Details' };
  };

  const columns = [
    {
      key: 'rider',
      label: 'Rider',
      render: (_, row) => row.rider?.full_name || 'Unknown',
    },
    {
      key: 'pickup_address',
      label: 'Pickup',
    },
    {
      key: 'destination_address',
      label: 'Dropoff',
    },
    {
      key: 'booking_type',
      label: 'Type',
      render: (v) => (
        <StatusBadge status={v === 'instant' ? 'in_progress' : 'scheduled'} label={v} />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const map = { pending: 'pending', confirmed: 'approved', in_progress: 'in_progress', completed: 'completed' };
        return <StatusBadge status={map[v] || v} />;
      },
    },
    {
      key: 'date',
      label: 'Date',
      render: (_, row) => {
        if (row.scheduled_at) return formatDate(row.scheduled_at);
        if (row.started_at) return formatDate(row.started_at);
        return '—';
      },
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (_, row) => row.driver?.full_name || '—',
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (_, row) => row.vehicle?.plate_number || '—',
    },
    {
      key: 'actions',
      label: '',
      width: '3rem',
      render: (_, row) => (
        <button className={styles.menuButton} onClick={(e) => handleMenuClick(e, row)}>
          <MoreVertical size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className={styles.overview}>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Active VIP Bookings</span>
          <span className={styles.metricValue}>{activeBookings.length}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Pending Assignment</span>
          <span className={styles.metricValue}>{pendingAssignments.length}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Available VIP Drivers</span>
          <span className={styles.metricValue}>{availableDrivers.length}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Available VIP Vehicles</span>
          <span className={styles.metricValue}>{availableVehicles.length}</span>
        </div>
      </div>

      <div className={styles.tablePanel}>
        <h2 className={styles.panelTitle}>All VIP Bookings</h2>
        <DataTable
          columns={columns}
          data={combined}
          emptyMessage="No bookings found."
          showSearch={false}
          pageSize={10}
        />
      </div>

      {openMenu && (
        <div className={styles.dropdownOverlay} onClick={() => setOpenMenu(null)} />
      )}
      {openMenu && (
        <div className={styles.actionDropdown} style={{ top: menuPosition.top, left: menuPosition.left }}>
          {(() => {
            const row = combined.find(b => b.id === openMenu);
            if (!row) return null;
            const action = getDropdownAction(row);
            const Icon = action.icon;
            return (
              <button onClick={() => { navigate(`/vip/bookings/${openMenu}`); setOpenMenu(null); }}>
                <Icon size={14} className={styles.dropdownIcon} />
                {action.label}
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
}
